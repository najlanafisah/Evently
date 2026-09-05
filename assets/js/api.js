/**
 * Evently REST API Client
 * Berdasarkan collection.json (Base URL: http://localhost:3000)
 */

window.API = {
  baseUrl: 'http://localhost:3000',

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch (_) {}
        throw new Error(errorMsg);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[API] Error on ${options.method || 'GET'} ${endpoint}:`, err.message);
      throw err;
    }
  },

  // Health
  async health() {
    return this.request('/health');
  },

  // Events
  async getEvents(status) {
    const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await this.request(`/api/events${query}`);
    return res.data || [];
  },

  async getEventSummary() {
    const res = await this.request('/api/events/summary');
    return res.data || [];
  },

  async getEventById(id) {
    const res = await this.request(`/api/events/${id}`);
    return res.data;
  },

  async createEvent(data) {
    const res = await this.request('/api/events', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  async updateEvent(id, data) {
    const res = await this.request(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  async deleteEvent(id) {
    return this.request(`/api/events/${id}`, {
      method: 'DELETE'
    });
  },

  // Registrants
  async getRegistrants(eventId) {
    const query = eventId && eventId !== 'all' ? `?event_id=${encodeURIComponent(eventId)}` : '';
    const res = await this.request(`/api/registrants${query}`);
    return res.data || [];
  },

  async getRegistrantById(id) {
    const res = await this.request(`/api/registrants/${id}`);
    return res.data;
  },

  async createRegistrant(data) {
    const res = await this.request('/api/registrants', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  async updateRegistrant(id, data) {
    const res = await this.request(`/api/registrants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  async deleteRegistrant(id) {
    return this.request(`/api/registrants/${id}`, {
      method: 'DELETE'
    });
  },

  // Attendances
  async getAttendances(eventId) {
    const query = eventId && eventId !== 'all' ? `?event_id=${encodeURIComponent(eventId)}` : '';
    const res = await this.request(`/api/attendances${query}`);
    return res.data || [];
  },

  async getAttendanceById(id) {
    const res = await this.request(`/api/attendances/${id}`);
    return res.data;
  },

  async createAttendance(data) {
    const res = await this.request('/api/attendances', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  async updateAttendance(id, data) {
    const res = await this.request(`/api/attendances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  async deleteAttendance(id) {
    return this.request(`/api/attendances/${id}`, {
      method: 'DELETE'
    });
  },

  // Activities
  async getActivities(limit = 10) {
    const res = await this.request(`/api/activities?limit=${limit}`);
    return res.data || [];
  },

  async createActivity(data) {
    const res = await this.request('/api/activities', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  // Users
  async getUsers() {
    const res = await this.request('/api/users');
    return res.data || [];
  }
};
