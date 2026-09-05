/**
 * Evently Reusable UI Components
 */

window.UI = {
  status(value) {
    if (!value) return '';
    const cls = value.toLowerCase().trim().replace(/\s+/g, '-');
    return `<span class="status ${cls}">${value}</span>`;
  },

  button(label, primary = false, extraAttrs = '') {
    return `<button class="button ${primary ? 'primary' : ''}" ${extraAttrs}>${label}</button>`;
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  formatDateForInput(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  },

  formatTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  timeAgo(dateStr) {
    if (!dateStr) return 'Baru saja';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Baru saja';
    const seconds = Math.floor((new Date() - d) / 1000);
    if (seconds < 60) return 'Baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  },

  metricCard({ title, icon, value, changeText, subInfo }) {
    return `
      <div class="metric-card">
        <div class="metric-top">
          <span>${title}</span>
          <span class="metric-icon">${icon}</span>
        </div>
        <div class="metric-value">${value}</div>
        <div class="metric-change">${changeText}</div>
        ${subInfo ? `<div class="metric-sub">${subInfo}</div>` : ''}
      </div>
    `;
  },

  progressBar(percent) {
    const clamped = Math.min(100, Math.max(0, percent || 0));
    return `
      <div class="quota-bar" title="Terisi ${clamped}%">
        <div class="quota-fill" style="width: ${clamped}%;"></div>
      </div>
    `;
  },

  eventRows(events) {
    if (!events || events.length === 0) {
      return `<p class="empty" style="padding: 24px 0;">Belum ada data event mendatang.</p>`;
    }
    return events.slice(0, 5).map(e => {
      const d = new Date(e.date);
      const day = !isNaN(d.getTime()) ? String(d.getDate()).padStart(2, '0') : '--';
      const month = !isNaN(d.getTime()) ? d.toLocaleString('id-ID', { month: 'short' }) : '--';
      const regCount = e.registrants !== undefined ? e.registrants : (e.total_registrants || 0);
      const quota = e.quota || 1;
      const fillPct = Math.min(100, Math.round((regCount / quota) * 100));

      return `
        <div class="event-row" style="cursor:pointer;" onclick="openEventDetail(${e.id})">
          <div class="event-date">
            <strong>${day}</strong>
            <small>${month}</small>
          </div>
          <div class="event-info">
            <strong>${e.name}</strong>
            <small>${e.location || 'Online'} · ${regCount}/${quota} pendaftar (${fillPct}%)</small>
            ${UI.progressBar(fillPct)}
          </div>
          ${UI.status(e.status)}
        </div>
      `;
    }).join('');
  },

  eventCard(e) {
    const dateFormatted = UI.formatDate(e.date);
    const regCount = e.registrants !== undefined ? e.registrants : (e.total_registrants || 0);
    const quota = e.quota || 1;
    const fillPct = Math.min(100, Math.round((regCount / quota) * 100));

    return `
      <div class="event-card">
        <div class="event-card-top">
          <div>
            <h3 class="event-card-title">${e.name}</h3>
            <div class="event-card-meta">
              <span>📅 ${dateFormatted}</span>
              <span>📍 ${e.location || 'Online'}</span>
            </div>
          </div>
          ${UI.status(e.status)}
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:4px;">
            <span>Keterisian Kuota</span>
            <span><strong>${regCount}</strong> / ${quota} (${fillPct}%)</span>
          </div>
          ${UI.progressBar(fillPct)}
        </div>
        <div class="event-card-actions">
          <button class="button" style="padding:6px 10px;font-size:11px;flex:1;" onclick="openEventDetail(${e.id})">Detail</button>
          <button class="button" style="padding:6px 10px;font-size:11px;" onclick="openEditEventModal(${e.id})">Edit</button>
          <button class="button" style="padding:6px 10px;font-size:11px;color:var(--danger);" onclick="handleDeleteEvent(${e.id})">Hapus</button>
        </div>
      </div>
    `;
  },

  eventDetailModal(e, eventRegistrants = []) {
    const regCount = e.registrants !== undefined ? e.registrants : (e.total_registrants || 0);
    const quota = e.quota || 1;
    const fillPct = Math.min(100, Math.round((regCount / quota) * 100));
    const sisa = Math.max(0, quota - regCount);

    return `
      <div class="modal-overlay" id="eventDetailOverlay" onclick="if(event.target===this) closeEventDetail()">
        <div class="modal">
          <div class="modal-header">
            <div>
              <p class="eyebrow" style="margin:0 0 4px;">Detail Event #${e.id}</p>
              <h2>${e.name}</h2>
            </div>
            <button class="modal-close" onclick="closeEventDetail()">✕</button>
          </div>

          <div class="detail-list">
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <span class="detail-val">${UI.status(e.status)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tanggal Pelaksanaan</span>
              <span class="detail-val">${UI.formatDate(e.date)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Lokasi</span>
              <span class="detail-val">${e.location || 'Online'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Kapasitas Kuota</span>
              <span class="detail-val">${quota} peserta</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Pendaftar Masuk</span>
              <span class="detail-val">${regCount} peserta (${fillPct}% terisi)</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Sisa Kuota Tersedia</span>
              <span class="detail-val" style="color:${sisa < 10 ? 'var(--warning)' : 'var(--success)'};">${sisa} kursi lagi</span>
            </div>
          </div>

          <div style="margin: 16px 0;">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;">
              <span>Progress Pengisian Kursi</span>
              <span><strong>${fillPct}%</strong></span>
            </div>
            ${UI.progressBar(fillPct)}
          </div>

          <div style="margin-top: 24px;">
            <h4 style="font-size:14px;margin:0 0 10px;display:flex;justify-content:space-between;">
              <span>Daftar Peserta Terdaftar</span>
              <small style="color:var(--muted);font-weight:normal;">(${eventRegistrants.length} orang)</small>
            </h4>
            <div style="max-height: 180px; overflow-y: auto; border: 1px solid var(--line); border-radius: 10px;">
              ${eventRegistrants.length > 0 ? eventRegistrants.map(r => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid var(--line);font-size:12px;">
                  <div>
                    <strong>${r.name}</strong>
                    <div style="color:var(--muted);font-size:11px;">${r.email}</div>
                  </div>
                  ${UI.status(r.status)}
                </div>
              `).join('') : '<p class="empty" style="padding: 16px;">Belum ada peserta terdaftar untuk event ini.</p>'}
            </div>
          </div>

          <div class="button-row" style="margin-top:24px;justify-content:flex-end;">
            <button class="button" onclick="closeEventDetail()">Tutup</button>
            <button class="button" onclick="closeEventDetail(); openEditEventModal(${e.id})">Edit Event</button>
            <button class="button primary" onclick="closeEventDetail(); APP_STATE.activeView='registration'; renderView();">＋ Daftarkan Peserta</button>
          </div>
        </div>
      </div>
    `;
  },

  activityList(activities) {
    if (!activities || activities.length === 0) {
      return `<p class="empty" style="padding: 24px 0;">Belum ada catatan aktivitas.</p>`;
    }
    return activities.slice(0, 6).map(a => {
      const msg = typeof a === 'string' ? a : (a.message || '');
      const eventTag = (a && a.event_name) ? `<strong>[${a.event_name}]</strong> ` : '';
      const time = (a && a.created_at) ? UI.timeAgo(a.created_at) : 'Beberapa saat lalu';
      
      let icon = '●';
      if (msg.toLowerCase().includes('presensi') || msg.toLowerCase().includes('check-in')) icon = '✓';
      else if (msg.toLowerCase().includes('pendaftar')) icon = '＋';
      else if (msg.toLowerCase().includes('event')) icon = '▦';

      return `
        <div class="activity-item">
          <span class="activity-icon">${icon}</span>
          <div class="activity-body">
            <p>${eventTag}${msg}</p>
            <small>${time}</small>
          </div>
        </div>
      `;
    }).join('');
  },

  apiBadge() {
    if (APP_STATE.apiConnected) {
      return `
        <div class="api-badge connected" title="Connected to Express API (port 3000)">
          <span class="api-dot green"></span>
          <span>API Connected (3000)</span>
        </div>
      `;
    }
    return `
      <div class="api-badge offline" title="Backend unreachable. Using mock data.">
        <span class="api-dot yellow"></span>
        <span>Mock Mode (API Offline)</span>
      </div>
    `;
  },

  registrationReceipt(reg, ev) {
    const regCode = `REG-${String(reg.id || Math.floor(Math.random() * 9000 + 1000)).padStart(4, '0')}`;
    const dateFormatted = ev ? UI.formatDate(ev.date) : '-';

    return `
      <div class="receipt-card">
        <div class="receipt-header">
          <div>
            <p class="eyebrow" style="margin:0 0 4px;">Bukti Pendaftaran / E-Ticket</p>
            <div class="receipt-id">${regCode}</div>
          </div>
          ${UI.status(reg.status || 'Confirmed')}
        </div>

        <div class="event-preview-box">
          <div class="event-preview-date">
            <strong>${ev && !isNaN(new Date(ev.date).getTime()) ? String(new Date(ev.date).getDate()).padStart(2, '0') : '--'}</strong>
            <small>${ev && !isNaN(new Date(ev.date).getTime()) ? new Date(ev.date).toLocaleString('id-ID', { month: 'short' }) : '--'}</small>
          </div>
          <div class="event-preview-info">
            <h4>${ev ? ev.name : (reg.event_name || 'Event')}</h4>
            <p>📍 ${ev ? (ev.location || 'Online') : '-'}</p>
          </div>
        </div>

        <div class="receipt-grid">
          <div class="receipt-item">
            <label>Nama Peserta</label>
            <strong>${reg.name}</strong>
          </div>
          <div class="receipt-item">
            <label>Alamat Email</label>
            <strong>${reg.email}</strong>
          </div>
          <div class="receipt-item">
            <label>Nomor Telepon</label>
            <strong>${reg.phone || '-'}</strong>
          </div>
          <div class="receipt-item">
            <label>Waktu Pendaftaran</label>
            <strong>${UI.formatDate(reg.registered_at || reg.created_at || new Date())}</strong>
          </div>
          ${reg.notes ? `
            <div class="receipt-item" style="grid-column: 1 / -1;">
              <label>Catatan Tambahan</label>
              <strong>${reg.notes}</strong>
            </div>
          ` : ''}
        </div>

        <div class="notice" style="background:#edf5ef;border:1px solid #b7eb8f;color:var(--success);margin:16px 0;font-size:12px;">
          ✓ Pendaftaran Anda telah tercatat dalam sistem dan data presensi otomatis diinisialisasi.
        </div>

        <div class="button-row" style="justify-content: flex-end; margin-top: 24px;">
          <button class="button" onclick="window.print()">🖨 Cetak Bukti</button>
          <button class="button" onclick="APP_STATE.registrationSuccessData = null; renderView();">＋ Daftar Peserta Lain</button>
          <button class="button primary" onclick="APP_STATE.registrationSuccessData = null; APP_STATE.activeView = 'registrants'; renderView();">Lihat di Data Pendaftar →</button>
        </div>
      </div>
    `;
  }
};