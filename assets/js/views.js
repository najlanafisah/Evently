/**
 * Evently Views
 */

function dashboardView() {
  const events = APP_STATE.events || [];
  const registrants = APP_STATE.registrants || [];
  const attendances = APP_STATE.attendances || [];
  const activities = APP_STATE.activities || [];

  const totalEvents = events.length;
  const publishedEvents = events.filter(e => (e.status || '').toLowerCase() === 'published').length;
  const draftEvents = events.filter(e => (e.status || '').toLowerCase() === 'draft').length;

  const totalRegistrants = registrants.length;
  const confirmedRegs = registrants.filter(r => (r.status || '').toLowerCase() === 'confirmed').length;
  const pendingRegs = registrants.filter(r => (r.status || '').toLowerCase() === 'pending').length;

  const hadirCount = attendances.filter(a => (a.status || '').toLowerCase() === 'hadir').length;
  const belumHadirCount = attendances.filter(a => (a.status || '').toLowerCase() === 'belum hadir').length;

  const attendanceRate = attendances.length > 0 
    ? ((hadirCount / attendances.length) * 100).toFixed(1) + '%'
    : '0%';

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return `
    <div class="page-heading">
      <div>
        <p class="eyebrow">${dateFormatted}</p>
        <h1 class="page-title">Good morning, Lala.</h1>
        <p class="page-subtitle">Pantau seluruh performa event, pendaftar, dan presensi secara terpusat.</p>
      </div>
      <div class="button-row" style="align-items: center;">
        ${UI.apiBadge()}
        <button class="button" id="btnRefreshData" title="Sinkronkan ulang data dari backend">↺ Refresh</button>
        <button class="button" data-view="registration">＋ Pendaftaran</button>
        <button class="button primary" id="btnGoCreateEvent">+ Buat event</button>
      </div>
    </div>

    ${APP_STATE.error ? `
      <div class="notice" style="background:#fff2f0;border:1px solid #ffccc7;color:#cf1322;margin-bottom:20px;">
        <strong>Perhatian:</strong> Backend (port 3000) belum terhubung (${APP_STATE.error}). Menjalankan mode mock offline.
      </div>
    ` : ''}

    <div class="metrics">
      ${UI.metricCard({
        title: 'Total Event',
        icon: '▦',
        value: totalEvents,
        changeText: `↑ ${publishedEvents} aktif`,
        subInfo: `${publishedEvents} Published · ${draftEvents} Draft`
      })}
      ${UI.metricCard({
        title: 'Total Pendaftar',
        icon: '◎',
        value: totalRegistrants,
        changeText: `↑ ${confirmedRegs} terkonfirmasi`,
        subInfo: `${confirmedRegs} Confirmed · ${pendingRegs} Pending`
      })}
      ${UI.metricCard({
        title: 'Hadir Saat Ini',
        icon: '✓',
        value: hadirCount,
        changeText: `${hadirCount} terverifikasi`,
        subInfo: `${hadirCount} Hadir · ${belumHadirCount} Belum`
      })}
      ${UI.metricCard({
        title: 'Tingkat Kehadiran',
        icon: '↗',
        value: attendanceRate,
        changeText: 'Rata-rata presensi',
        subInfo: `Dari total ${attendances.length} peserta tercatat`
      })}
    </div>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2 class="panel-title">Event Mendatang</h2>
            <small style="color:var(--muted);font-size:11px;">Menampilkan ${Math.min(5, events.length)} event terdekat</small>
          </div>
          <a class="panel-link" href="#" data-view="events">Lihat semua (${events.length}) →</a>
        </div>
        ${UI.eventRows(events)}
      </section>

      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2 class="panel-title">Aktivitas Terbaru</h2>
            <small style="color:var(--muted);font-size:11px;">Log operasional realtime</small>
          </div>
          <span class="panel-link">Realtime</span>
        </div>
        ${UI.activityList(activities)}
      </section>
    </div>
  `;
}

