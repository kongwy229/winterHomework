import Upload from './src';

/* istanbul ignore next */
Upload.install = function(Vue) {
  Vue.component(Upload.name, Upload); //把组件挂载在vue上
};

export default Upload;
