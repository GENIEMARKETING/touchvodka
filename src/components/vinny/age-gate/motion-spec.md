# Age Gate — motion spec

| Field | Value |
|---|---|
| **Sequence** | native `<dialog>` opens modally on first visit; backdrop fades, panel fades in |
| **Trigger** | mount, only when `localStorage['vinny-age-verified'] !== 'true'` |
| **Easing** | CSS `open:` transition on the native dialog — no JS timeline |
| **Perf budget** | zero layout shift (overlay is fixed/centered); no scroll lock library needed (native `<dialog>` makes the background inert) |
| **Reduced motion** | `motion-reduce:transition-none` — appears instantly, no fade |
| **A11y** | focus is trapped by the platform; `Esc` is intentionally NOT a dismissal (compliance), so `onClose` is a no-op and the only exits are accept / leave |
| **Don'ts** | don't render it server-side open (first-paint flash); don't allow backdrop-click dismissal here |
