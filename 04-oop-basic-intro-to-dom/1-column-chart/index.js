/**
 * 
 * By Ivan Silantev 
 * 
 */

export default class ColumnChart {
  element;
  subElements = {};

  constructor({ data = [], label = '', value = 0, link = '', formatHeading = data => data } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = 50;

    this.render();
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      const percent = ((item / maxValue) * 100).toFixed(0) + '%';
      const value = String(Math.floor(item * scale));
      return {
        percent,
        value
      };
    });
  }

  get template() {
    const isLoading = !this.data || this.data.length === 0;

    return `
      <div class="column-chart ${isLoading ? 'column-chart_loading' : ''}" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : ''}
        </div>
        <div class="column-chart__container">
          <div class="column-chart__header">${this.formatHeading(this.value)}</div>
          <div class="column-chart__chart">
            ${this.getColumns(this.data)}
          </div>
        </div>
      </div>
    `;
  }

  getColumns(data) {
    if (!data || data.length === 0) {
      return `<img src="charts-skeleton.svg" alt="Loading...">`;
    }

    const columnProps = this.getColumnProps(data);

    return columnProps
      .map(({ value, percent }) => {
        return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
      })
      .join('');
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = {
      body: this.element.querySelector('.column-chart__chart')
    };
  }

  update(newData = []) {
    this.data = newData;
    const chartBody = this.element.querySelector('.column-chart__chart');

    if (!newData || newData.length === 0) {
      chartBody.innerHTML = `<img src="charts-skeleton.svg" alt="Loading...">`;
      this.element.classList.add('column-chart_loading');
    } else {
      this.element.classList.remove('column-chart_loading');
      chartBody.innerHTML = this.getColumns(newData);
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
