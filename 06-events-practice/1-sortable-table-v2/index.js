/**
 * 
 * By Ivan Silantev 
 * 
 */

export default class SortableTable {
  constructor(headerConfig = [], {data = [], sorted = {}} = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
    this.initEventListeners();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable();

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    if (this.sorted.id) {
      this.sort(this.sorted.id, this.sorted.order);
    }
  }

  getTable() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeaderRow()}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.getBodyRows(this.data)}
        </div>
      </div>
    `;
  }

  getHeaderRow() {
    return this.headerConfig
      .map(({id, title, sortable}) => {
        const order = this.sorted.id === id ? this.sorted.order : '';
        return `
          <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
            <span>${title}</span>
            ${this.getSortArrow(id)}
          </div>
        `;
      })
      .join('');
  }

  getSortArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';
    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getBodyRows(data) {
    return data
      .map(item => {
        return `<div class="sortable-table__row">
          ${this.getRowCells(item)}
        </div>`;
      })
      .join('');
  }

  getRowCells(item) {
    return this.headerConfig
      .map(({id, template}) => {
        if (template) {
          return template(item[id]);
        }
        return `<div class="sortable-table__cell">${item[id]}</div>`;
      })
      .join('');
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;
      return acc;
    }, {});
  }

  sortStrings(arr, order = 'asc', key) {
    if (!Array.isArray(arr)) return [];
    const sortDirection = order === 'asc' ? 1 : -1;

    return [...arr].sort((a, b) =>
      sortDirection * a[key].localeCompare(b[key], ['ru', 'en'], {
        sensitivity: 'variant',
        caseFirst: 'upper',
      })
    );
  }

  sort(field, order) {
    const column = this.headerConfig.find(item => item.id === field);
    if (!column || !column.sortable) return;

    if (column.sortType === 'string') {
      this.data = this.sortStrings(this.data, order, field);
    } else if (column.sortType === 'number') {
      const direction = order === 'asc' ? 1 : -1;
      this.data = [...this.data].sort((a, b) => direction * (a[field] - b[field]));
    }

    this.sorted = {id: field, order};
    this.updateHeader();
    this.updateBody();
  }

  updateHeader() {
    const headers = this.subElements.header.querySelectorAll('[data-id]');
    headers.forEach(header => {
      header.dataset.order = '';
      if (header.dataset.id === this.sorted.id) {
        header.dataset.order = this.sorted.order;
      }
    });
  }

  updateBody() {
    this.subElements.body.innerHTML = this.getBodyRows(this.data);
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', event => {
      const column = event.target.closest('[data-sortable="true"]');
      if (!column) return;

      const field = column.dataset.id;
      const order = column.dataset.order;
      const newOrder = !order ? 'desc' : order === 'asc' ? 'desc' : 'asc';

      this.sort(field, newOrder);
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
