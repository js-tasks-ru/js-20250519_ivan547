/**
 * 
 * By Ivan Silantev 
 * 
 */

import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  constructor(productId) {
    this.productId = productId;
    this.element = null;
    this.subElements = {};
    this.data = {};
    this.categories = [];
  }

  save() {
    return this.onSubmit({ preventDefault: () => {} });
  }

  async render() {
    const categoriesPromise = this.loadCategories();
    const productPromise = this.productId
      ? this.loadProduct(this.productId)
      : Promise.resolve({});

    const [categories, product] = await Promise.all([
      categoriesPromise,
      productPromise
    ]);

    this.categories = categories;
    this.data = product;

    this.element = this.createForm();
    this.subElements = this.getSubElements(this.element);

    this.initFormData();
    this.initEventListeners();

    return this.element;
  }

  async loadCategories() {
    const url = new URL('/api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return await fetchJson(url);
  }

  async loadProduct(id) {
    const url = new URL('/api/rest/products', BACKEND_URL);
    url.searchParams.set('id', id);

    const [product] = await fetchJson(url);
    return product;
  }

  createForm() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label" for="title">Название товара</label>
              <input required type="text" name="title" id="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label" for="description">Описание</label>
            <textarea required class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label" for="subcategory">Категория</label>
            <select class="form-control" name="subcategory" id="subcategory"></select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label" for="price">Цена ($)</label>
              <input required type="number" name="price" id="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label" for="discount">Скидка ($)</label>
              <input required type="number" name="discount" id="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label" for="quantity">Количество</label>
            <input required type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label" for="status">Статус</label>
            <select class="form-control" name="status" id="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? 'Сохранить товар' : 'Добавить товар'}
            </button>
          </div>
        </form>
      </div>
    `;

    const form = wrapper.firstElementChild;

    const select = form.querySelector('#subcategory');
    for (const category of this.categories) {
      for (const sub of category.subcategories) {
        const option = document.createElement('option');
        option.value = sub.id;
        option.textContent = `${category.title} > ${sub.title}`;
        select.append(option);
      }
    }
    
    const imagesContainer = form.querySelector('[data-element="imageListContainer"]');
    if (Array.isArray(this.data.images) && this.data.images.length) {
      const ul = document.createElement('ul');
      ul.className = 'sortable-list';

      for (const image of this.data.images) {
        const li = document.createElement('li');
        li.className = 'products-edit__imagelist-item sortable-list__item';
        li.innerHTML = `
          <input type="hidden" name="url" value="${escapeHtml(image.url)}">
          <input type="hidden" name="source" value="${escapeHtml(image.source)}">
          <span>
            <img class="sortable-table__cell-img" src="${escapeHtml(image.url)}" alt="Image" />
            <span>${escapeHtml(image.source)}</span>
          </span>
        `;
        ul.append(li);
      }

      imagesContainer.append(ul);
    }

    return form;
  }

  initFormData() {
    const form = this.subElements.productForm;
    const fields = ['title', 'description', 'price', 'discount', 'quantity', 'status', 'subcategory'];

    for (const field of fields) {
      if (field in this.data && form.elements[field]) {
        form.elements[field].value = this.data[field];
      }
    }
  }

  initEventListeners() {
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
    this.element.querySelector('[name="uploadImage"]').addEventListener('click', this.onUploadImage);
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

      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` },
        body: formData
      });

      const { data } = await response.json();
      const url = data.link;

      const imageItem = document.createElement('li');
      imageItem.className = 'products-edit__imagelist-item sortable-list__item';
      imageItem.innerHTML = `
        <input type="hidden" name="url" value="${escapeHtml(url)}">
        <input type="hidden" name="source" value="${escapeHtml(file.name)}">
        <span>
          <img class="sortable-table__cell-img" src="${escapeHtml(url)}" alt="Image" />
          <span>${escapeHtml(file.name)}</span>
        </span>
      `;

      let ul = this.subElements.imageListContainer.querySelector('ul.sortable-list');
      if (!ul) {
        ul = document.createElement('ul');
        ul.className = 'sortable-list';
        this.subElements.imageListContainer.append(ul);
      }
      ul.append(imageItem);
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

    const items = this.subElements.imageListContainer.querySelectorAll('li');
    for (const li of items) {
      payload.images.push({
        url: li.querySelector('[name="url"]').value,
        source: li.querySelector('[name="source"]').value
      });
    }

    if (this.productId) {
      payload.id = this.productId;
    }

    const url = new URL('/api/rest/products', BACKEND_URL);
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

  getSubElements(element) {
    const result = {};
    element.querySelectorAll('[data-element]').forEach(el => {
      result[el.dataset.element] = el;
    });
    return result;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
