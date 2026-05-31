const UI = {
  currentPage: 1,
  pageSize: 14,
  sortKey: 'createdDate',
  sortDir: 'desc',
  deleteTargetId: null,

  init() {
    this.setupWorkTypeToggle();
    this.setupSortHandlers();
  },

  setupWorkTypeToggle() {
    const typeSelect = document.getElementById('typeOfWork');
    const workerGroup = document.getElementById('workerNumberGroup');
    const workerInput = document.getElementById('workerNumber');

    const toggle = () => {
      if (typeSelect.value === 'Worker') {
        workerGroup.style.display = 'flex';
        workerInput.required = true;
      } else {
        workerGroup.style.display = 'none';
        workerInput.required = false;
        workerInput.value = '';
      }
    };

    typeSelect.addEventListener('change', toggle);
    toggle();
  },

  setupSortHandlers() {
    document.querySelectorAll('.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        if (this.sortKey === key) {
          this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortKey = key;
          this.sortDir = 'asc';
        }
        UI.currentPage = 1;
        App.refresh();
        this.updateSortIndicators();
      });
    });
  },

  updateSortIndicators() {
    document.querySelectorAll('.sort-indicator').forEach(el => el.textContent = '');
    const active = document.querySelector(`.sortable[data-sort="${this.sortKey}"]`);
    if (active) {
      const indicator = active.querySelector('.sort-indicator');
      if (indicator) {
        indicator.textContent = this.sortDir === 'asc' ? ' \u25B2' : ' \u25BC';
      }
    }
  },

  sortRecords(records) {
    const key = this.sortKey;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const sorted = [...records];

    sorted.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      if (key === 'quantity') {
        valA = Number(valA);
        valB = Number(valB);
      } else if (key === 'createdDate') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });

    return sorted;
  },

  populateForm(record) {
    document.getElementById('editId').value = record.id;
    document.getElementById('partNumber').value = record.partNumber;
    document.getElementById('partName').value = record.partName;
    document.getElementById('model').value = record.model;
    document.getElementById('quantity').value = record.quantity;
    document.getElementById('chassis').value = record.chassis;
    const workerGroup = document.getElementById('workerNumberGroup');
    const workerInput = document.getElementById('workerNumber');
    document.getElementById('typeOfWork').value = record.typeOfWork;
    if (record.typeOfWork === 'Worker') {
      workerGroup.style.display = 'flex';
      workerInput.required = true;
      workerInput.value = record.workerNumber || '';
    } else {
      workerGroup.style.display = 'none';
      workerInput.required = false;
      workerInput.value = '';
    }
    document.getElementById('availabilityStatus').value = record.availabilityStatus || '';

    document.getElementById('formTitle').textContent = 'Edit Record';
    document.getElementById('editBadge').classList.remove('hidden');
    document.getElementById('saveBtn').textContent = 'Update Record';

    Validator.clearErrors();
    document.getElementById('recordForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  clearForm() {
    document.getElementById('editId').value = '';
    document.getElementById('recordForm').reset();
    document.getElementById('workerNumberGroup').style.display = 'none';
    document.getElementById('workerNumber').required = false;

    document.getElementById('formTitle').textContent = 'Add New Record';
    document.getElementById('editBadge').classList.add('hidden');
    document.getElementById('saveBtn').textContent = 'Save Record';

    document.getElementById('typeOfWork').value = '';
    document.getElementById('availabilityStatus').value = '';

    Validator.clearErrors();
  },

  renderTable(records) {
    const tbody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    const recordCount = document.getElementById('recordCount');

    if (records.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.remove('hidden');
      document.querySelector('.table-wrapper').classList.add('hidden');
      recordCount.textContent = '0 records';
      return;
    }

    emptyState.classList.add('hidden');
    document.querySelector('.table-wrapper').classList.remove('hidden');

    const start = (this.currentPage - 1) * this.pageSize;
    const end = Math.min(start + this.pageSize, records.length);
    const pageRecords = records.slice(start, end);

    let html = '';
    for (let i = 0; i < pageRecords.length; i++) {
      const r = pageRecords[i];
      html += `<tr>
        <td data-label="Part Number">${this._esc(r.partNumber)}</td>
        <td data-label="Part Name">${this._esc(r.partName)}</td>
        <td data-label="Model">${this._esc(r.model)}</td>
        <td data-label="Qty">${r.quantity}</td>
        <td data-label="Chassis">${this._esc(r.chassis)}</td>
        <td data-label="Work">${this._esc(r.typeOfWork)}</td>
        <td data-label="Worker No">${r.typeOfWork === 'Worker' ? this._esc(r.workerNumber) : '-'}</td>
        <td data-label="Status">${r.availabilityStatus ? `<span class="status-badge ${r.availabilityStatus === 'Inside KSA' ? 'status-inside' : 'status-outside'}">${this._esc(r.availabilityStatus)}</span>` : ''}</td>
        <td class="date-col" data-label="Created">${r.createdDate}</td>
        <td class="toggle-col" data-label="Received">
          <button class="toggle-switch received-toggle-btn ${r.received ? 'toggle-on' : ''}" data-id="${r.id}" data-received="${r.received}" title="${r.received ? 'Mark as not received' : 'Mark as received'}">
            <span class="toggle-slider"></span>
          </button>
        </td>
        <td class="actions-col" data-label="">
          <button class="btn btn-small btn-edit" data-id="${r.id}" title="Edit">&#9998;</button>
          <button class="btn btn-small btn-delete" data-id="${r.id}" title="Delete">&#128465;</button>
        </td>
      </tr>`;
    }
    tbody.innerHTML = html;
    recordCount.textContent = `${records.length} record${records.length !== 1 ? 's' : ''}`;
    this.renderPagination(records.length);
  },

  renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));

    if (this.currentPage > totalPages) this.currentPage = totalPages;
    if (this.currentPage < 1) this.currentPage = 1;

    document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${totalPages}`;
    document.getElementById('prevPageBtn').disabled = this.currentPage <= 1;
    document.getElementById('nextPageBtn').disabled = this.currentPage >= totalPages;
  },

  getPaginatedRecords(records) {
    return records;
  },

  showConfirmDialog(message, onConfirm) {
    this.deleteTargetId = null;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').classList.remove('hidden');

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn = document.getElementById('cancelDeleteBtn');

    const cleanup = () => {
      document.getElementById('confirmModal').classList.add('hidden');
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };

    const handleConfirm = () => {
      cleanup();
      if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
      cleanup();
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
  },

  showNotification(message, type = 'info') {
    const el = document.getElementById('notification');
    el.textContent = message;
    el.className = `notification ${type}`;
    el.classList.remove('hidden');

    clearTimeout(this._notifTimer);
    this._notifTimer = setTimeout(() => {
      el.classList.add('hidden');
    }, 3500);
  },

  showReceivedDialog(record, id) {
    const modal = document.getElementById('receivedModal');
    modal.dataset.recordId = id;
    document.getElementById('receivedModalTitle').textContent = 'Mark as Received';
    this._populateReceivedDetails(record);
    document.getElementById('receivedModalBody').classList.remove('hidden');
    document.getElementById('receivedUnconfirmBody').classList.add('hidden');
    document.getElementById('receivedDateInput').value = '';
    document.getElementById('receivedDateError').textContent = '';
    modal.classList.remove('hidden');
  },

  showUnreceivedConfirm(record, id) {
    const modal = document.getElementById('receivedModal');
    modal.dataset.recordId = id;
    document.getElementById('receivedModalTitle').textContent = 'Mark as Not Received';
    this._populateReceivedDetails(record);
    document.getElementById('receivedModalBody').classList.add('hidden');
    document.getElementById('receivedUnconfirmBody').classList.remove('hidden');
    modal.classList.remove('hidden');
  },

  _populateReceivedDetails(record) {
    document.getElementById('recPartNumber').textContent = record.partNumber;
    document.getElementById('recPartName').textContent = record.partName;
    document.getElementById('recModel').textContent = record.model;
    document.getElementById('recQuantity').textContent = record.quantity;
    document.getElementById('recChassis').textContent = record.chassis;
    document.getElementById('recTypeOfWork').textContent = record.typeOfWork;
    document.getElementById('recWorkerNumber').textContent = record.typeOfWork === 'Worker' ? (record.workerNumber || '-') : '-';
    document.getElementById('recAvailability').textContent = record.availabilityStatus;
  },

  hideReceivedDialog() {
    document.getElementById('receivedModal').classList.add('hidden');
  },

  _esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
