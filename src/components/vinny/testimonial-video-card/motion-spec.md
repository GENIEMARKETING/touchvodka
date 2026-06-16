# Testimonial Video Card — motion spec

| Field | Value |
|---|---|
| **Sequence** | Idle: a static poster in a fixed 16:9 box with a play affordance. On click: the `<video>` mounts (bytes fetched only now) and autoplays with native controls. No looping, no decorative animation. |
| **Trigger** | User click only (`onClick` → `setPlaying(true)`). Never on scroll/hover/mount. |
| **Easing** | Hover overlay is a **color-only** transition (`transition-colors`) — no transform, so it's safe under reduced motion. |
| **Duration** | Hover tint ~150ms (Tailwind default). |
| **Stagger** | n/a (in a grid, the container owns any entrance stagger). |
| **Perf budget** | At rest = one `loading="lazy"` poster. The video element is not in the DOM until play → zero video bytes, zero extra INP cost on first paint. Fixed `aspect-video` box reserves space for both poster and video → CLS = 0. |
| **Reduced motion** | Fully honored: nothing autoplays/loops. Playback is user-initiated (intentional motion is permitted). The only idle effect is a color tint (not motion). |
| **Don'ts** | Don't autoplay (data + motion + a11y violation); don't preload the video (`preload="none"` equivalent achieved by mounting on click); don't add a transform-based hover zoom (would need a `motion-reduce` guard and fights the play affordance). Always pass a `posterUrl` so the box is reserved. |
