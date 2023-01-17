# el-upload源码

## index.vue

核心是一个文件列表 uploadFiles数组

每个元素的格式为

```jsx
				status: 'ready', 
				// ready(已读到内存中，未向服务器上传) 
				// uploading （开始向服务器上传）
				// success （上传成功） 
        name: rawFile.name,
        size: rawFile.size,
        percentage: 0, // 还没有上传到服务器上，进度为0
        uid: rawFile.uid, // 源文件自带的UID
        raw: rawFile // 读进来的源文件
				url: // 未上传的时候是URL.createObjectURL(rawFile)生成的blob://
```

这个组件的DOM结构为

```jsx
const trigger = this.$slots.trigger || this.$slots.default; //default默认插槽，包括非具名插槽的子元素
const uploadComponent = <Upload {...uploadData}>{trigger}</Upload>;      
		<div>
      // 如果类型是picture-card就把上传列表放在前面，否则放在后面
        { this.listType === 'picture-card' ? uploadList : ''} 
        {
          this.$slots.trigger // 有自定义触发文件选择框的dom就使用自定义，否则使用默认upload组件
            ? [uploadComponent, this.$slots.default] // 还有其他内容就展示即可
            : uploadComponent // <upload {...uploadData}>{trigger}</upload>
        }
        {this.$slots.tip}
        { this.listType !== 'picture-card' ? uploadList : ''}
      </div>
```

## upload组件

1. dom结构

```jsx
data里面绑定了click: handleClick,keydown: handleKeydown 两个事件，用于捕获插槽或者拖拽组件
的冒泡到这层的事件
handleClick() {
      if (!this.disabled) {
        this.$refs.input.value = null;
        this.$refs.input.click(); // input.click 打开文件选择器
      }
    },
    handleKeydown(e) {
      if (e.target !== e.currentTarget) return;
      if (e.keyCode === 13 || e.keyCode === 32) {
        this.handleClick();
      }
    }

<div {...data} tabindex="0" >
        {
          drag // 如果是可拖拽的就显示拖拽组件 把子元素原封不动的给这个组件
            ? <upload-dragger disabled={disabled} on-file={uploadFiles}>{this.$slots.default}</upload-dragger>
            : this.$slots.default // 展示用户自定义的dom结构
        }
        // 真正的上传按钮
        <input class="el-upload__input" type="file" ref="input" name={name} on-change={handleChange} multiple={multiple} accept={accept}></input>
      </div>
```

1. 当input触发change事件时会调用uploadFiles函数

2.1 判断文件选择的个数，超过则触发 **onExceed回调**

2.2 遍历每个文件源文件（rawFile）生成本组件内需要的标准文件格式（初始化状态为success,并给源文件生成唯一的uid,如果是**预览类型**，则使用URL.createObjectURL(rawFile)生成blob://格式的url），push 到index.vue里的uploadFiles中，同时触发全局的**状态变化回调onChange**。

2.3  在上述遍历每个文件，并且文件初始化标准格式（存到uploadFiles）之后，**如果需要立刻上传**就触发upload函数，首先把input的value置空 （我认为应该是为了下次上传不混淆)

```jsx
this.$refs.input.value = null;
```

如果有**上传前回调函数（beforeUpload）**就调用（没有就直接调用post），需要其返回一个promise, promise resolve时规范文件数据，然后调用post进行上传，promise reject时就进行onRemove函数(准备从uploadFiles中删除当前的文件), 如果有**删除前回调**就调用，回调resolve时才继续调用doRemove（没有就可以直接调用），删除前首先会终止文件的读取操作

```jsx
//该方法可以取消 FileReader 的读取操作，触发之后 readyState 为已完成（DONE）
      this.$refs['upload-inner'].abort(file); // 终止上传 
其实这里的终止主要是为了在uploadList组件中删除时使用，那时候可能还没有去读取完毕就要进行删除，
这里使用的时候其实以及读取完毕了
```

之后从文件列表中删除，最后调用**删除后回调**

2.4  post函数是用于调用上传方法的，首先会组装相关需要的参数

