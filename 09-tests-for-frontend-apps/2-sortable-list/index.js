/**
 * 
 * By Ivan Silantev 
 * 
 */

export default class SortableList {
  element;
  draggingElem;
  placeholder;
  dragOffset;

  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
    this.initEventListeners();
  }

  render() {
    const list = document.createElement('ul');
    list.className = 'sortable-list';
    this.element = list;

    this.items.forEach(item => {
      item.classList.add('sortable-list__item');
      this.element.append(item);
    });
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  onPointerDown = (event) => {
    const grabHandle = event.target.closest('[data-grab-handle]');
    const deleteHandle = event.target.closest('[data-delete-handle]');
    const listItem = event.target.closest('.sortable-list__item');

    if (!listItem) return;

    if (deleteHandle) {
      listItem.remove();
      return;
    }

    if (grabHandle) {
      event.preventDefault();
      this.startDrag(listItem, event.clientY);
    }
  };

  startDrag(item, pointerY) {
    this.draggingElem = item;
    this.draggingElemInitialIndex = [...this.element.children].indexOf(item);
    this.placeholder = document.createElement('div');
    this.placeholder.className = 'sortable-list__placeholder';
    this.placeholder.style.height = `${item.offsetHeight}px`;

    this.dragOffset = pointerY - item.getBoundingClientRect().top;

    const { width, height } = item.getBoundingClientRect();

    item.classList.add('sortable-list__item_dragging');
    item.style.width = `${width}px`;
    item.style.height = `${height}px`;

    this.element.insertBefore(this.placeholder, item);
    this.element.append(item);

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerMove = (event) => {
    const y = event.clientY;

    this.draggingElem.style.top = `${y - this.dragOffset}px`;
    this.draggingElem.style.left = `${this.element.getBoundingClientRect().left}px`;

    const prev = this.placeholder.previousElementSibling;
    const next = this.placeholder.nextElementSibling;

    const { top } = this.placeholder.getBoundingClientRect();

    if (prev) {
      const prevTop = prev.getBoundingClientRect().top;
      if (y < prevTop + prev.offsetHeight / 2) {
        this.element.insertBefore(this.placeholder, prev);
      }
    }

    if (next && next !== this.draggingElem) {
      const nextTop = next.getBoundingClientRect().top;
      if (y > nextTop + next.offsetHeight / 2) {
        this.element.insertBefore(this.placeholder, next.nextElementSibling);
      }
    }
  };

  onPointerUp = () => {
    this.placeholder.replaceWith(this.draggingElem);
    this.draggingElem.classList.remove('sortable-list__item_dragging');
    this.draggingElem.style.top = '';
    this.draggingElem.style.left = '';
    this.draggingElem.style.width = '';
    this.draggingElem.style.height = '';

    this.draggingElem = null;
    this.placeholder = null;

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  };

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
    this.element.removeEventListener('pointerdown', this.onPointerDown);
  }
}
