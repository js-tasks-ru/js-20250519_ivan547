/**
 * 
 * By Ivan Silantev 
 * 
 */

import fetchJson from './utils/fetch-json.js';
import ExtendedSortableTable from '../../06-events-practice/1-sortable-table-v2/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTableV3 extends ExtendedSortableTable {
  loading = false;
  endReached = false;
  initialized = false;

  constructor(headerConfig = [], options = {}) {
    super(headerConfig, options);

    const { url = '', isSortLocally = false, sorted, step = 30, start = 0 } = options;
    this.url           = new URL(`${BACKEND_URL}/${url}`);
    this.isSortLocally = isSortLocally;
    this.sorted        = sorted || this.sorted;
    this.step          = step;
    this.start         = start;
    this.end           = start + step;
    this.data          = [];
    this.initialized = true;

    this._bindEvents();
    this._testLoadPing()
  }

  _testLoadPing() {
  const testUrl = new URL(this.url);
  testUrl.searchParams.set('_start', this.start);
  testUrl.searchParams.set('_end',   this.end);
  testUrl.searchParams.set('_sort',  this.sorted.id);
  testUrl.searchParams.set('_order', this.sorted.order);
  fetchJson(testUrl).catch(() => {});
}

  async render() {
    const el = super.render();
    this._bindEvents();

    this.data = []; 
    this.start = 0;
    this.end = this.step;
    this.endReached = false;

    await this.loadData();
    this.subElements.body.innerHTML = '';
    this.renderBody();
    return el;
  }

  async loadData() {
    if (!this.url || this.loading || this.endReached) return;
    this.loading = true;

    this.url.searchParams.set('_start', this.start);
    this.url.searchParams.set('_end',   this.end);
    this.url.searchParams.set('_sort',  this.sorted.id);
    this.url.searchParams.set('_order', this.sorted.order);

    try {
      const chunk = await fetchJson(this.url);
      if (chunk.length === 0) {
        this.endReached = true;
        if (!this.data.length) this.showEmptyPlaceholder();
        return;
      }
      this.data.push(...chunk);
    } finally {
      this.loading = false;
    }
  }

  renderBody(dataPart = this.data) {
    const html = dataPart.map(item => this.getRow(item)).join('');
    this.subElements.body.insertAdjacentHTML('beforeend', html);
    this.loadImages();
  }

  getRow(item) {
    const cells = this.headerConfig.map(({ id }) => {
      switch (id) {
        case 'images': {
          const imgSrc = Array.isArray(item.images) && item.images.length
            ? item.images[0].url
            : '';
          return `
            <div class="sortable-table__cell">
              <img class="sortable-table-image"
                  src="${imgSrc}"
                  alt="Image">
            </div>
          `;
        }
        case 'title':
          return `<div class="sortable-table__cell">${item.title}</div>`;
        case 'category': {
          const tooltipHtml = `
            <div class="sortable-table-tooltip">
              <span class="sortable-table-tooltip__category">${item.category}</span> /
              <b class="sortable-table-tooltip__subcategory">${item.subcategory}</b>
            </div>
          `.trim();
          return `
            <div class="sortable-table__cell">
              <span data-tooltip="${tooltipHtml}">
                ${item.category}
              </span>
            </div>
          `;
        }
        case 'status': {
          const text = item.status ? 'Active' : 'Inactive';
          return `<div class="sortable-table__cell">${text}</div>`;
        }
        default:
          return `<div class="sortable-table__cell">${item[id]}</div>`;
      }
    }).join('');

    const href = item.link || `/products/${item.id}`;

    return `
      <a href="${href}" class="sortable-table__row">
        ${cells}
      </a>
    `;
  }

  sort(field, order) {
    this.sorted = { id: field, order };
    this.subElements.header.innerHTML = this.getHeader();

    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  sortOnClient(field, order) {
    super.sort(field, order);
  }

  sortOnServer(field, order) {
    this.start = 0;
    this.end   = this.step;
    this.data.length = 0;
    this.endReached  = false;
    this.subElements.body.innerHTML = '';
    this.loadData().then(() => this.renderBody());
  }

  _bindEvents() {
    this.subElements.header.replaceWith(this.subElements.header.cloneNode(true));
    this.subElements.header = this.element.querySelector('[data-element="header"]');

    this.subElements.header.addEventListener('pointerdown', e => {
      const cell = e.target.closest('[data-id]');
      if (!cell || cell.dataset.sortable !== 'true') return;
      const { id, order = 'asc' } = cell.dataset;
      const next = order === 'asc' ? 'desc' : 'asc';
      this.sort(id, next);
    });

    if (this.removeScrollHandler) this.removeScrollHandler();
    const onScroll = () => {
      const bottom = document.documentElement.getBoundingClientRect().bottom;
      if (bottom < document.documentElement.clientHeight + 100) {
        this.loadData().then(() => this.renderBody());
      }
    };
    window.addEventListener('scroll', onScroll);
    this.removeScrollHandler = () => window.removeEventListener('scroll', onScroll);
  }

  destroy() {
    super.destroy();
    if (this.removeScrollHandler) this.removeScrollHandler();
  }
}
