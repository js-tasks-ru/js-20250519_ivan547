/**
 * 
 * By Ivan Silantev 
 * 
 */

export default class SortableTable {
  element = null;
  subElements = {};
  headerConfig = [];
  data = [];

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.loadImages();
  }

  getTemplate() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeader()}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.getBody(this.data)}
        </div>
      </div>
    `;
  }

  getHeader() {
    return this.headerConfig.map(({ id, title, sortable }) => {
      return `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
          <span>${title}</span>
        </div>
      `;
    }).join('');
  }

  getBody(data) {
    return data.map(item => this.renderRow(item)).join('');
  }

  renderRow(item) {
    const cells = this.headerConfig.map(column => {
      const cellContent = this.renderCell(item, column);
      return `<div class="sortable-table__cell" data-id="${column.id}">${cellContent}</div>`;
    }).join('');

    return `<div class="sortable-table__row">${cells}</div>`;
  }

  renderCell(item, column) {
    const value = item[column.id];

    if (Array.isArray(value)) {
      const rowId = item.id || Math.random().toString(36).slice(2, 7);
      return `<div class="image-container" data-row-id="${rowId}" data-column-id="${column.id}"></div>`;
    }

    if (typeof value === 'object' && value !== null) {
      if (value.url) {
        return `<img src="${value.url}" alt="${value.alt || ''}" style="max-width:50px; max-height:50px;">`;
      }
      return '';
    }

    return value;
  }

  async loadImages() {
    const containers = this.element.querySelectorAll('.image-container');

    for (const container of containers) {
      const rowId = container.dataset.rowId;
      const columnId = container.dataset.columnId;

      const rowData = this.data.find(item => item.id === rowId);
      if (!rowData) continue;

      const images = rowData[columnId];

      if (!Array.isArray(images) || images.length === 0) {
        this.showImageError(container);
        continue;
      }

      const validImage = await this.findFirstValidImage(images);

      if (validImage) {
        this.showImage(container, validImage);
      } else {
        this.showImageError(container);
      }
    }
  }

  findFirstValidImage(images) {
    return new Promise(resolve => {
      let index = 0;

      const tryLoad = () => {
        if (index >= images.length) {
          resolve(null);
          return;
        }

        const img = new Image();
        img.src = images[index].url;

        img.onload = () => resolve(images[index]);
        img.onerror = () => {
          index++;
          tryLoad();
        };
      };

      tryLoad();
    });
  }

  showImage(container, imageObj) {
    container.innerHTML = `<img src="${imageObj.url}" alt="${imageObj.alt || ''}" style="max-width:50px; max-height:50px;">`;
  }

  showImageError(container) {
    container.innerHTML = `
      <div style="color: red; font-weight: bold; max-width: 50px; max-height: 50px; display: flex; align-items: center; justify-content: center; border: 1px solid red;">
        ❌
      </div>`;
  }

  sort(field, order = 'asc') {
    const column = this.headerConfig.find(col => col.id === field);
    if (!column || !column.sortable) {
      return;
    }

    const direction = order === 'asc' ? 1 : -1;

    const sortedData = [...this.data].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (column.sortType === 'number') {
        return direction * (aValue - bValue);
      }

      if (column.sortType === 'string') {
        return direction * aValue.localeCompare(bValue, ['ru', 'en'], { caseFirst: 'upper' });
      }

      return 0;
    });

    this.data = sortedData;

    this.subElements.body.innerHTML = this.getBody(this.data);

    this.updateSortingAttributes(field, order);

    this.loadImages();
  }

  updateSortingAttributes(field, order) {
    const headers = this.subElements.header.querySelectorAll('.sortable-table__cell[data-id]');
    headers.forEach(header => {
      if (header.dataset.id === field) {
        header.dataset.order = order;
      } else {
        delete header.dataset.order;
      }
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;
      return acc;
    }, {});
  }

  destroy() {
    if (this.element) {
      this.element.remove();
    }
    this.element = null;
    this.subElements = {};
  }
}



