# bits/

Small interactive components, in the [React Bits](https://reactbits.dev) model:
**copy-in source you own**, not an installed dependency.

React Bits distributes via the `jsrepo` CLI rather than npm, precisely so the
code lands in your repo and you can edit it. The components here follow that
convention and are adapted from the patterns React Bits popularised:

| File               | React Bits analogue      | Used by                        |
| ------------------ | ------------------------ | ------------------------------ |
| `CountUp.tsx`      | Count Up                 | Hero stats, project metrics    |
| `SpotlightCard.tsx`| Spotlight Card           | Bento tiles, capability cards  |
| `TiltCard.tsx`     | Tilted Card              | Featured anchor tile           |
| `RotatingText.tsx` | Rotating Text            | Hero subtitle                  |
| `WordReveal.tsx`   | Split / Blur Text        | Hero headline, section titles  |
| `Marquee.tsx`      | Scroll Velocity          | Stack ticker                   |

To pull in additional React Bits components:

```bash
npx jsrepo add https://reactbits.dev/ts/tailwind/<Category>/<Component>
```

## House rules

Every component here must:

1. Accept `prefers-reduced-motion` and degrade to a **static, complete** state —
   never a blank one. `CountUp` renders the final number; `RotatingText` renders
   the first phrase; `WordReveal` renders plain text.
2. Attach pointer listeners to the element itself, not `window`, and never keep
   a listener alive after unmount.
3. Be decorative-only. No component in this folder may be the sole carrier of
   information, so a reader who gets the static fallback loses nothing.
