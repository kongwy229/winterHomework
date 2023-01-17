<script>
import ajax from './ajax';
import UploadDragger from './upload-dragger.vue';

export default {
  inject: ['uploader'],
  components: {
    UploadDragger
  },
  props: {
    type: String,
    action: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'file'
    },
    data: Object,
    headers: Object,
    withCredentials: Boolean,
    multiple: Boolean,
    accept: String,
    onStart: Function,
    onProgress: Function,
    onSuccess: Function,
    onError: Function,
    beforeUpload: Function,
    drag: Boolean,
    onPreview: {
      type: Function,
      default: function() {}
    },
    onRemove: {
      type: Function,
      default: function() {}
    },
    fileList: Array,
    autoUpload: Boolean,
    listType: String,
    httpRequest: {
      type: Function,
      default: ajax // 没有自定义就是用ajax文件中的上传方法
    },
    disabled: Boolean,
    limit: Number,
    onExceed: Function
  },

  data() {
    return {
      mouseover: false,
      reqs: {}
    };
  },

  methods: {
    isImage(str) {
      return str.indexOf('image') !== -1;
    },
    handleChange(ev) { // 当选择的文件发生变化时
      const files = ev.target.files;

      if (!files) return;
      this.uploadFiles(files);
    },
    uploadFiles(files) {
      // 判断文件选择的个数
      if (this.limit && this.fileList.length + files.length > this.limit) {
        this.onExceed && this.onExceed(files, this.fileList);
        return;
      }

      // 转化为待传文件数组
      let postFiles = Array.prototype.slice.call(files);
      if (!this.multiple) { postFiles = postFiles.slice(0, 1); } // 不多选的时候只取第一个

      if (postFiles.length === 0) { return; }

      postFiles.forEach(rawFile => {
        this.onStart(rawFile);
        if (this.autoUpload) this.upload(rawFile); // 如果设置了选择后立刻上传就立刻上传文件
      });
    },
    upload(rawFile) {
      this.$refs.input.value = null; // 把input dom 的value置空

      if (!this.beforeUpload) { //没有设置上传前的钩子就直接post
        return this.post(rawFile);
      }

      const before = this.beforeUpload(rawFile); // 设置了上传前的钩子进行调用
      if (before && before.then) { // 判断返回
        before.then( // 函数返回的reslove 就进行上传 返回的reject 就 onRemove
          processedFile => { // 处理后的文件
          const fileType = Object.prototype.toString.call(processedFile);

          if (fileType === '[object File]' || fileType === '[object Blob]') { //如果是文件类型
            if (fileType === '[object Blob]') { // 如果是Blob文件
              processedFile = new File([processedFile], rawFile.name, {
                type: rawFile.type
              }); // 转化成File
            }
            for (const p in rawFile) {
              if (rawFile.hasOwnProperty(p)) {
                processedFile[p] = rawFile[p]; // 把源文件的key加上
              }
            }
            this.post(processedFile);
          } else {
            this.post(rawFile);
          }
        }, () => {
          this.onRemove(null, rawFile);
        });
      } else if (before !== false) {
        this.post(rawFile);
      } else {
        this.onRemove(null, rawFile);
      }
    },
    abort(file) {
      const { reqs } = this;
      if (file) {
        let uid = file;
        if (file.uid) uid = file.uid;
        if (reqs[uid]) {
          reqs[uid].abort();
        }
      } else {
        Object.keys(reqs).forEach((uid) => {
          if (reqs[uid]) reqs[uid].abort();
          delete reqs[uid];
        });
      }
    },
    post(rawFile) {
      const { uid } = rawFile;
      const options = { // 组装上传需要的参数
        headers: this.headers,
        withCredentials: this.withCredentials,
        file: rawFile,
        data: this.data,
        filename: this.name,
        action: this.action,
        onProgress: e => {
          this.onProgress(e, rawFile); // 触发进度变化事件，并把事件对象以及原文件传过去
        },
        onSuccess: res => {
          this.onSuccess(res, rawFile); // 上传成功时的钩子
          delete this.reqs[uid]; //把uid到req的映射删除掉
        },
        onError: err => {
          this.onError(err, rawFile);
          delete this.reqs[uid];
        }
      };
      const req = this.httpRequest(options); // 发送上传到服务器的请求
      this.reqs[uid] = req; // 文件UID 与请求的映射
      if (req && req.then) { // 如果请求有then 就触发then函数传入成功和失败的回调函数
        req.then(options.onSuccess, options.onError);
      }
    },
    handleClick() {
      if (!this.disabled) {
        this.$refs.input.value = null;
        this.$refs.input.click();
      }
    },
    handleKeydown(e) {
      if (e.target !== e.currentTarget) return;
      if (e.keyCode === 13 || e.keyCode === 32) {
        this.handleClick();
      }
    }
  },

  render(h) {
    let {
      handleClick,
      drag,
      name,
      handleChange,
      multiple,
      accept,
      listType,
      uploadFiles,
      disabled,
      handleKeydown
    } = this;

    const data = {
      class: {
        'el-upload': true
      },
      on: {
        click: handleClick,
        keydown: handleKeydown // 绑定对应的事件
      }
    };
    data.class[`el-upload--${listType}`] = true; // 根据用户选择的类型 加上对应的class
    return (
      <div {...data} tabindex="0" >
        {
          drag // 如果是可拖拽的就显示拖拽组件 把子元素原封不动的给这个组件
            ? <upload-dragger disabled={disabled} on-file={uploadFiles}>{this.$slots.default}</upload-dragger>
            : this.$slots.default
        }
        // 真正的上传按钮
        <input class="el-upload__input" type="file" ref="input" name={name} on-change={handleChange} multiple={multiple} accept={accept}></input>
      </div>
    );
  }
};
</script>
