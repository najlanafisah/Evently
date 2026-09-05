/**
 * Evently State Management
 */

window.APP_STATE = {
  activeView: 'dashboard',
  apiConnected: false,
  isLoading: false,
  lastSync: null,
  error: null,
  eventViewMode: 'table',
  selectedEventId: null,
  editingEvent: null,
  registrationSuccessData: null,
  selectedRegistrationEventId: null,
  events: [],
  summary: [],
  registrants: [],
  attendances: [],
  activities: [],
  users: [],
  filter: {
    eventSearch: '',
    eventStatus: 'all',
    eventSort: 'date-asc',
    registrantSearch: '',
    registrantEvent: 'all',
    registrantStatus: 'all',
    attendanceEvent: 'all'
  }
};

window.syncDataFromApi = async function() {
  APP_STATE.isLoading = true;
  try {
    await API.health();
    APP_STATE.apiConnected = true;

    const [events, summary, registrants, attendances, activities] = await Promise.all([
      API.getEvents().catch(() => []),
      API.getEventSummary().catch(() => []),
      API.getRegistrants().catch(() => []),
      API.getAttendances().catch(() => []),
      API.getActivities(10).catch(() => [])
    ]);

    // Map events with registrant count from summary
    APP_STATE.summary = summary;
    APP_STATE.events = events.map(e => {
      const sum = summary.find(s => s.event_id === e.id);
      return {
        ...e,
        registrants: sum ? sum.total_registrants : (e.registrants || 0)
      };
    });

    APP_STATE.registrants = registrants;
    APP_STATE.attendances = attendances;
    APP_STATE.activities = activities;
    APP_STATE.lastSync = new Date();
    APP_STATE.error = null;

    // Sync to EVENT_DATA for backward compatibility
    if (window.EVENT_DATA) {
      window.EVENT_DATA.events = APP_STATE.events;
      window.EVENT_DATA.registrants = registrants.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        event: r.event_name || (events.find(e => e.id === r.event_id)?.name) || '-',
        status: r.status
      }));
      window.EVENT_DATA.activities = activities.map(a => a.message);
    }
  } catch (err) {
    console.warn('[Evently] Gagal mengambil data API, beralih ke Mock Data:', err.message);
    APP_STATE.apiConnected = false;
    APP_STATE.error = err.message;
    if (window.EVENT_DATA) {
      APP_STATE.events = window.EVENT_DATA.events || [];
      APP_STATE.registrants = window.EVENT_DATA.registrants || [];
      APP_STATE.activities = (window.EVENT_DATA.activities || []).map((msg, idx) => ({ id: idx, message: msg }));
    }
  } finally {
    APP_STATE.isLoading = false;
  }
};