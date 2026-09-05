# IMPLEMENTATION_PLAN — Event Management SaaS

## 1. Technical Constraints
- HTML5
- CSS3
- Vanilla JavaScript
- No framework required
- No backend integration in the initial phase
- Mock data stored in JavaScript modules or a single data source

## 2. Proposed Structure
```text
project/
├── index.html
├── assets/
│   ├── css/
│   │   ├── reset.css
│   │   ├── tokens.css
│   │   └── app.css
│   └── js/
│       ├── data.js
│       ├── state.js
│       ├── components.js
│       ├── views.js
│       └── app.js
├── PRD.md
├── UI-GUIDELINE.md
├── IMPLEMENTATION_PLAN.md
├── AGENTS.md
└── prompt-execution.md
```

## 3. Implementation Phases
### Phase 1 — Foundation
- Create HTML shell.
- Add design tokens and global styles.
- Build app layout: sidebar, topbar, content area.
- Create reusable button, badge, card, table, form, and modal patterns.

### Phase 2 — Dashboard
- Render metric cards.
- Render upcoming events.
- Render recent activity.
- Add responsive layout behavior.

### Phase 3 — Event Management
- Event list view.
- Event detail view.
- Create/edit event form.
- Search, filter, and status badges.

### Phase 4 — Registration
- Public-style registration form.
- Validation and confirmation state.
- Registration data insertion into mock state.

### Phase 5 — Participant Data
- Participant table.
- Detail drawer/modal.
- Search, filtering, and export-ready data structure.

### Phase 6 — Attendance
- Attendance view by event.
- Check-in interaction.
- Attendance summary and status updates.

### Phase 7 — Quality Pass
- Responsive testing.
- Keyboard and focus testing.
- Empty/loading/error states.
- Visual consistency audit against UI-GUIDELINE.
- Remove unused code and duplicated styles.

## 4. State Model
```js
{
  events: [],
  registrants: [],
  attendance: [],
  ui: {
    activeView: "dashboard",
    selectedEventId: null,
    selectedRegistrantId: null
  }
}
```

## 5. Definition of Done
- All core navigation items work.
- Mock CRUD interactions work in the browser.
- Registration updates participant data.
- Attendance updates attendance status.
- UI matches the monochrome SaaS guideline.
- No console errors.
- Layout works on mobile and desktop.
