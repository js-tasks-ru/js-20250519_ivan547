/**
 * 
 * By Ivan Silantev 
 * 
 */

import SortableList from '../../09-tests-for-frontend-apps/2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import ProductForm from '../../08-forms-fetch-api-part-2/1-product-form-v1/index.js'

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

const iconGrab = './icon-grab.svg';
const iconTrash = './icon-trash.svg';
const iconLoadingBlue = './icon-loading-circle-blue.svg';

export default class ProductFormV2 extends ProductForm {
  sortableList;

  async render() {
    const element = await super.render();

    const imageItems = this.data.images?.map(this.getImageItemElement) ?? [];
    this.sortableList = new SortableList({ items: imageItems });

    const container = this.subElements.imageListContainer;
    container.innerHTML = '';
    container.append(this.sortableList.element);

    return element;
  }

  getImageItemElement = ({ url, source }) => {
    const wrapper = document.createElement('li');
    wrapper.className = 'products-edit__imagelist-item sortable-list__item';
    wrapper.innerHTML = `
      <span class="sortable-list__drag-handle" data-grab-handle title="Переместить" style="margin-right: 10px;">
        <img src="${iconGrab}" alt="Переместить" />
      </span>
      <input type="hidden" name="url" value="${escapeHtml(url)}">
      <input type="hidden" name="source" value="${escapeHtml(source)}">
      <span style="display: flex; align-items: center; flex-grow: 1;">
        <img class="sortable-table__cell-img" src="${escapeHtml(url)}" alt="Image" />
        <span style="margin-left: 10px;">${escapeHtml(source)}</span>
      </span>
      <button type="button" data-delete-handle class="button button-danger-outline" title="Удалить изображение" style="margin-left: auto;">
        <img src="${iconTrash}" alt="Удалить" />
      </button>
    `;
    return wrapper;
  }

  onUploadImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      const [file] = input.files;
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      const uploadButton = this.element.querySelector('[name="uploadImage"]');
      const originalHTML = uploadButton.innerHTML;
      uploadButton.innerHTML = `<img src="${iconLoadingBlue}" alt="Загрузка..." width="20">`;

      try {
        const response = await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: { Authorization: `Client-ID 28aaa2e823b03b1` },
          body: formData
        });

        const { data } = await response.json();
        const url = data.link;

        const imageItem = this.getImageItemElement({ url, source: file.name });
        this.sortableList.element.append(imageItem);
      } finally {
        uploadButton.innerHTML = originalHTML;
      }
    };

    input.click();
  }

  onSubmit = async event => {
    event.preventDefault();

    const form = this.subElements.productForm;
    const formData = new FormData(form);

    const payload = {};
    for (const [key, value] of formData.entries()) {
      payload[key] = value;
    }

    payload.price = Number(payload.price);
    payload.discount = Number(payload.discount);
    payload.quantity = Number(payload.quantity);
    payload.status = Number(payload.status);
    payload.images = [];

    const items = this.sortableList.element.querySelectorAll('li');
    for (const li of items) {
      payload.images.push({
        url: li.querySelector('[name="url"]').value,
        source: li.querySelector('[name="source"]').value
      });
    }

    if (this.productId) {
      payload.id = this.productId;
    }

    const url = new URL('/api/rest/products', 'https://course-js.javascript.ru');
    const method = this.productId ? 'PATCH' : 'PUT';

    await fetchJson(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const eventName = this.productId ? 'product-updated' : 'product-saved';
    this.element.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      detail: payload
    }));
  }

  destroy() {
    super.destroy();
    this.sortableList?.destroy();
  }
}
