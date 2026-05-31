var InventoryDB = {
  _data: [],
  _supabaseUrl: '',
  _supabaseKey: '',

  init: function() {
    var self = this;
    var configEl = document.getElementById('supabase-config');
    if (configEl) {
      try {
        var cfg = JSON.parse(configEl.textContent);
        this._supabaseUrl = cfg.url;
        this._supabaseKey = cfg.key;
      } catch (e) {}
    }
    if (!this._supabaseUrl) {
      this._supabaseUrl = 'REPLACE_WITH_YOUR_SUPABASE_URL';
      this._supabaseKey = 'REPLACE_WITH_YOUR_SUPABASE_ANON_KEY';
    }
    return this._fetchAll();
  },

  getAll: function() {
    return this._data;
  },

  getById: function(id) {
    return this._data.find(function(r) { return r.id === id; }) || null;
  },

  add: function(record) {
    var self = this;
    this._data.push(record);
    this._apiCall('POST', '', record).catch(function() {});
    return record;
  },

  update: function(id, updatedFields) {
    var self = this;
    var index = this._data.findIndex(function(r) { return r.id === id; });
    if (index === -1) return null;
    var record = this._data[index];
    var keys = Object.keys(updatedFields);
    for (var i = 0; i < keys.length; i++) {
      record[keys[i]] = updatedFields[keys[i]];
    }
    this._apiCall('PATCH', '?id=eq.' + encodeURIComponent(id), updatedFields).catch(function() {});
    return record;
  },

  delete: function(id) {
    var self = this;
    var index = this._data.findIndex(function(r) { return r.id === id; });
    if (index === -1) return false;
    this._data.splice(index, 1);
    this._apiCall('DELETE', '?id=eq.' + encodeURIComponent(id)).catch(function() {});
    return true;
  },

  search: function(query, filters) {
    if (!filters) filters = {};
    var records = this._data;

    if (query) {
      var lowerQuery = query.toLowerCase();
      records = records.filter(function(r) {
        return (r.partNumber && r.partNumber.toLowerCase().includes(lowerQuery)) ||
          (r.partName && r.partName.toLowerCase().includes(lowerQuery)) ||
          (r.model && r.model.toLowerCase().includes(lowerQuery)) ||
          (r.chassis && r.chassis.toLowerCase().includes(lowerQuery));
      });
    }

    if (filters.typeOfWork) {
      records = records.filter(function(r) { return r.typeOfWork === filters.typeOfWork; });
    }

    if (filters.availabilityStatus) {
      records = records.filter(function(r) { return r.availabilityStatus === filters.availabilityStatus; });
    }

    if (filters.received === 'received') {
      records = records.filter(function(r) { return r.received === true; });
      if (filters.receivedDateFrom) {
        records = records.filter(function(r) { return r.receivedDate && r.receivedDate >= filters.receivedDateFrom; });
      }
      if (filters.receivedDateTo) {
        records = records.filter(function(r) { return r.receivedDate && r.receivedDate <= filters.receivedDateTo; });
      }
    } else if (filters.received === 'not_received') {
      records = records.filter(function(r) { return !r.received; });
    }

    if (filters.actionRequired) {
      records = records.filter(function(r) { return !r.availabilityStatus || !r.received; });
    }

    return records;
  },

  generateId: function() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    var rand = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
    return 'INV-' + y + m + d + '-' + rand;
  },

  _fetchAll: function() {
    var self = this;
    return this._apiCall('GET', '?select=*')
      .then(function(data) {
        self._data = data || [];
        return self._data;
      })
      .catch(function() {
        self._data = [];
        return self._data;
      });
  },

  _apiCall: function(method, query, body) {
    var url = this._supabaseUrl + '/rest/v1/records' + query;
    var headers = {
      'apikey': this._supabaseKey,
      'Authorization': 'Bearer ' + this._supabaseKey,
      'Content-Type': 'application/json'
    };
    var opts = {
      method: method,
      headers: headers
    };
    if (body && (method === 'POST' || method === 'PATCH')) {
      opts.body = JSON.stringify(body);
    }
    return fetch(url, opts).then(function(res) {
      if (!res.ok) throw new Error('API error ' + res.status);
      if (method === 'DELETE') return null;
      return res.json().catch(function() { return null; });
    });
  },

  _today: function() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

};
