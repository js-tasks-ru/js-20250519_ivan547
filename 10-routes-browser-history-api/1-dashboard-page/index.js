/**
 * 
 * By Ivan Silantev 
 * 
 */

import RangePicker from '../../08-forms-fetch-api-part-2/2-range-picker/index.js';
import SortableTableV3 from '../../07-async-code-fetch-api-part-1/2-sortable-table-v3/index.js';
import ColumnChartV2 from '../../07-async-code-fetch-api-part-1/1-column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const now = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
    const to = new Date();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.initComponents(from, to);
    this.renderComponents();
    this.initEventListeners();

    await this.updateComponents(
        this.components.rangePicker.selected.from,
        this.components.rangePicker.selected.to
    );

    return this.element;
  }

  getTemplate() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable" class="sortable-table"></div>
      </div>
    `;
  }

  initComponents(from, to) {
    const rangePicker = new RangePicker({ from, to });

    const ordersChart = new ColumnChartV2({
      url: 'api/dashboard/orders',
      range: { from, to },
      label: 'Заказы',
    });

    const salesChart = new ColumnChartV2({
      url: 'api/dashboard/sales',
      range: { from, to },
      label: 'Продажи',
      formatHeading: data => `$${data}`
    });

    const customersChart = new ColumnChartV2({
      url: 'api/dashboard/customers',
      range: { from, to },
      label: 'Клиенты'
    });

    const sortableTable = new SortableTableV3(header, {
      url: 'api/dashboard/bestsellers',
      sorted: {
        id: 'title',
        order: 'asc'
      },
      isSortLocally: false,
    });

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  }

  renderComponents() {
    const { rangePicker, ordersChart, salesChart, customersChart, sortableTable } = this.components;

    this.subElements = this.getSubElements(this.element);

    this.subElements.rangePicker.append(rangePicker.element);
    this.subElements.ordersChart.append(ordersChart.element);
    this.subElements.salesChart.append(salesChart.element);
    this.subElements.customersChart.append(customersChart.element);
    this.subElements.sortableTable.append(sortableTable.element);
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  updateComponents(from, to) {
    document.body.classList.add('is-loading');

    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);

    const table = this.components.sortableTable;
    const url = new URL(`${BACKEND_URL}api/dashboard/bestsellers`);

    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());
    url.searchParams.set('_sort', 'title');
    url.searchParams.set('_order', 'asc');
    url.searchParams.set('_start', '0');
    url.searchParams.set('_end', '30');

    table.url = url;
    table.start = 0;
    table.end = table.step;
    table.data.length = 0;
    table.endReached = false;
    table.subElements.body.innerHTML = '';

    table.loadData().then(() => {
        table.renderBody();
        table.loadImages(); 
        document.body.classList.remove('is-loading');
    }).catch(() => {
        document.body.classList.remove('is-loading');
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subEl) => {
      accum[subEl.dataset.element] = subEl;
      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.remove();
  }
}