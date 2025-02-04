
let referenceId = 0;
const TIMEOUT = 2000;

export class FakeSocket {
  #messageCounter = 0;

  constructor() {
    this.messageCb;
    this.interval;
    this.start();  
    referenceId++;
  }

  set onmessage(cb) {
    this.messageCb = cb;
  }

  close() {
    console.debug('Disconnected');
    clearInterval(this.interval);
    this.messageCb = null;
  }

  stop() {
    console.debug('Paused');
    clearInterval(this.interval);
  }

  start() {
    console.debug('Connected');
    this.interval = setInterval(() => {
      this.messageCb && this.messageCb(`Socket message ${++this.#messageCounter} - FakeSocket${referenceId}`);
    }, TIMEOUT);
  }
}