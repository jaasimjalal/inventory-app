const Validator = {
  validate(record, existingRecords, editId) {
    const errors = [];

    if (record.partNumber && record.partNumber.trim()) {
      const dup = existingRecords.find(
        r => r.partNumber.toLowerCase() === record.partNumber.trim().toLowerCase() && r.id !== editId
      );
      if (dup) {
        errors.push({ field: 'partNumber', message: 'Part Number already exists.' });
      }
    }

    if (!record.partName || !record.partName.trim()) {
      errors.push({ field: 'partName', message: 'Part Name is required.' });
    }

    if (record.quantity === undefined || record.quantity === null || record.quantity === '') {
      errors.push({ field: 'quantity', message: 'Quantity is required.' });
    } else if (!Number.isInteger(Number(record.quantity)) || Number(record.quantity) < 1) {
      errors.push({ field: 'quantity', message: 'Quantity must be a positive integer.' });
    }

    if (!record.chassis || !record.chassis.trim()) {
      errors.push({ field: 'chassis', message: 'Chassis is required.' });
    }

    if (!record.model || !record.model.trim()) {
      errors.push({ field: 'model', message: 'Model is required.' });
    }

    if (!record.typeOfWork) {
      errors.push({ field: 'typeOfWork', message: 'Type of Work is required.' });
    }

    if (record.availabilityStatus === 'Inside KSA') {
      if (!record.province) {
        errors.push({ field: 'province', message: 'Province is required for Inside KSA.' });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  showFieldErrors(errors) {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));

    for (const err of errors) {
      const input = document.getElementById(err.field);
      if (input) {
        const group = input.closest('.form-group');
        if (group) {
          group.classList.add('error');
          const errorEl = group.querySelector('.field-error');
          if (errorEl) errorEl.textContent = err.message;
        }
      }
    }
  },

  clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));
  }
};
