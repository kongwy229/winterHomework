function getError(action, option, xhr) {
  let msg;
  if (xhr.response) {
    msg = `${xhr.response.error || xhr.response}`;
  } else if (xhr.responseText) {
    msg = `${xhr.responseText}`;
  } else {
    msg = `fail to post ${action} ${xhr.status}`;
  }

  const err = new Error(msg);
  err.status = xhr.status;
  err.method = 'post';
  err.url = action;
  return err;
}

function getBody(xhr) {
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export default function upload(option) {
  if (typeof XMLHttpRequest === 'undefined') {
    return;
  }

  const xhr = new XMLHttpRequest();
  const action = option.action; // 请求地址

  if (xhr.upload) {
    //该属性返回一个对象，可以观察到该对象以监控上传进度
    xhr.upload.onprogress = function progress(e) {
      if (e.total > 0) {
        e.percent = e.loaded / e.total * 100; // 计算上传进度
      }
      option.onProgress(e); // 触发文件上传进度变化事件
    };
  }

  const formData = new FormData();

  if (option.data) { // 把上传时附带的参数复制到formData中
    Object.keys(option.data).forEach(key => {
      formData.append(key, option.data[key]);
    });
  }

  // 把文件放到请求体内
  //FormData.set 和 append() 的区别在于，如果指定的键已经存在， 
  // FormData.set 会使用新值覆盖已有的值，而 append() 会把新值添加到已有值集合的后面。
  formData.append(option.filename, option.file, option.file.name);

  xhr.onerror = function error(e) {
    option.onError(e);
  };

  xhr.onload = function onload() {
    if (xhr.status < 200 || xhr.status >= 300) {
      return option.onError(getError(action, option, xhr));
    }

    option.onSuccess(getBody(xhr));
  };

  xhr.open('post', action, true); // post 方法 异步

  if (option.withCredentials && 'withCredentials' in xhr) {
    xhr.withCredentials = true; //携带cookie
  }

  const headers = option.headers || {}; // 配置请求头

  for (let item in headers) {
    if (headers.hasOwnProperty(item) && headers[item] !== null) {
      xhr.setRequestHeader(item, headers[item]);
    }
  }
  xhr.send(formData); // 发送请求
  return xhr;
}

