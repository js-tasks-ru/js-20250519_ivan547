/**
 * 
 * By Ivan Silantev 
 * 
 */

import ColumnChart from '../../04-oop-basic-intro-to-dom/1-column-chart/index.js';
import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChartV2 extends ColumnChart {
  url;
  range;

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
    super({
      data: [],
      label,
      value: 0,
      link,
      formatHeading
    });

    this.url = new URL(url, BACKEND_URL);
    this.range = range;

    this.update(this.range.from, this.range.to);
  }

  async update(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    this.element.classList.add('column-chart_loading');

    const data = await fetchJson(this.url);
    const values = Object.values(data); 

    this.data = values;
    const chartBody = this.element.querySelector('.column-chart__chart');
    chartBody.innerHTML = this.getColumns(values);

    const total = values.reduce((sum, v) => sum + v, 0);
    const chartHeader = this.element.querySelector('.column-chart__header');
    chartHeader.textContent = this.formatHeading(total);

    this.element.classList.remove('column-chart_loading');

    return data;
  }
}