function eventsView() {
  const events = APP_STATE.events || [];
  const searchQuery = (APP_STATE.filter.eventSearch || '').toLowerCase();
  const statusFilter = APP_STATE.filter.eventStatus || 'all';
  const sortOption = APP_STATE.filter.eventSort || 'date-asc';
  const viewMode = APP_STATE.eventViewMode || 'table';

  let filteredEvents = events.filter(e => {
    const matchName = !searchQuery || 
      (e.name && e.name.toLowerCase().includes(searchQuery)) || 
      (e.location && e.location.toLowerCase().includes(searchQuery));
    const matchStatus = statusFilter === 'all' || (e.status && e.status.toLowerCase() === statusFilter.toLowerCase());
    return matchName && matchStatus;
  });

  // Sorting
  if (sortOption === 'date-asc') {
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortOption === 'date-desc') {
    filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortOption === 'name-asc') {
    filteredEvents.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (sortOption === 'registrants-desc') {
    filteredEvents.sort((a, b) => (b.registrants || 0) - (a.registrants || 0));
  }

  // Selected event for detail modal
  let detailModalHtml = '';
  if (APP_STATE.selectedEventId) {
    const selectedEv = events.find(e => e.id === APP_STATE.selectedEventId);
    if (selectedEv) {
      const evRegs = (APP_STATE.registrants || []).filter(r => r.event_id === selectedEv.id);
      detailModalHtml = UI.eventDetailModal(selectedEv, evRegs);
    }
  }

  const isEditing = Boolean(APP_STATE.editingEvent);
  const editingData = APP_STATE.editingEvent || {};

  return `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Workspace / Management</p>
        <h1 class="page-title">Data Event</h1>
        <p class="page-subtitle">Kelola seluruh event yang terhubung langsung dengan backend MySQL.</p>
      </div>
      <div class="button-row" style="align-items:center;">
        ${UI.apiBadge()}
        <div class="segmented-control">
          <button class="${viewMode === 'table' ? 'active' : ''}" onclick="APP_STATE.eventViewMode='table'; renderView();">Tabel</button>
          <button class="${viewMode === 'grid' ? 'active' : ''}" onclick="APP_STATE.eventViewMode='grid'; renderView();">Kartu</button>
        </div>
        <button class="button primary" id="btnToggleCreateEvent">${isEditing ? '✎ Mode Edit Aktif' : '+ Buat event baru'}</button>
      </div>
    </div>

    <!-- Form Create / Edit Event (Collapsible) -->
    <div id="createEventPanel" class="panel" style="display:${isEditing ? 'block' : 'none'};margin-bottom:24px;border:1px solid var(--ink);">
      <div class="panel-heading">
        <h2 class="panel-title">${isEditing ? `Edit Event #${editingData.id}: ${editingData.name}` : 'Tambah Event Baru'}</h2>
        <button class="button" id="btnCancelCreateEvent" style="padding:6px 12px;">✕ Tutup</button>
      </div>
      <form id="formCreateEvent" class="form-grid">
        <input type="hidden" name="event_id" value="${editingData.id || ''}">
        <div class="field">
          <label>Nama Event *</label>
          <input name="name" required placeholder="Contoh: AI Tech Summit 2026" value="${editingData.name || ''}">
        </div>
        <div class="field">
          <label>Tanggal Pelaksanaan *</label>
          <input name="date" type="date" required value="${UI.formatDateForInput(editingData.date)}">
        </div>
        <div class="field">
          <label>Lokasi *</label>
          <input name="location" required placeholder="Contoh: Balai Kartini Jakarta / Online" value="${editingData.location || ''}">
        </div>
        <div class="field">
          <label>Kuota Peserta *</label>
          <input name="quota" type="number" min="1" required placeholder="Contoh: 250" value="${editingData.quota || ''}">
        </div>
        <div class="field">
          <label>Status</label>
          <select name="status">
            <option value="Published" ${editingData.status === 'Published' ? 'selected' : ''}>Published</option>
            <option value="Draft" ${editingData.status === 'Draft' ? 'selected' : ''}>Draft</option>
            <option value="Ongoing" ${editingData.status === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
            <option value="Completed" ${editingData.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Archived" ${editingData.status === 'Archived' ? 'selected' : ''}>Archived</option>
          </select>
        </div>
        <div class="field full" style="margin-top:10px;">
          <div class="button-row">
            <button type="submit" class="button primary" id="btnSubmitEvent">${isEditing ? 'Simpan Perubahan' : 'Simpan ke Database'}</button>
            <button type="button" class="button" id="btnResetEvent">${isEditing ? 'Batal Edit' : 'Reset'}</button>
          </div>
        </div>
      </form>
    </div>

    <section class="panel">
      <div class="toolbar">
        <input class="search" id="inputEventSearch" placeholder="Cari nama event atau lokasi..." value="${APP_STATE.filter.eventSearch || ''}">
        <select class="button" id="selectEventStatus" style="font-weight:normal;padding:11px 13px;">
          <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>Semua status</option>
          <option value="Published" ${statusFilter === 'Published' ? 'selected' : ''}>Published</option>
          <option value="Draft" ${statusFilter === 'Draft' ? 'selected' : ''}>Draft</option>
          <option value="Ongoing" ${statusFilter === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
          <option value="Completed" ${statusFilter === 'Completed' ? 'selected' : ''}>Completed</option>
          <option value="Archived" ${statusFilter === 'Archived' ? 'selected' : ''}>Archived</option>
        </select>
        <select class="button" id="selectEventSort" style="font-weight:normal;padding:11px 13px;">
          <option value="date-asc" ${sortOption === 'date-asc' ? 'selected' : ''}>Tanggal Terdekat</option>
          <option value="date-desc" ${sortOption === 'date-desc' ? 'selected' : ''}>Tanggal Terjauh</option>
          <option value="name-asc" ${sortOption === 'name-asc' ? 'selected' : ''}>Nama (A-Z)</option>
          <option value="registrants-desc" ${sortOption === 'registrants-desc' ? 'selected' : ''}>Pendaftar Terbanyak</option>
        </select>
        <button class="button" id="btnRefreshEvents">↺ Refresh</button>
      </div>

      ${viewMode === 'table' ? `
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama event</th>
                <th>Tanggal</th>
                <th>Lokasi</th>
                <th>Keterisian Kuota</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEvents.length > 0 ? filteredEvents.map(e => {
                const regCount = e.registrants !== undefined ? e.registrants : 0;
                const fillPct = Math.min(100, Math.round((regCount / (e.quota || 1)) * 100));
                return `
                  <tr>
                    <td><small style="color:var(--muted)">#${e.id}</small></td>
                    <td>
                      <strong style="cursor:pointer;text-decoration:underline;text-underline-offset:3px;" onclick="openEventDetail(${e.id})" title="Klik untuk lihat detail">${e.name}</strong>
                    </td>
                    <td>${UI.formatDate(e.date)}</td>
                    <td>${e.location || 'Online'}</td>
                    <td style="min-width:140px;">
                      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">
                        <span><strong>${regCount}</strong> / ${e.quota}</span>
                        <span>${fillPct}%</span>
                      </div>
                      ${UI.progressBar(fillPct)}
                    </td>
                    <td>${UI.status(e.status)}</td>
                    <td>
                      <div style="display:flex;gap:6px;">
                        <button class="button" style="padding:4px 8px;font-size:11px;" onclick="openEventDetail(${e.id})" title="Lihat detail">Detail</button>
                        <button class="button" style="padding:4px 8px;font-size:11px;" onclick="openEditEventModal(${e.id})" title="Edit event">Edit</button>
                        ${e.status !== 'Archived' ? `
                          <button class="button" style="padding:4px 8px;font-size:11px;" onclick="handleArchiveEvent(${e.id})" title="Arsipkan event">Arsip</button>
                        ` : ''}
                        <button class="button" style="padding:4px 8px;font-size:11px;color:var(--danger);" onclick="handleDeleteEvent(${e.id})" title="Hapus event">Hapus</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="7" class="empty">Tidak ada data event yang cocok dengan kriteria filter.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="event-card-grid">
          ${filteredEvents.length > 0 ? filteredEvents.map(e => UI.eventCard(e)).join('') : `
            <p class="empty" style="grid-column:1/-1;padding:40px 0;">Tidak ada data event yang cocok dengan kriteria filter.</p>
          `}
        </div>
      `}
    </section>

    ${detailModalHtml}
  `;
}

function registrationView() {
  // If confirmation state is active, render the receipt card!
  if (APP_STATE.registrationSuccessData) {
    const reg = APP_STATE.registrationSuccessData;
    const ev = (APP_STATE.events || []).find(e => e.id === reg.event_id);
    return `
      <div class="page-heading">
        <div>
          <p class="eyebrow">Workspace / Registration / Confirmation</p>
          <h1 class="page-title">Konfirmasi Pendaftaran</h1>
          <p class="page-subtitle">Pendaftaran berhasil diverifikasi dan disimpan ke database.</p>
        </div>
        <div class="button-row" style="align-items:center;">
          ${UI.apiBadge()}
        </div>
      </div>

      <section class="panel">
        ${UI.registrationReceipt(reg, ev)}
      </section>
    `;
  }

  const events = (APP_STATE.events || []).filter(e => e.status !== 'Archived' && e.status !== 'Completed');
  const defaultEventId = APP_STATE.selectedRegistrationEventId || (events.length > 0 ? events[0].id : null);
  const selectedEvent = events.find(e => e.id === defaultEventId) || events[0];

  const regCount = selectedEvent ? (selectedEvent.registrants !== undefined ? selectedEvent.registrants : 0) : 0;
  const quota = selectedEvent ? (selectedEvent.quota || 1) : 1;
  const sisaKursi = Math.max(0, quota - regCount);
  const fillPct = Math.min(100, Math.round((regCount / quota) * 100));

  return `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Workspace / Registration</p>
        <h1 class="page-title">Pendaftaran Peserta</h1>
        <p class="page-subtitle">Formulir pendaftaran peserta event publik dan internal dengan verifikasi data.</p>
      </div>
      <div class="button-row" style="align-items:center;">
        ${UI.apiBadge()}
      </div>
    </div>

    <section class="panel">
      <div id="regAlertContainer"></div>

      ${events.length === 0 ? `
        <div class="notice" style="background:#fffbe6;border:1px solid #ffe58f;color:var(--warning);margin-bottom:20px;">
          Belum ada event aktif yang tersedia untuk pendaftaran. Silakan tambahkan event terlebih dahulu di menu <strong>Data Event</strong>.
        </div>
      ` : ''}

      <form id="formRegistration">
        <!-- Selected Event Preview Banner -->
        ${selectedEvent ? `
          <div class="event-preview-box" id="regEventPreviewBox">
            <div class="event-preview-date">
              <strong>${!isNaN(new Date(selectedEvent.date).getTime()) ? String(new Date(selectedEvent.date).getDate()).padStart(2, '0') : '--'}</strong>
              <small>${!isNaN(new Date(selectedEvent.date).getTime()) ? new Date(selectedEvent.date).toLocaleString('id-ID', { month: 'short' }) : '--'}</small>
            </div>
            <div class="event-preview-info">
              <h4>${selectedEvent.name}</h4>
              <p>📍 ${selectedEvent.location || 'Online'} · Kapasitas: ${quota} kursi · Tersisa: <strong>${sisaKursi}</strong> kursi (${fillPct}% terisi)</p>
            </div>
            ${UI.status(selectedEvent.status)}
          </div>
        ` : ''}

        <div class="form-grid">
          <div class="field full">
            <label>Pilih Event Tujuan *</label>
            <select name="event_id" required id="regSelectEvent">
              ${events.map(e => {
                const eReg = e.registrants !== undefined ? e.registrants : 0;
                const eSisa = Math.max(0, (e.quota || 0) - eReg);
                return `
                  <option value="${e.id}" ${e.id === defaultEventId ? 'selected' : ''}>
                    ${e.name} (${UI.formatDate(e.date)} - Sisa ${eSisa} kursi)
                  </option>
                `;
              }).join('')}
            </select>
          </div>
          <div class="field">
            <label>Nama Lengkap Peserta *</label>
            <input name="name" required placeholder="Contoh: Dewi Lestari" id="regInputName" autocomplete="name">
          </div>
          <div class="field">
            <label>Alamat Email *</label>
            <input name="email" type="email" required placeholder="contoh: dewi@example.com" id="regInputEmail" autocomplete="email">
          </div>
          <div class="field">
            <label>Nomor Telepon / WhatsApp</label>
            <input name="phone" type="tel" placeholder="+628123456789 atau 08123456789" id="regInputPhone" autocomplete="tel">
          </div>
          <div class="field">
            <label>Status Awal Pendaftaran</label>
            <select name="status">
              <option value="Confirmed" selected>Confirmed (Langsung Terkonfirmasi)</option>
              <option value="Pending">Pending (Menunggu Persetujuan)</option>
            </select>
          </div>
          <div class="field full">
            <label>Catatan Tambahan / Kebutuhan Khusus</label>
            <textarea name="notes" placeholder="Contoh: Butuh akses kursi roda, sertifikat cetak, atau pantangan konsumsi"></textarea>
          </div>
        </div>

        <div class="button-row" style="margin-top:24px;justify-content:space-between;align-items:center;">
          <div style="display:flex;gap:10px;">
            <button type="submit" class="button primary" id="btnSubmitReg" ${events.length === 0 ? 'disabled' : ''}>Simpan & Terbitkan Bukti</button>
            <button type="reset" class="button">Reset Formulir</button>
          </div>
          <a href="#" class="button" data-view="registrants">Lihat Seluruh Pendaftar →</a>
        </div>
      </form>
    </section>
  `;
}

function registrantsView() {
  const registrants = APP_STATE.registrants || [];
  const events = APP_STATE.events || [];
  const searchQuery = (APP_STATE.filter.registrantSearch || '').toLowerCase();
  const eventFilter = APP_STATE.filter.registrantEvent || 'all';
  const statusFilter = APP_STATE.filter.registrantStatus || 'all';

  const filteredRegistrants = registrants.filter(r => {
    const matchSearch = !searchQuery || 
      (r.name && r.name.toLowerCase().includes(searchQuery)) || 
      (r.email && r.email.toLowerCase().includes(searchQuery));
    const matchEvent = eventFilter === 'all' || String(r.event_id) === String(eventFilter);
    const matchStatus = statusFilter === 'all' || (r.status && r.status.toLowerCase() === statusFilter.toLowerCase());
    return matchSearch && matchEvent && matchStatus;
  });

  return `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Workspace / Participants</p>
        <h1 class="page-title">Data Pendaftar</h1>
        <p class="page-subtitle">Data pendaftar realtime dari MySQL via REST API.</p>
      </div>
      <div class="button-row" style="align-items:center;">
        ${UI.apiBadge()}
        <button class="button" id="btnExportRegistrants">Export CSV</button>
        <button class="button primary" data-view="registration">+ Tambah Pendaftar</button>
      </div>
    </div>

    <section class="panel">
      <div class="toolbar">
        <input class="search" id="inputRegSearch" placeholder="Cari nama atau email..." value="${APP_STATE.filter.registrantSearch || ''}">
        <select class="button" id="selectRegEvent" style="font-weight:normal;padding:11px 13px;">
          <option value="all" ${eventFilter === 'all' ? 'selected' : ''}>Semua event</option>
          ${events.map(e => `
            <option value="${e.id}" ${String(eventFilter) === String(e.id) ? 'selected' : ''}>${e.name}</option>
          `).join('')}
        </select>
        <select class="button" id="selectRegStatus" style="font-weight:normal;padding:11px 13px;">
          <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>Semua status</option>
          <option value="Confirmed" ${statusFilter === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="Pending" ${statusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Cancelled" ${statusFilter === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
        <button class="button" id="btnRefreshRegistrants">↺ Refresh</button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama pendaftar</th>
              <th>Kontak</th>
              <th>Event</th>
              <th>Tanggal Daftar</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRegistrants.length > 0 ? filteredRegistrants.map(r => `
              <tr>
                <td><small style="color:var(--muted)">#${r.id}</small></td>
                <td>
                  <strong>${r.name}</strong>
                  ${r.notes ? `<br><small style="color:var(--muted)">Notes: ${r.notes}</small>` : ''}
                </td>
                <td>
                  <div>${r.email}</div>
                  <small style="color:var(--muted)">${r.phone || '-'}</small>
                </td>
                <td>${r.event_name || (events.find(e => e.id === r.event_id)?.name) || '-'}</td>
                <td>${UI.formatDate(r.registered_at || r.created_at)}</td>
                <td>${UI.status(r.status)}</td>
                <td>
                  <button class="button" style="padding:4px 10px;font-size:11px;" onclick="handleDeleteRegistrant(${r.id})" title="Hapus pendaftar">Hapus</button>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="7" class="empty">Tidak ada pendaftar yang cocok dengan kriteria pencarian.</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function attendanceView() {
  const attendances = APP_STATE.attendances || [];
  const events = APP_STATE.events || [];
  const eventFilter = APP_STATE.filter.attendanceEvent || 'all';

  const filteredAttendances = attendances.filter(a => {
    return eventFilter === 'all' || String(a.event_id) === String(eventFilter);
  });

  const hadirCount = filteredAttendances.filter(a => a.status === 'Hadir').length;
  const belumHadirCount = filteredAttendances.filter(a => a.status === 'Belum Hadir').length;

  return `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Workspace / Attendance</p>
        <h1 class="page-title">Presensi Kehadiran</h1>
        <p class="page-subtitle">Pantau dan kelola check-in kehadiran peserta realtime dari REST API.</p>
      </div>
      <div class="button-row" style="align-items:center;">
        ${UI.apiBadge()}
        <button class="button" id="btnRefreshAttendance">↺ Refresh</button>
      </div>
    </div>

    <div class="metrics" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
      <div class="metric-card">
        <div class="metric-top">
          <span>Hadir</span>
          <span class="metric-icon">✓</span>
        </div>
        <div class="metric-value">${hadirCount}</div>
        <div class="metric-change">Peserta terverifikasi check-in</div>
      </div>
      <div class="metric-card">
        <div class="metric-top">
          <span>Belum hadir</span>
          <span class="metric-icon">⏳</span>
        </div>
        <div class="metric-value">${belumHadirCount}</div>
        <div class="metric-change" style="color:var(--muted)">Menunggu kehadiran</div>
      </div>
    </div>

    <section class="panel">
      <div class="toolbar">
        <select class="button" id="selectAttendanceEvent" style="font-weight:normal;padding:11px 13px;">
          <option value="all" ${eventFilter === 'all' ? 'selected' : ''}>Semua event</option>
          ${events.map(e => `
            <option value="${e.id}" ${String(eventFilter) === String(e.id) ? 'selected' : ''}>${e.name}</option>
          `).join('')}
        </select>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Peserta</th>
              <th>Email</th>
              <th>Event</th>
              <th>Waktu Check-in</th>
              <th>Status</th>
              <th>Aksi Check-in</th>
            </tr>
          </thead>
          <tbody>
            ${filteredAttendances.length > 0 ? filteredAttendances.map(a => `
              <tr>
                <td><small style="color:var(--muted)">#${a.id}</small></td>
                <td><strong>${a.registrant_name || 'Peserta #' + a.registrant_id}</strong></td>
                <td>${a.registrant_email || '-'}</td>
                <td>${a.event_name || '-'}</td>
                <td>${a.check_in_time ? `${UI.formatDate(a.check_in_time)} ${UI.formatTime(a.check_in_time)}` : '-'}</td>
                <td>${UI.status(a.status)}</td>
                <td>
                  ${a.status !== 'Hadir' ? `
                    <button class="button primary" style="padding:5px 12px;font-size:12px;" onclick="handleCheckIn(${a.id})">✓ Check-in</button>
                  ` : `
                    <span style="color:var(--success);font-size:12px;font-weight:700;">✓ Terverifikasi</span>
                  `}
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="7" class="empty">Tidak ada data presensi untuk event ini.</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

// Global action handlers
window.openEventDetail = function(id) {
  APP_STATE.selectedEventId = id;
  renderView();
};

window.closeEventDetail = function() {
  APP_STATE.selectedEventId = null;
  renderView();
};

window.openEditEventModal = function(id) {
  const ev = APP_STATE.events.find(e => e.id === id);
  if (ev) {
    APP_STATE.editingEvent = { ...ev };
    renderView();
    const createPanel = document.getElementById('createEventPanel');
    if (createPanel) {
      createPanel.style.display = 'block';
      createPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

window.closeEditEventModal = function() {
  APP_STATE.editingEvent = null;
  renderView();
};

window.handleArchiveEvent = async function(id) {
  if (!confirm(`Arsipkan event #${id}? Status event akan diubah menjadi Archived.`)) return;
  try {
    await API.updateEvent(id, { status: 'Archived' });
    await API.createActivity({
      event_id: id,
      message: `Event #${id} berhasil diarsipkan`
    }).catch(() => {});
    await syncDataFromApi();
    renderView();
  } catch (err) {
    alert(`Gagal mengarsipkan event: ${err.message}`);
  }
};

window.handleDeleteEvent = async function(id) {
  if (!confirm(`Apakah Anda yakin ingin menghapus event #${id}?`)) return;
  try {
    await API.deleteEvent(id);
    await syncDataFromApi();
    renderView();
  } catch (err) {
    alert(`Gagal menghapus event: ${err.message}`);
  }
};

window.handleDeleteRegistrant = async function(id) {
  if (!confirm(`Apakah Anda yakin ingin menghapus pendaftar #${id}?`)) return;
  try {
    await API.deleteRegistrant(id);
    await syncDataFromApi();
    renderView();
  } catch (err) {
    alert(`Gagal menghapus pendaftar: ${err.message}`);
  }
};

window.handleCheckIn = async function(attendanceId) {
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await API.updateAttendance(attendanceId, {
      status: 'Hadir',
      check_in_time: now
    });
    // Log activity
    const att = APP_STATE.attendances.find(a => a.id === attendanceId);
    if (att) {
      await API.createActivity({
        event_id: att.event_id,
        message: `Peserta ${att.registrant_name || 'peserta'} telah melakukan check-in`
      }).catch(() => {});
    }
    await syncDataFromApi();
    renderView();
  } catch (err) {
    alert(`Gagal melakukan check-in: ${err.message}`);
  }
};

// Main Render Function
function renderView() {
  const views = {
    dashboard: dashboardView,
    events: eventsView,
    registration: registrationView,
    registrants: registrantsView,
    attendance: attendanceView
  };

  const currentView = APP_STATE.activeView || 'dashboard';
  const renderFn = views[currentView] || dashboardView;
  
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.innerHTML = renderFn();
  }

  const breadcrumb = document.getElementById('breadcrumb');
  if (breadcrumb) {
    breadcrumb.textContent = {
      dashboard: 'Dashboard',
      events: 'Data Event',
      registration: 'Pendaftaran',
      registrants: 'Data Pendaftar',
      attendance: 'Presensi'
    }[currentView] || 'Dashboard';
  }

  // Update navigation active state
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.view === currentView);
  });

  // Attach dynamic view events
  bindViewEvents();
}

function bindViewEvents() {
  // Navigation Links
  document.querySelectorAll('[data-view]').forEach(el => {
    el.onclick = (e) => {
      e.preventDefault();
      APP_STATE.activeView = el.dataset.view;
      renderView();
    };
  });

  // Dashboard buttons
  const btnRefresh = document.getElementById('btnRefreshData');
  if (btnRefresh) {
    btnRefresh.onclick = async () => {
      btnRefresh.textContent = 'Menyinkronkan...';
      await syncDataFromApi();
      renderView();
    };
  }

  const btnGoCreateEvent = document.getElementById('btnGoCreateEvent');
  if (btnGoCreateEvent) {
    btnGoCreateEvent.onclick = () => {
      APP_STATE.activeView = 'events';
      APP_STATE.editingEvent = null;
      renderView();
      const createPanel = document.getElementById('createEventPanel');
      if (createPanel) {
        createPanel.style.display = 'block';
        createPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
  }

  // Events view events
  const btnToggleCreateEvent = document.getElementById('btnToggleCreateEvent');
  const createEventPanel = document.getElementById('createEventPanel');
  if (btnToggleCreateEvent && createEventPanel) {
    btnToggleCreateEvent.onclick = () => {
      if (APP_STATE.editingEvent) {
        APP_STATE.editingEvent = null;
        renderView();
      } else {
        createEventPanel.style.display = createEventPanel.style.display === 'none' ? 'block' : 'none';
      }
    };
  }

  const btnCancelCreateEvent = document.getElementById('btnCancelCreateEvent');
  if (btnCancelCreateEvent && createEventPanel) {
    btnCancelCreateEvent.onclick = () => {
      APP_STATE.editingEvent = null;
      createEventPanel.style.display = 'none';
      renderView();
    };
  }

  const btnResetEvent = document.getElementById('btnResetEvent');
  if (btnResetEvent) {
    btnResetEvent.onclick = () => {
      if (APP_STATE.editingEvent) {
        APP_STATE.editingEvent = null;
        renderView();
      } else {
        const f = document.getElementById('formCreateEvent');
        if (f) f.reset();
      }
    };
  }

  const formCreateEvent = document.getElementById('formCreateEvent');
  if (formCreateEvent) {
    formCreateEvent.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(formCreateEvent);
      const editId = formData.get('event_id');
      const payload = {
        name: formData.get('name'),
        date: formData.get('date'),
        location: formData.get('location'),
        quota: parseInt(formData.get('quota'), 10),
        status: formData.get('status') || 'Published'
      };

      const submitBtn = document.getElementById('btnSubmitEvent');
      if (submitBtn) submitBtn.textContent = 'Menyimpan...';

      try {
        if (editId) {
          await API.updateEvent(parseInt(editId, 10), payload);
          await API.createActivity({
            event_id: parseInt(editId, 10),
            message: `Event "${payload.name}" berhasil diperbarui`
          }).catch(() => {});
          APP_STATE.editingEvent = null;
        } else {
          await API.createEvent(payload);
          await API.createActivity({
            message: `Event baru "${payload.name}" berhasil ditambahkan ke sistem`
          }).catch(() => {});
        }
        await syncDataFromApi();
        renderView();
      } catch (err) {
        alert(`Gagal menyimpan event: ${err.message}`);
        if (submitBtn) submitBtn.textContent = editId ? 'Simpan Perubahan' : 'Simpan ke Database';
      }
    };
  }

  const inputEventSearch = document.getElementById('inputEventSearch');
  if (inputEventSearch) {
    inputEventSearch.oninput = (e) => {
      APP_STATE.filter.eventSearch = e.target.value;
      renderView();
    };
  }

  const selectEventStatus = document.getElementById('selectEventStatus');
  if (selectEventStatus) {
    selectEventStatus.onchange = (e) => {
      APP_STATE.filter.eventStatus = e.target.value;
      renderView();
    };
  }

  const selectEventSort = document.getElementById('selectEventSort');
  if (selectEventSort) {
    selectEventSort.onchange = (e) => {
      APP_STATE.filter.eventSort = e.target.value;
      renderView();
    };
  }

  const btnRefreshEvents = document.getElementById('btnRefreshEvents');
  if (btnRefreshEvents) {
    btnRefreshEvents.onclick = async () => {
      btnRefreshEvents.textContent = '...';
      await syncDataFromApi();
      renderView();
    };
  }

  // Registration Form
  const regSelectEvent = document.getElementById('regSelectEvent');
  if (regSelectEvent) {
    regSelectEvent.onchange = (e) => {
      APP_STATE.selectedRegistrationEventId = parseInt(e.target.value, 10);
      renderView();
    };
  }

  const formReg = document.getElementById('formRegistration');
  if (formReg) {
    formReg.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(formReg);
      const payload = {
        event_id: parseInt(formData.get('event_id'), 10),
        name: (formData.get('name') || '').trim(),
        email: (formData.get('email') || '').trim().toLowerCase(),
        phone: (formData.get('phone') || '').trim() || null,
        notes: (formData.get('notes') || '').trim() || null,
        status: formData.get('status') || 'Confirmed'
      };

      const btnSubmit = document.getElementById('btnSubmitReg');
      if (btnSubmit) btnSubmit.textContent = 'Memproses...';

      // Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email)) {
        alert('Harap masukkan format alamat email yang valid.');
        if (btnSubmit) btnSubmit.textContent = 'Simpan & Terbitkan Bukti';
        return;
      }

      try {
        const createdReg = await API.createRegistrant(payload);
        const newRegId = (createdReg && createdReg.id) ? createdReg.id : Math.floor(Math.random() * 9000 + 1000);
        
        // Also register attendance initial record if status is confirmed
        if (payload.status === 'Confirmed') {
          await API.createAttendance({
            event_id: payload.event_id,
            registrant_id: newRegId,
            status: 'Belum Hadir',
            check_in_time: null
          }).catch(() => {});
        }

        await API.createActivity({
          event_id: payload.event_id,
          message: `Pendaftar baru "${payload.name}" terdaftar pada event`
        }).catch(() => {});

        await syncDataFromApi();

        // Show receipt confirmation card state
        APP_STATE.registrationSuccessData = {
          ...payload,
          id: newRegId,
          created_at: new Date()
        };
        renderView();
      } catch (err) {
        alert(`Gagal menyimpan pendaftaran: ${err.message}`);
        if (btnSubmit) btnSubmit.textContent = 'Simpan & Terbitkan Bukti';
      }
    };
  }

  // Registrants filters
  const inputRegSearch = document.getElementById('inputRegSearch');
  if (inputRegSearch) {
    inputRegSearch.oninput = (e) => {
      APP_STATE.filter.registrantSearch = e.target.value;
      renderView();
    };
  }

  const selectRegEvent = document.getElementById('selectRegEvent');
  if (selectRegEvent) {
    selectRegEvent.onchange = (e) => {
      APP_STATE.filter.registrantEvent = e.target.value;
      renderView();
    };
  }

  const selectRegStatus = document.getElementById('selectRegStatus');
  if (selectRegStatus) {
    selectRegStatus.onchange = (e) => {
      APP_STATE.filter.registrantStatus = e.target.value;
      renderView();
    };
  }

  const btnRefreshRegistrants = document.getElementById('btnRefreshRegistrants');
  if (btnRefreshRegistrants) {
    btnRefreshRegistrants.onclick = async () => {
      await syncDataFromApi();
      renderView();
    };
  }

  const btnExportRegistrants = document.getElementById('btnExportRegistrants');
  if (btnExportRegistrants) {
    btnExportRegistrants.onclick = () => {
      const data = APP_STATE.registrants || [];
      if (data.length === 0) return alert('Tidak ada data pendaftar untuk diekspor.');
      const headers = ['ID', 'Nama', 'Email', 'Telepon', 'Event ID', 'Status', 'Catatan'];
      const rows = data.map(r => [
        r.id,
        `"${r.name || ''}"`,
        `"${r.email || ''}"`,
        `"${r.phone || ''}"`,
        r.event_id,
        `"${r.status || ''}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `pendaftar_evently_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }

  // Attendance filters
  const selectAttendanceEvent = document.getElementById('selectAttendanceEvent');
  if (selectAttendanceEvent) {
    selectAttendanceEvent.onchange = (e) => {
      APP_STATE.filter.attendanceEvent = e.target.value;
      renderView();
    };
  }

  const btnRefreshAttendance = document.getElementById('btnRefreshAttendance');
  if (btnRefreshAttendance) {
    btnRefreshAttendance.onclick = async () => {
      await syncDataFromApi();
      renderView();
    };
  }
}