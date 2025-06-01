/**
 * 
 * By Ivan Silantev 
 * 
 */

import SortableTable from '../../05-dom-document-loading/2-sortable-table-v1/index.js';

export default class ExtendedSortableTable extends SortableTable {
  constructor(headerConfig = [], { data = [], sorted = null } = {}) {
    super(headerConfig, data);

    this.sorted = (sorted && sorted.id && sorted.order)
      ? sorted
      : { id: headerConfig[0]?.id, order: 'asc' };

    this.sort(this.sorted.id, this.sorted.order);
    this.initEventListeners();
  }

  getHeader() {
    return this.headerConfig.map(({ id, title, sortable }) => {
      const order = (this.sorted && this.sorted.id === id && this.sorted.order) ? this.sorted.order : '';
      return `
        <div class="sortable-table__cell"
             data-id="${id}"
             data-sortable="${sortable}"
             data-order="${order}">
          <span>${title}</span>
          ${this.getSortArrow(id)}
        </div>
      `;
    }).join('');
  }

  getSortArrow(id) {
    if (this.sorted && this.sorted.id === id) {
      return `
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      `;
    }
    return '';
  }

  renderCell(item, column) {
    const value = item[column.id];
    if (column.id === 'images') {
      const rowId = item.id;
      return `<div class="image-container" data-row-id="${rowId}" data-column-id="${column.id}"></div>`;
    }

    if (column.template) {
      return column.template(value);
    }

    return super.renderCell(item, column);
  }

  sort(field, order = 'asc') {
    const column = this.headerConfig.find(col => col.id === field);
    if (!column || !column.sortable) return;

    const direction = order === 'asc' ? 1 : -1;

    let sortedData;
    if (column.sortType === 'number') {
      sortedData = [...this.data].sort((a, b) => direction * (a[field] - b[field]));
    } else if (column.sortType === 'string') {
      sortedData = [...this.data].sort((a, b) =>
        direction * a[field].localeCompare(b[field], ['ru', 'en'], {
          caseFirst: 'upper',
          sensitivity: 'variant'
        }));
    } else {
      sortedData = [...this.data];
    }

    this.data = sortedData;
    this.sorted = { id: field, order };

    this.subElements.header.innerHTML = this.getHeader();
    this.subElements.body.innerHTML = this.getBody(this.data);

    this.updateSortingAttributes(field, order);
    this.loadImages();
    this.initEventListeners();
  }

  updateSortingAttributes(field, order) {
    const headers = this.subElements.header.querySelectorAll('.sortable-table__cell[data-id]');
    headers.forEach(header => {
      if (header.dataset.id === field) {
        header.dataset.order = order;
      } else {
        header.dataset.order = '';
      }
    });
  }

  initEventListeners() {
    const onHeaderClick = event => {
      const cell = event.target.closest('[data-id]');
      if (!cell || cell.dataset.sortable !== "true") return;

      const { id } = cell.dataset;
      const currentOrder = cell.dataset.order || 'asc';
      const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

      this.sort(id, newOrder);
    };

    this.subElements.header.removeEventListener('pointerdown', this.onHeaderClick);
    this.onHeaderClick = onHeaderClick;
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
  }
}
