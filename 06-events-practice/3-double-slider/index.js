/**
 * 
 * By Ivan Silantev 
 * 
 */

export default class DoubleSlider {
  element = null;
  subElements = {};
  dragging = {};

  constructor({
  min = 100,
  max = 600,
  selected = { from: 400, to: 600 },
  formatValue = value => '$' + value
    } = {}) {
    this.min = min;
    this.max = max;
    this.selected = selected;
    this.formatValue = formatValue;

    this.render();
    }

  get template() {
    const { from, to } = this.selected;
    return `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(from)}</span>
        <div data-element="inner" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress"></span>
          <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
          <span data-element="thumbRight" class="range-slider__thumb-right"></span>
        </div>
        <span data-element="to">${this.formatValue(to)}</span>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template.trim();
    this.element = wrapper.firstElementChild;

    this.subElements = {
      from: this.element.querySelector('[data-element="from"]'),
      to: this.element.querySelector('[data-element="to"]'),
      inner: this.element.querySelector('[data-element="inner"]'),
      progress: this.element.querySelector('[data-element="progress"]'),
      thumbLeft: this.element.querySelector('[data-element="thumbLeft"]'),
      thumbRight: this.element.querySelector('[data-element="thumbRight"]'),
    };

    this.initThumbs();
    this.initEventListeners();
  }

  initThumbs() {
    const rangeTotal = this.max - this.min;
    const left = ((this.selected.from - this.min) / rangeTotal) * 100;
    const right = ((this.max - this.selected.to) / rangeTotal) * 100;

    this.subElements.thumbLeft.style.left = `${left}%`;
    this.subElements.thumbRight.style.right = `${right}%`;
    this.subElements.progress.style.left = `${left}%`;
    this.subElements.progress.style.right = `${right}%`;
  }

  initEventListeners() {
    const { thumbLeft, thumbRight } = this.subElements;

    thumbLeft.addEventListener('pointerdown', event => this.onPointerDown(event, true));
    thumbRight.addEventListener('pointerdown', event => this.onPointerDown(event, false));
  }

  onPointerDown(event, isLeft) {
    event.preventDefault();
    this.dragging = { isLeft };
    document.body.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

    onPointerMove = event => {
    const { inner, thumbLeft, thumbRight, progress } = this.subElements;

    if (!inner) return;

    const rect = inner.getBoundingClientRect();
    const shift = event.clientX - rect.left;
    const range = rect.width;
    let percent = (shift / range) * 100;
    percent = Math.max(0, Math.min(100, percent));

    let left = parseFloat(thumbLeft.style.left || '0');
    let right = 100 - parseFloat(thumbRight.style.right || '0');

    if (this.dragging.isLeft) {
        if (percent > right) percent = right;
        thumbLeft.style.left = `${percent}%`;
        progress.style.left = `${percent}%`;
    } else {
        if (percent < left) percent = left;
        const rightOffset = 100 - percent;
        thumbRight.style.right = `${rightOffset}%`;
        progress.style.right = `${rightOffset}%`;
    }

    this.update();
    };

  onPointerUp = () => {
    document.body.classList.remove('range-slider_dragging');
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
    this.dispatchEvent();
  };

  update() {
    const { from, to, thumbLeft, thumbRight } = this.subElements;

    const rangeTotal = this.max - this.min;
    const left = parseFloat(thumbLeft.style.left);
    const right = 100 - parseFloat(thumbRight.style.right);

    const fromValue = Math.round(this.min + (rangeTotal * left) / 100);
    const toValue = Math.round(this.min + (rangeTotal * right) / 100);

    this.selected = { from: fromValue, to: toValue };
    from.textContent = this.formatValue(fromValue);
    to.textContent = this.formatValue(toValue);
  }

  dispatchEvent() {
    this.element?.dispatchEvent(
      new CustomEvent('range-select', {
        detail: this.selected,
        bubbles: true,
      })
    );
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