```jsx
        headers: this.headers,
        withCredentials: this.withCredentials,
        file: rawFile,
        data: this.data,
        filename: this.name,
        action: this.action,
```

以及一些回调函数，**onProgress、onSuccess、onError**

然后调用**httpRequest**（默认的在下一部分进行解析，也可以用户自定义） 进行请求的发送，会保存这个请求的引用req。这时候会生成一个reqs对象，key为 文件的uid ， value是文件上传的请求对象 req ，用于映射,在请求成功（onSuccess执行后）或者失败后（onError执行后）会删除对应的映射。

2.5  如果不是自动上传 ，用户可以手动调用 （通过ref）index.vue的submit方法进行其他时间上传

```jsx
this.$refs.upload.submit();
```

submit（index.vue）中会过滤出ready状态的文件，调用upload.vue的upload方法手动上传，后续和2.3保持一致

```jsx
this.uploadFiles
        .filter(file => file.status === 'ready')
        .forEach(file => {
          this.$refs['upload-inner'].upload(file.raw);
        });
```

## 默认的上传方法：

1. new一个XMLHttpRequest对象xhr（先判断是否存在）
2. 配置xhr的回调函数： 
    
    upload.onprogress用于计算上传进度
    
    onerror用于处理上传错误
    
    onload用于处理请求返回
    
3. new FormData生成请求体formData：

      把用户配置的请求体数据 append

      把文件数据append到请求体中，其中

```
formData.append(name, value);
formData.append(name, value, filename);

name：value 中包含的数据对应的表单名称。
value：表单的值。可以是USVString 或 Blob (包括子类型，如 File)。

filename 可选：传给服务器的文件名称 (一个 USVString), 当一个 Blob 或 File 被作为第二个参数的时候， Blob 对象的默认文件名是 "blob"。 File 对象的默认文件名是该文件的名称。
```

1. 使用xhr.setRequestHeader 配置请求头信息
2. 配置携带cookie xhr.withCredentials = true;
3. xhr.open('post', action, true) 设置请求方法为post  请求地址 
4. xhr.send发送请求到服务器
5. 返回xhr对象用于进行文件和对应请求的管理。

## upload-dragger组件

1. dom结构

```jsx
  <div
    class="el-upload-dragger"
    :class="{
      'is-dragover': dragover
    }"
    @drop.prevent="onDrop"
    @dragover.prevent="onDragover"
    @dragleave.prevent="dragover = false"
  >
    <slot></slot>
  </div>
```

组件数据只有一个dragover: false

在拖拽到当前dom时会触发dragover事件，把dragover变为true

在dom内拖拽放开鼠标会触发drop事件

1. this.dragover = false;
2. 如果有**accept（可接受文件类型），就进行过滤，**没有就直接发送file事件给upload

```jsx
this.$emit('file', e.dataTransfer.files);
```

过滤的步骤如下

```jsx
this.$emit('file', [].slice.call(e.dataTransfer.files).filter(file => {
          const { type, name } = file;
          const extension = name.indexOf('.') > -1 // 取文件的后缀名
            ? `.${ name.split('.').pop() }`
            : '';
          const baseType = type.replace(/\/.*$/, ''); // 取文件的类型
          return accept.split(',') //匹配是否是可接受的文件
            .map(type => type.trim())
            .filter(type => type)
            .some(acceptedType => {
              if (/\..+$/.test(acceptedType)) {
                return extension === acceptedType;
              }
              if (/\/\*$/.test(acceptedType)) {
                return baseType === acceptedType.replace(/\/\*$/, '');
              }
              if (/^[^\/]+\/[^\/]+$/.test(acceptedType)) {
                return type === acceptedType;
              }
              return false;
            });
        }));
```

1. 该组件发送的file事件，会被upload组件的uploadFiles事件处理（具体可见上面upload组件的2）

## upload-list组件

主要用于展示文件列表uploadFiles,在index.vue中引用

```jsx
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
```

可以展示文件的基本信息，上传进度以及，通过按钮删除文件触发删除文件操作

这个组件主要是dom和class的处理，功能方面不复杂，就不再赘述。