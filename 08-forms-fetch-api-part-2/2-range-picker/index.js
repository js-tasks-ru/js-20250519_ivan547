function formatDate(d) {
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getMonthDays(year, month) {
  const result = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    result.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return result;
}

function isSameDay(a, b) {
  return a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isBetween(date, from, to) {
  return date > from && date < to;
}

function dateToMonthName(year, month) {
  return new Date(year, month, 1)
    .toLocaleDateString('ru-RU', { month: 'long' });
}

function createCalendarMonth(year, month, selFrom, selTo) {
  const days = getMonthDays(year, month);
  const monthName = dateToMonthName(year, month);
  const startDay = (new Date(year, month, 1).getDay() || 7);

  let html = `
    <div class="rangepicker__month" data-month="${month}" data-year="${year}">
      <div class="rangepicker__month-indicator"><time>${monthName}</time></div>
      <div class="rangepicker__day-of-week">
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div>
        <div>Пт</div><div>Сб</div><div>Вс</div>
      </div>
      <div class="rangepicker__date-grid" style="--start-from:${startDay}">`;

  days.forEach(d => {
    const iso = d.toISOString();
    const cls = [
      'rangepicker__cell',
      isSameDay(d, selFrom) ? 'rangepicker__selected-from' : '',
      isSameDay(d, selTo) ? 'rangepicker__selected-to' : '',
      (selFrom && selTo && isBetween(d, selFrom, selTo)) ? 'rangepicker__selected-between' : ''
    ].filter(Boolean).join(' ');

    html += `<button type="button" class="${cls}" data-value="${iso}">${d.getDate()}</button>`;
  });

  html += `</div></div>`;
  return html;
}

export default class RangePicker {
  constructor({ from, to } = {}) {
    this.selected = { from: from || null, to: to || null };
    this.showingFrom = this.selected.from
      ? new Date(this.selected.from.getFullYear(), this.selected.from.getMonth(), 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    this.element = document.createElement('div');
    this.element.className = 'rangepicker';
    this.element.innerHTML = `
      <div class="rangepicker__input" data-elem="input" tabindex="0">
        <span data-elem="from"></span> - 
        <span data-elem="to"></span>
      </div>
      <div class="rangepicker__selector" data-elem="selector" style="display:none;"></div>
    `;

    this.input = this.element.querySelector('[data-elem=input]');
    this.fromSpan = this.element.querySelector('[data-elem=from]');
    this.toSpan = this.element.querySelector('[data-elem=to]');
    this.selector = this.element.querySelector('[data-elem=selector]');

    this.opened = false;
    this.tempFrom = null;
    this._hasTwoClicks = false;
    this._inited = false;

    this._onInput = this.toggle.bind(this);
    this._onDocument = this._onDocClick.bind(this);
    this._onSelector = this._onSelectorClick.bind(this);

    this.input.addEventListener('click', this._onInput);
    document.addEventListener('click', this._onDocument, true);
    this.selector.addEventListener('click', this._onSelector);

    this.updateInput();
  }

  updateInput() {
    this.fromSpan.textContent = this.selected.from ? formatDate(this.selected.from) : '';
    this.toSpan.textContent = this.selected.to ? formatDate(this.selected.to) : '';
  }

  _initSelector() {
    // build static controls and calendar wrappers once
    this.selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left" data-action="prev"></div>
      <div class="rangepicker__calendar" data-pos="left"></div>
      <div class="rangepicker__calendar" data-pos="right"></div>
      <div class="rangepicker__selector-control-right" data-action="next"></div>
    `;
    const calendars = this.selector.querySelectorAll('.rangepicker__calendar');
    this.calLeft = calendars[0];
    this.calRight = calendars[1];
    this._inited = true;
  }

  renderCalendar() {
    let m1 = this.showingFrom;
    let m2 = new Date(m1.getFullYear(), m1.getMonth() + 1, 1);

    if (this.selected.from && this.selected.to) {
      const diffMonths = Math.abs(
        (this.selected.to.getFullYear() - this.selected.from.getFullYear()) * 12 +
        this.selected.to.getMonth() - this.selected.from.getMonth()
      );
      if (diffMonths > 1) {
        m1 = new Date(this.selected.from.getFullYear(), this.selected.from.getMonth(), 1);
        m2 = new Date(this.selected.to.getFullYear(), this.selected.to.getMonth(), 1);
      }
    }

    this.calLeft.innerHTML = createCalendarMonth(
      m1.getFullYear(), m1.getMonth(), this.selected.from, this.selected.to
    );
    this.calRight.innerHTML = createCalendarMonth(
      m2.getFullYear(), m2.getMonth(), this.selected.from, this.selected.to
    );
  }

  toggle(e) {
    e.stopPropagation();
    this.opened ? this._close() : this._open();
  }

  _open() {
    if (!this._inited) this._initSelector();
    this.selector.style.display = 'flex';
    this.element.classList.add('rangepicker_open');
    this.opened = true;
    this.renderCalendar();
  }

  _close() {
    this.selector.style.display = 'none';
    this.element.classList.remove('rangepicker_open');
    this.opened = false;
    if (this._hasTwoClicks) {
      this.element.dispatchEvent(
        new CustomEvent('date-select', {
          bubbles: true,
          detail: { from: this.selected.from, to: this.selected.to }
        })
      );
      this._hasTwoClicks = false;
    }
    this.tempFrom = null;
    this.updateInput();
  }

  _onDocClick(e) {
    if (!this.element.contains(e.target)) this._close();
  }

  _onSelectorClick(e) {
    const tgt = e.target;
    const action = tgt.dataset.action;

    if (action === 'prev' || action === 'next') {
      const delta = action === 'prev' ? -1 : 1;
      this.showingFrom = new Date(
        this.showingFrom.getFullYear(), this.showingFrom.getMonth() + delta, 1
      );
      this.renderCalendar();
      return;
    }

    const cell = tgt.closest('.rangepicker__cell');
    if (!cell) return;

    const date = new Date(cell.dataset.value);
    if (!this.tempFrom) {
      this.tempFrom = date;
      this._hasTwoClicks = false;
      this.selector.querySelectorAll('.rangepicker__cell').forEach(el => {
        el.classList.remove(
          'rangepicker__selected-from',
          'rangepicker__selected-between',
          'rangepicker__selected-to'
        );
      });
      cell.classList.add('rangepicker__selected-from');
      return;
    }

    if (date < this.tempFrom) {
      this.selected.from = date;
      this.selected.to = this.tempFrom;
    } else {
      this.selected.from = this.tempFrom;
      this.selected.to = date;
    }
    this.tempFrom = null;
    this._hasTwoClicks = true;
    this.updateInput();
    this.renderCalendar();
  }

  remove() {
    this.destroy();
  }

  destroy() {
    this.input.removeEventListener('click', this._onInput);
    document.removeEventListener('click', this._onDocument, true);
    this.selector.removeEventListener('click', this._onSelector);
    this.element.remove();
  }
}
