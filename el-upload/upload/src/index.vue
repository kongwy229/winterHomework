<script>
import UploadList from './upload-list';
import Upload from './upload';
import ElProgress from 'element-ui/packages/progress';
import Migrating from 'element-ui/src/mixins/migrating';

function noop() {}

export default {
  name: 'ElUpload',

  mixins: [Migrating],

  components: {
    ElProgress,
    UploadList,
    Upload
  },

  provide() {
    return {
      uploader: this // 用于透传当前的组件，让子组件可以访问到数据
    };
  },

  inject: {
    elForm: {
      default: ''
    }
  },

  props: {
    action: { // 必传 ，上传地址
      type: String,
      required: true
    },
    headers: { // 上传的请求头部
      type: Object,
      default() {
        return {};
      }
    },
    data: Object, // 上传时附带的参数
    multiple: Boolean, // 是否支持多选文件
    name: { // 上传时文件字段名
      type: String,
      default: 'file'
    },
    drag: Boolean, // 是否启用拖拽上传
    dragger: Boolean,
    withCredentials: Boolean, // 是否携带cookie
    showFileList: { // 是否显示已上传文件列表（感觉叫做已选文件列表更合适）
      type: Boolean,
      default: true
    },
    accept: String, // 文件上传的文件类型
    type: {
      type: String,
      default: 'select'
    },
    beforeUpload: Function, // 上传文件之前的钩子，false/reject可停止上传到服务器
    beforeRemove: Function, // 删除文件之前的钩子，同上
    onRemove: { // 文件列表移除文件后的钩子 （file,fileList）
      type: Function,
      default: noop
    },
    onChange: {// 文件状态改变后的钩子（file,fileList）
      type: Function,
      default: noop
    },
    onPreview: { // 点击文件列表中已上传文件后的钩子（file）
      type: Function
    },
    onSuccess: { // 文件上传成功后（res,file,fileList）
      type: Function,
      default: noop
    },
    onProgress: { // 文件上传中的钩子（event,file,fileList）
      type: Function,
      default: noop
    },
    onError: { // 文件上传失败时的钩子
      type: Function,
      default: noop
    },
    fileList: { // 文件列表
      type: Array,
      default() {
        return [];
      }
    },
    autoUpload: { // 是否在选取文件后立即上传
      type: Boolean,
      default: true
    },
    listType: { // 文件列表类型
      type: String,
      default: 'text' // text,picture,picture-card
    },
    httpRequest: Function, // 自定义上传实现
    disabled: Boolean,//是否禁用
    limit: Number,// 最大允许的上传个数
    onExceed: { // 超过个数时的钩子 （files, fileList）
      type: Function,
      default: noop
    }
  },

  data() {
    return {
      uploadFiles: [],
      dragOver: false,
      draging: false,
      tempIndex: 1
    };
  },

  computed: {
    uploadDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    }
  },

  watch: {
    listType(type) {
      // 为了没有上传到服务器的文件也可以本地预览
      if (type === 'picture-card' || type === 'picture') {
        this.uploadFiles = this.uploadFiles.map(file => {
          if (!file.url && file.raw) { // 文件没有url 只有内存数据时
            try {
              file.url = URL.createObjectURL(file.raw); // 根据内存数据创建url blob://开头  JS入门时讲过
            } catch (err) {
              console.error('[Element Error][Upload]', err);
            }
          }
          return file;
        });
      }
    },
    fileList: {
      immediate: true,
      handler(fileList) {
        // props中文件合并进来
        this.uploadFiles = fileList.map(item => {
          item.uid = item.uid || (Date.now() + this.tempIndex++); // 生成唯一的uis
          item.status = item.status || 'success'; // 默认读进来的文件数据状态为 成功（文件已上传过）
          return item;
        });
      }
    }
  },

  methods: {
    // 上传组件 文件获取到之后触发的钩子
    handleStart(rawFile) {
      rawFile.uid = Date.now() + this.tempIndex++;
      let file = {
        status: 'ready', // 初始状态是ready
        name: rawFile.name,
        size: rawFile.size,
        percentage: 0, // 还没有上传到服务器上，进度为0
        uid: rawFile.uid, // 自带的UID
        raw: rawFile
      };
      // 生成特定格式的对象

      if (this.listType === 'picture-card' || this.listType === 'picture') {
        try {
          file.url = URL.createObjectURL(rawFile); // 需要预览的时候就生成 blob://
        } catch (err) {
          console.error('[Element Error][Upload]', err);
          return;
        }
      }

      this.uploadFiles.push(file); // 加入到文件列表
      this.onChange(file, this.uploadFiles); // 触发状态改变的钩子函数
    },
    handleProgress(ev, rawFile) {
      const file = this.getFile(rawFile);
      this.onProgress(ev, file, this.uploadFiles);
      file.status = 'uploading'; // 把状态变化成 uploading
      file.percentage = ev.percent || 0;
    },
    handleSuccess(res, rawFile) {
      const file = this.getFile(rawFile);

      if (file) {
        file.status = 'success';
        file.response = res;

        this.onSuccess(res, file, this.uploadFiles);
        this.onChange(file, this.uploadFiles);
      }
    },
    handleError(err, rawFile) {
      const file = this.getFile(rawFile);
      const fileList = this.uploadFiles;

      file.status = 'fail';

      fileList.splice(fileList.indexOf(file), 1);

      this.onError(err, file, this.uploadFiles);
      this.onChange(file, this.uploadFiles);
    },
    handleRemove(file, raw) {
      if (raw) {
        file = this.getFile(raw); // 获取标准文件
      }
      let doRemove = () => {
        this.abort(file); // 终止读取操作
        let fileList = this.uploadFiles;
        fileList.splice(fileList.indexOf(file), 1); // 从文件列表删除
        this.onRemove(file, fileList); // 文件移除后的钩子
      };

      if (!this.beforeRemove) { //没有配置移除前的回调就进行默认移除处理
        doRemove();
      } else if (typeof this.beforeRemove === 'function') {
        const before = this.beforeRemove(file, this.uploadFiles);
        if (before && before.then) {
          before.then(() => {
            doRemove();
          }, noop);
        } else if (before !== false) {
          doRemove();
        }
      }
    },
    // 源文件到格式化文件对象的转化
    getFile(rawFile) {
      let fileList = this.uploadFiles;
      let target;
      fileList.every(item => {
        target = rawFile.uid === item.uid ? item : null;
        return !target;
      });
      return target;
    },
    abort(file) {
      //该方法可以取消 FileReader 的读取操作，触发之后 readyState 为已完成（DONE）
      this.$refs['upload-inner'].abort(file); // 终止上传
    },
    clearFiles() {
      this.uploadFiles = [];
    },
    submit() {
      this.uploadFiles
        .filter(file => file.status === 'ready')
        .forEach(file => {
          this.$refs['upload-inner'].upload(file.raw);
        });
    },
    getMigratingConfig() {
      return {
        props: {
          'default-file-list': 'default-file-list is renamed to file-list.',
          'show-upload-list': 'show-upload-list is renamed to show-file-list.',
          'thumbnail-mode': 'thumbnail-mode has been deprecated, you can implement the same effect according to this case: http://element.eleme.io/#/zh-CN/component/upload#yong-hu-tou-xiang-shang-chuan'
        }
      };
    }
  },

  beforeDestroy() {
    this.uploadFiles.forEach(file => {
      // 组件销毁时释放 之前创建的临时URL 对象
      if (file.url && file.url.indexOf('blob:') === 0) {
        URL.revokeObjectURL(file.url);
      }
    });
  },

  render(h) {
    let uploadList;

    if (this.showFileList) { // 展示上传列表
      uploadList = (
        <UploadList
          disabled={this.uploadDisabled}
          listType={this.listType}
          files={this.uploadFiles}
          on-remove={this.handleRemove}
          handlePreview={this.onPreview}>
          {
            (props) => {
              if (this.$scopedSlots.file) {
                return this.$scopedSlots.file({
                  file: props.file
                });
              }
            }
          }
        </UploadList>
      );
    }

    const uploadData = { // 上传组件的参数
      props: {
        type: this.type,
        drag: this.drag,
        action: this.action,
        multiple: this.multiple,
        'before-upload': this.beforeUpload,
        'with-credentials': this.withCredentials,
        headers: this.headers,
        name: this.name,
        data: this.data,
        accept: this.accept,
        fileList: this.uploadFiles,
        autoUpload: this.autoUpload,
        listType: this.listType,
        disabled: this.uploadDisabled,
        limit: this.limit,
        'on-exceed': this.onExceed,
        'on-start': this.handleStart,
        'on-progress': this.handleProgress,
        'on-success': this.handleSuccess,
        'on-error': this.handleError,
        'on-preview': this.onPreview,
        'on-remove': this.handleRemove,
        'http-request': this.httpRequest
      },
      ref: 'upload-inner' // 传入了一个ref 
    };
 
    const trigger = this.$slots.trigger || this.$slots.default; // ？ default默认插槽，非具名插槽的子元素都算
    const uploadComponent = <Upload {...uploadData}>{trigger}</Upload>;

    return (
      <div>
      // 如果类型是..就把上传列表放在前面，否则放在后面
        { this.listType === 'picture-card' ? uploadList : ''} 
        {
          this.$slots.trigger // 有自定义触发文件选择框的dom就使用自定义，否则使用默认
            ? [uploadComponent, this.$slots.default] 
            : uploadComponent // <upload {...uploadData}>{trigger}</upload>
        }
        {this.$slots.tip}
        { this.listType !== 'picture-card' ? uploadList : ''}
      </div>
    );
  }
};
</script>
