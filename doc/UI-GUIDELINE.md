# UI-GUIDELINE — Event Management SaaS

## 1. Design Direction
Modern futuristic SaaS with a monochrome foundation:
- Primary colors: white and black
- Supporting colors: neutral gray
- Accent colors are used sparingly for status and interaction
- Visual style: clean, editorial, structured, premium, and operational

## 2. Color Tokens
```css
--color-bg: #f7f7f5;
--color-surface: #ffffff;
--color-surface-dark: #111111;
--color-text: #111111;
--color-text-muted: #6b6b6b;
--color-border: #e6e6e3;
--color-border-strong: #cfcfca;
--color-success: #26734d;
--color-warning: #9a6b16;
--color-danger: #b33a3a;
```

## 3. Typography
- Use a modern sans-serif system font stack.
- Page title: strong, compact, high contrast.
- Section title: medium/semibold.
- Body: readable and neutral.
- Metadata: smaller, muted, never overly decorative.

## 4. Layout
- Desktop: fixed sidebar + flexible content area.
- Mobile: collapsible or horizontal navigation pattern.
- Use generous whitespace and consistent 8px spacing increments.
- Main content max width should prevent excessive line length.
- Cards should group meaningful information only.

## 5. Components
### Navigation
- Black or near-black active state.
- Clear icon and label pairing.
- Active item must be visually distinct.

### Buttons
- Primary: black background, white text.
- Secondary: white background, black text, neutral border.
- Destructive: restrained red treatment.
- Button labels use direct verbs.

### Cards
- White surface, subtle border, medium radius.
- Avoid excessive shadows.
- Use strong hierarchy between metric, label, and supporting text.

### Tables
- Clear header row.
- Compact but readable density.
- Status shown as badges.
- On small screens, allow horizontal table scrolling or transform rows into cards.

### Forms
- Labels always visible.
- Inputs have clear focus state.
- Validation message appears near the relevant field.
- Required fields are explicit.

### Status Badges
- Draft: neutral
- Published: dark/positive
- Ongoing: warning
- Completed: neutral
- Cancelled: danger

## 6. Interaction States
Every major view must account for:
- Default
- Hover
- Focus
- Loading
- Empty
- Success
- Error
- Disabled

## 7. Responsive Rules
- Mobile-first structure.
- No content should require page-level horizontal scrolling.
- Dashboard metric cards stack on small screens.
- Tables remain usable through controlled horizontal scrolling when necessary.

## 8. UX Principles
- Prioritize operational clarity over decoration.
- Keep primary actions visible.
- Use confirmation for destructive actions.
- Preserve user context after create/edit actions.
- Make status and next steps obvious.
