class Tooltip {
  static instance;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;

    this.element = null;
    this._onPointerOver = this._onPointerOver.bind(this);
    this._onPointerOut = this._onPointerOut.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
  }

  initialize() {
    document.addEventListener('pointerover', this._onPointerOver);
    document.addEventListener('pointerout', this._onPointerOut);
  }

  render(text) {
    // Создание элемента при первом рендере
    if (!this.element) {
      const div = document.createElement('div');
      div.className = 'tooltip';
      Object.assign(div.style, {
        position: 'absolute',
        padding: '6px 10px',
        background: 'rgba(0, 0, 0, 0.75)',
        color: '#fff',
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: '1000',
      });

      this.element = div;
      document.body.appendChild(this.element);
    }

    this.element.textContent = text;
    this.element.hidden = false;

    document.addEventListener('pointermove', this._onPointerMove);
  }

  _onPointerOver(event) {
    const target = event.target.closest('[data-tooltip]');
    if (!target) return;

    const text = target.dataset.tooltip;
    this.render(text);
  }

  _onPointerMove(event) {
    const offset = 10;
    const x = event.clientX + offset;
    const y = event.clientY + offset;

    this.element.style.left = x + 'px';
    this.element.style.top = y + 'px';
  }

  _onPointerOut(event) {
    const related = event.relatedTarget;
    if (!event.target.closest('[data-tooltip]')) return;
    if (related && related.closest('[data-tooltip]')) return;

    if (this.element) {
      this.element.hidden = true;
      document.removeEventListener('pointermove', this._onPointerMove);
    }
  }

  destroy() {
    document.removeEventListener('pointerover', this._onPointerOver);
    document.removeEventListener('pointerout', this._onPointerOut);
    document.removeEventListener('pointermove', this._onPointerMove);

    if (this.element && this.element.parentElement) {
      this.element.remove();
    }

    this.element = null;
    Tooltip.instance = null;
  }
}

export default Tooltip;
