/**
 * 
 * By Ivan Silantev 
 * 
 */

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date()
    },
    label = '',
    link = '',
    formatHeading = data => data
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
    this.update(this.range.from, this.range.to);
  }

  async update(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    this.element.classList.add('column-chart_loading');

    const data = await fetchJson(this.url);
    const values = Object.values(data);
    this.subElements.body.innerHTML = this.getColumnBody(values);
    this.subElements.header.textContent = this.formatHeading(values.reduce((a, b) => a + b, 0));

    this.element.classList.remove('column-chart_loading');

    return data;
  }

  getColumnBody(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      const percent = ((item / maxValue) * 100).toFixed(0);
      const value = String(Math.floor(item * scale));
      return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
    }).join('');
  }

  getTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
