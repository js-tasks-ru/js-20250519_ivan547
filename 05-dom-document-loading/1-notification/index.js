/**
 * 
 * By Ivan Silantev 
 * 
 */

export default class NotificationMessage {
  static activeNotification = null;

  constructor(message = '', {
    duration = 2000,
    type = 'success'
  } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.element = null;
    this.timerId = null;

    this.render(); 
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }

  show(parent = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    parent.append(this.element);
    NotificationMessage.activeNotification = this;

    this.timerId = setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }    
  }

  destroy() {
    this.remove();
    clearTimeout(this.timerId);
  }
}
