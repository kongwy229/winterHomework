self.addEventListener('message', function (e) {
    var data = e.data;
    console.log('子线程收到的数据',data)
    switch (data.cmd) {
      case 'start':
        this.setTimeout(()=>{
            self.postMessage('WORKER STARTED: ' + data.msg);
        },3000)
        break;
      case 'stop':
        self.postMessage('WORKER STOPPED: ' + data.msg);
        self.close(); // Terminates the worker.
        break;
      default:
        self.postMessage('Unknown command: ' + data.msg);
    };
  }, false);