# JobPilot Design System

This documents the design that already exists in the project (CSS modules under `app/`, plus `app/globals.css`). Follow it when adding or changing UI. For the responsive rules, see "UI & Layout Requirements" in [CLAUDE.md](CLAUDE.md).

## Overview

- **Look**: clean, light, blue-toned SaaS dashboard. White cards on a pale blue canvas, navy text and primary actions, cyan accents, soft blue-tinted shadows.
- **Landing page**: a glass/liquid aesthetic with an animated LiquidChrome background, a pill-shaped glass navbar and a bright cyan call-to-action.
- **Styling approach**: CSS Modules per page or component (`page.module.css`) with hardcoded hex values. Tailwind 4 and shadcn tokens are installed (`globals.css`) but are used very little in the real UI. Match the CSS-module style already in use.
- **Mode**: light only. The shadcn `.dark` tokens exist but the product UI is not themed for dark mode.

## Color

### Brand
| Role | Hex | Use |
|---|---|---|
| Navy (primary) | `#0B2D72` | Page titles, primary buttons, focus borders, sidebar and nav text (often as `rgba(11,45,114,α)`) |
| Deep navy | `#0A2460` | Darker hover or pressed navy |
| Ocean blue (accent) | `#0992C2` | Accent text, links, highlights, "Good" score state |
| Cyan (CTA) | `#0AC4E0` | Landing-page primary CTA background (text `#050E2D`) |
| Cyan hover | `#0BD4F4` | CTA hover |
| Canvas | `#EBF0FA` | Dashboard page background |
| Surface | `#FFFFFF` | Cards, inputs |

Navy is used at low alpha for tints: `rgba(11,45,114,0.35)` for section labels, `0.08` for hover fills and dividers, `0.25` for the mobile overlay.

### Neutrals (Tailwind gray scale)
| Hex | Use |
|---|---|
| `#111827` | Headings and strongest body text |
| `#374151` | Body text, input text, labels |
| `#6B7280` | Subtitles, secondary text |
| `#9CA3AF` | Placeholders, icons, captions, muted labels |
| `#C4C9D4` | Input placeholder text |
| `#D1D5DB` | Dashed borders, scrollbar thumbs |
| `#E5E7EB` | Default borders |
| `#F3F4F6` / `#F9FAFB` | Subtle fills, stat boxes, upload areas |

### Semantic
| Meaning | Text/stroke | Soft background |
|---|---|---|
| Success / strong | `#16A34A` (ring uses `#22C55E`) | `#F0FDF4` |
| Warning / improve | `#F59E0B` | `#FFFBEB` |
| Error / weak | `#EF4444`, `#DC2626` (error text, delete hover) | `#FEF2F2` |
| Info / good | `#0992C2` | `#E0F2FE` |

**Score colors** (used for rings, badges, per-question scores):
- Overall session score: `>= 80` green, `>= 60` ocean blue, below that red. Labels are "Excellent", "Good" and "Needs work".
- Per-question score (out of 10): `>= 7 or 8` green, middle band amber `#F59E0B`, low red.

### Category tags (interview)
Pill tags use a soft background with a darker text of the same hue:
- **Type**: Mixed `#EFF6FF`/`#2563EB`, Technical `#ECFDF5`/`#059669`, Behavioral `#F5F3FF`/`#7C3AED`. Solid versions for charts and values: `#3B82F6`, `#10B981`, `#8B5CF6`.
- **Difficulty**: Entry `#ECFEFF`/`#0E7490`, Mid `#FFFBEB`/`#92400E`, Senior `#FFF1F2`/`#9F1239`.

## Typography

- **Family**: system stack `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. Form controls use `font-family: inherit`. PDF output (resume and cover letter) uses Helvetica/Arial or Georgia/Times separately.
- **Rendering**: `-webkit-font-smoothing: antialiased`.
- **Scale** (rem, base 16px):
  - Hero headline: `clamp(2.8rem, 6vw, 5rem)`, weight 800, line-height 1.08, letter-spacing `-0.03em`
  - Hero subheadline: `clamp(1rem, 1.5vw, 1.15rem)`, line-height 1.65
  - Dashboard page title: `1.6rem`, weight 800, `-0.02em`
  - Section/overview title: `1.5rem`, weight 700, `-0.02em`
  - Card title: `1.25rem`, weight 700, `-0.01em`
  - Body and inputs: `0.875rem`
  - Labels: `0.8125rem`, weight 600
  - Tags and captions: `0.75rem`
  - Section labels: `0.7rem`, weight 700, uppercase, `letter-spacing: 0.08em`
  - Big score number: `2.25rem`, weight 800, `-0.03em`
- Headings use tight negative letter-spacing and heavy weights (700-800). Small uppercase labels use positive tracking.

## Shape, Elevation, Borders

- **Radii**: inputs and selects `10px` (the most common value); buttons `10-12px`; cards `14-16px`; large panels `20px`; pills, tags and nav `999px`/`50px`; avatars `50%`.
- **Card shadow**: `0 4px 24px rgba(11,45,114,0.08), 0 1px 4px rgba(11,45,114,0.04)`. Shadows are always navy-tinted, never pure black.
- **Sidebar shadow**: `2px 0 24px rgba(11,45,114,0.06)`.
- **Button hover glow**: `0 4px 14px rgba(11,45,114,0.35)`.
- **Borders**: `1.5px solid #E5E7EB` on inputs and filter buttons; `1px solid #E5E7EB` on cards and badges; upload areas use `1.5px dashed #D1D5DB`.
- **Focus**: input border changes to navy `#0B2D72`. Glass surfaces use a `2px` outline (`#007AFF`).

## Layout

### Dashboard shell ([dashboard.module.css](app/dashboard/dashboard.module.css))
- Flex row on `#EBF0FA`. Left **glass sidebar** 260px wide, sticky and full height: `rgba(255,255,255,0.5)` with `backdrop-filter: blur(20px)`, a `1px rgba(255,255,255,0.6)` right border and the soft shadow above.
- Sidebar content: logo (90px tall, `mix-blend-mode: multiply`), a section of nav items with uppercase section labels, and a bottom block separated by a `1px rgba(11,45,114,0.08)` rule.
- **Main area**: `padding: 32px`, `gap: 28px`, column flex. The top bar holds the page title (navy, 800) on the left and the avatar on the right. The avatar is a 38px circle with `linear-gradient(135deg, #0992C2, #0B2D72)` and a white initial.
- Navigation uses `GlassBubbleNav` (a glass pill that follows the active item). Icons are FontAwesome at 16x16.
- Dashboard sections (Swipe Jobs, Job Matches, Resume Analyzer, Cover Letter, Mock Interview, Profile, Settings) render inside the main area, switched by state rather than routes.

### Mobile behavior
- At `<= 768px` the sidebar becomes an off-canvas drawer (`translateX(-100%)`, `0.3s ease`) with a navy `rgba(11,45,114,0.25)` blurred overlay. A three-line hamburger (22px lines, navy) animates into an X.
- Main padding steps down: `32px` -> `20px 16px` (768px) -> `16px 12px` (480px).

### Content widths
- Form card: `max-width: 535px`, `width: calc(100% - 32px)`, centered, `padding: 32px`.
- Overview/list pages: `max-width: 1100px`, centered, `padding: 0 16px`. The cap is removed when a detail panel is open.
- Landing nav: `width: calc(100% - 48px)`, `max-width: 1100px`, `64px` tall.

### Spacing
Spacing is on a 4px grid: 4, 6, 8, 10, 12, 16, 20, 24, 28, 32. Common values: card padding `32px`, card gap `20px`, form grid gap `16px`, label-to-input gap `6px`, control row gap `10px`.

## Components

### Buttons
- **Primary (app)**: navy `#0B2D72` background, white text, `border-radius: 12px`, `padding: 14px`, `0.9375rem`/600, full width in forms. Hover: opacity 0.92 plus the navy glow. Active: opacity 0.85. Disabled: opacity 0.6 and `not-allowed`.
- **Primary (landing)**: cyan `#0AC4E0` pill (`50px`), text `#050E2D`, weight 700. Hover: `#0BD4F4` and `scale(1.03)`. Sizes: nav `8px 20px`, hero `14px 32px`.
- **Secondary / sign out**: transparent, `1.5px solid rgba(11,45,114,0.35)`, navy text, pill radius.
- **Text link** (Sign In): `rgba(11,45,114,0.8)` -> navy on hover.
- **Filter button**: white, `1.5px #E5E7EB` border, `10px` radius, `9px 14px` padding.
- **Destructive affordance**: icon buttons are `#9CA3AF` and turn `#DC2626` on hover.

### Inputs
- Text, select and textarea: white background, `1.5px solid #E5E7EB`, `10px` radius, `10px 12px` padding, `0.875rem`, `#374151` text, `#C4C9D4` placeholder, navy border on focus, `0.15s` border transition.
- Select: native appearance removed, `36px` right padding, a small `#9CA3AF` chevron positioned absolutely.
- Textarea: `line-height: 1.5`, vertical resize only.
- Search: icon inset `11px` left, input `padding-left: 32px`.
- Upload: full-width dashed `#D1D5DB` box on `#F9FAFB`. Hover darkens the border to navy with a faint navy tint.
- Field pattern: label (`0.8125rem`/600/`#374151`) above input, with an optional-hint span in `#9CA3AF` weight 400. Two-column `1fr 1fr` grids collapse on small screens.
- Errors: `0.8125rem`, `#DC2626`, no icon.

### Cards
White, `16px` radius, navy-tinted shadow, `32px` padding (reduce on small screens), column flex with `20px` gap. Header block = title + subtitle with a `4px` gap.

### Tags and badges
Pill (`999px`), `3px 10px`, `0.75rem`/500, soft background with matching dark text (see Category tags). Shrinks to `2px 8px` / `0.7rem` on narrow screens. The landing badge is a navy-tinted pill with a `1px rgba(11,45,114,0.25)` border and `#0992C2` text.

### Score displays
- **Ring**: SVG circle, track `#E5E7EB`, stroke colored by score, `strokeLinecap: round`, rotated -90deg. Hidden on very narrow cards (~600px).
- **Score badge** (detail panel): `96px` wide, `14px` radius, `1px #E5E7EB` border, `#F9FAFB` fill, 2.25rem number over a small `/100` denominator and an uppercase caption.
- **Stat cards**: small bordered boxes with a muted label and a colored value (colored by type or difficulty).
- **Insight bullets**: small colored dot (green strength, amber improvement) beside text; "Areas to Improve" headings use `#F59E0B`.

### Glass surfaces
`GlassSurface` and the sidebar/nav use frosted glass: translucent white (`0.25-0.5`), `backdrop-filter: blur(12-20px) saturate(1.8)`, a thin light border and inset highlights. Includes a `@supports not (backdrop-filter)` fallback with a more opaque background. Use for navigation chrome, not for content cards.

### Empty states
Decorative concentric rings plus a short message and a call to action (see the `emptyRing*` styles in the interview module and `resumeAnalyzer/_components/emptyState`).

## Motion

- **Transitions**: `0.15s` for borders, opacity and color on controls; `0.2s` for hover color and background; `0.25-0.3s` for transforms such as the drawer and hamburger; `0.26s ease-out` for glass opacity.
- **Page/tab enter** (framer `motion`): `initial {opacity: 0, y: 14}` -> `animate {opacity: 1, y: 0}`, `0.28s easeOut`.
- **Scroll reveals**: `AnimatedContent`, `AnimatedContentLeft/Right` and `TopAnimatedContent` (GSAP/motion) for landing sections.
- **Landing hero**: `LiquidChrome` WebGL background (soft blue `baseColor [0.55, 0.68, 0.96]`, slow speed 0.15, interactive), `LogoLoop` marquee. Hover micro-interactions are subtle: `scale(1.03)`, opacity dips, glow shadows.
- Respect users' reduced-motion preferences when adding new animation.

## Iconography

- **FontAwesome** (`@fortawesome/free-solid-svg-icons`) for the dashboard sidebar, sized 16x16.
- **Lucide React** for in-page icons (e.g. `AlertCircle` at 13px in the interview views).
- Icons are `#9CA3AF` by default, take the semantic color when conveying state, and use `flex-shrink: 0`.

## Responsive Behavior (current state)

Existing media queries are all `max-width`, with breakpoints at **1250, 1100, 1000, 900, 768, 640, 600, 560, 480, 420px**. The most common are 768px (sidebar to drawer, stacked layouts) and 480px (tighter padding, smaller tags). Fluid type uses `clamp()` on the landing hero. `html, body` set `overflow-x: hidden` and `max-width: 100vw`.

New work should add finer-grained breakpoints and fluid sizing per the CLAUDE.md requirement, so layouts scale smoothly from very large screens down to very small phones.

## Conventions for New UI

1. Create a `*.module.css` next to the component; use the palette above rather than inventing colors.
2. Use navy for primary actions and titles, ocean blue for accents, cyan only for landing-page CTAs.
3. Use `10px` radius for controls, `16px` for cards, pill radius for tags and nav.
4. Keep shadows navy-tinted and soft; keep borders `#E5E7EB`.
5. Use the neutral gray scale for text hierarchy (`#111827` -> `#374151` -> `#6B7280` -> `#9CA3AF`).
6. Reuse semantic colors for status, and the score thresholds above for any score visualization.
7. Reuse `GlassSurface`/glass styles only for chrome and navigation.

## Tokens (source of truth)

`/tokens.css` (imported first in `app/layout.jsx`) holds every colour, font, spacing, radius, easing and duration as a named CSS variable, converted from the hex values above to OKLCH. Hallmark-managed CSS (currently the interview page) references tokens only: no raw hex, `rgb()` or `oklch()` in component CSS. When a page needs a value that doesn't exist, add it to `tokens.css` first.

### Amendments — interview redesign (2026-10-02)

- **Text-safe variants.** Ocean `#0992C2` and success `#16A34A` fall under 4.5:1 as small text, so text uses `--color-accent-strong` / `--color-success-strong`; the original tones stay for rings, bars, dots and icons. Text on an ocean fill uses `--color-accent-ink`.
- **Technical tag** text darkened from `#059669` to `--color-type-technical` (≈ `#047857`) to reach 4.5:1 on its tint.
- **Muted** (`--color-muted`) lifted from `#9CA3AF` to ≈ `#8A92A3` so icons clear 3:1; placeholders use `--color-neutral`.
- **Amber as text** uses `--color-warning` (`#B45309`); `#F59E0B` (`--color-warning-mark`) is for dots and bars only.
- **Hover = one signal.** Buttons change colour on hover; the only movement is a 1px press on `:active`. No hover lifts or glows.
- **Pages respond to their container**, not just the viewport (`container-type: inline-size`), because the sidebar appearing at 769px shrinks the content area.

### Amendments — live session (2026-10-02)

- **Focus mode.** While a round is live the dashboard hides its sidebar and top bar (`onSessionChange` from the interview page → `focusMode` in `app/dashboard/page.jsx`); ending the round restores them.
- **Wave backdrop.** The React Bits `GradientWaves` background (`app/components/ui/GradientWaves/`) fills the whole viewport behind the session, in a light palette: `--wave-horizon` / `--wave-body` / `--wave-crest` in `tokens.css` (hex, because the WebGL shader takes sRGB), read at runtime, over `--color-canvas`. `fogDepth` is 26 (stock 15) so the light swell stays visible on a light page. Never the stock purple/pink.
- **Question deck.** One question per paper card. Cards rise from the deck (y 96 → 0, 0.6s ease-out), grow in place when the answer starts (motion `layout`), and leave by continuing upward (y → −240, ease-in) before the next card rises. Cards still to come peek below as up to two faded paper edges.
- **Voice-synced text.** The question types out over the measured length of the interviewer's audio; a hidden full copy reserves its height so the card never jumps. Answer words settle in (opacity + 3px blur) as speech recognition returns them.
- **Voice waves.** Interviewer wave = ocean bars driven by the TTS audio. Your wave = bars driven by the live mic spectrum; colour mixes navy → cyan with the voice's brightness (`--tone`).
- **Reduced motion:** waves stop drifting, text appears whole, cards crossfade without travel.

### Amendments — round feedback card (2026-10-02)

- **No side panel.** Clicking a past round opens a centred overlay (navy scrim, 6px blur) holding a React Bits `FlipCard` (`components/FlipCard.jsx`, installed via `npx shadcn add @react-bits/FlipCard-JS-CSS`). It arrives on its back and springs to the front.
- **Front = the round at a glance:** date + type/level tags, score ring + label, role, questions/duration/answered, then "What worked" and "Work on next" side by side. **Back = the full feedback:** all strengths and improvements, then every question with its score chip and feedback, scrolling inside the card.
- **Flip** by click/tap/drag anywhere except the back's scroll list (so reading and selecting text never flips it), the "Show feedback / Show summary" button, or Enter. Close with Esc, the × or the scrim.
- FlipCard colours are tokens (`background="var(--color-paper)"`, `shadowColor="var(--color-navy)"`); its size is measured from the viewport because the component takes px.

### Amendments — New Interview intro (2026-10-03)

- **The New Interview tab opens on "How a practice round works"**: the four steps (set up · answer out loud · review feedback · practice again) as tone cards — paper, cyan, ocean (`--color-accent-strong`), navy — travelling a React Bits `InfiniteSpiral` (`components/InfiniteSpiral.jsx`), then one React Bits `SpecularButton` ("Get started", navy fill, rim light from `--specular-line` / `--specular-base`).
- **The setup panel appears only after "Get started"**, with a "How it works" back link. The Overview empty state's "Set up a round" jumps straight to setup.
- **Spiral adaptations (marked `JobPilot:` in the source):** items may render `content` instead of an image, and the fit-to-width scale accounts for the helix radius so text cards stay readable on phones. Steps are also listed in order for screen readers; the spiral itself is `aria-hidden`.
- **Copy stays honest:** the steps don't claim resume tailoring, because the resume upload isn't sent to the backend yet.

## Exports

Drop-in formats for reusing this system elsewhere. `tokens.css` is the source; these mirror its core roles.

### tokens.css (core)
```css
:root {
  --color-canvas:        oklch(95.6% 0.013 265);
  --color-paper:         oklch(99.4% 0.003 265);
  --color-paper-2:       oklch(97.2% 0.005 265);
  --color-paper-3:       oklch(94.6% 0.008 265);
  --color-rule:          oklch(92.8% 0.006 265);
  --color-rule-2:        oklch(87.2% 0.010 265);
  --color-ink:           oklch(21.0% 0.032 265);
  --color-ink-2:         oklch(37.3% 0.034 260);
  --color-neutral:       oklch(51.0% 0.025 264);
  --color-muted:         oklch(62.0% 0.022 262);
  --color-navy:          oklch(31.5% 0.130 264);
  --color-navy-ink:      oklch(98.5% 0.006 265);
  --color-accent:        oklch(61.0% 0.120 232);
  --color-accent-strong: oklch(50.0% 0.115 236);
  --color-accent-ink:    oklch(99.0% 0.004 230);
  --color-focus:         oklch(61.0% 0.120 232);
  --color-error:         oklch(57.7% 0.215 27);

  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  --space-3xs: 0.125rem; --space-2xs: 0.25rem; --space-xs: 0.5rem;
  --space-sm:  0.75rem;  --space-md:  1rem;    --space-lg: 1.5rem;
  --space-xl:  2.5rem;   --space-2xl: 4rem;

  --radius-input: 10px; --radius-btn: 12px; --radius-card: 16px; --radius-pill: 999px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-micro: 120ms; --dur-short: 200ms; --dur-long: 420ms;
}
```

### Tailwind v4 `@theme`
```css
@theme {
  --color-canvas:  oklch(95.6% 0.013 265);
  --color-paper:   oklch(99.4% 0.003 265);
  --color-ink:     oklch(21.0% 0.032 265);
  --color-navy:    oklch(31.5% 0.130 264);
  --color-accent:  oklch(61.0% 0.120 232);
  --color-rule:    oklch(92.8% 0.006 265);
  --font-body:     -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --spacing-xs: 0.5rem; --spacing-sm: 0.75rem; --spacing-md: 1rem; --spacing-lg: 1.5rem; --spacing-xl: 2.5rem;
  --radius-card: 16px; --radius-input: 10px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`
```json
{
  "color": {
    "canvas":  { "$value": "oklch(95.6% 0.013 265)", "$type": "color" },
    "paper":   { "$value": "oklch(99.4% 0.003 265)", "$type": "color" },
    "ink":     { "$value": "oklch(21.0% 0.032 265)", "$type": "color" },
    "navy":    { "$value": "oklch(31.5% 0.130 264)", "$type": "color" },
    "accent":  { "$value": "oklch(61.0% 0.120 232)", "$type": "color" },
    "rule":    { "$value": "oklch(92.8% 0.006 265)", "$type": "color" }
  },
  "font":  { "body": { "$value": "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif", "$type": "fontFamily" } },
  "space": {
    "xs": { "$value": "0.5rem",  "$type": "dimension" },
    "md": { "$value": "1rem",    "$type": "dimension" },
    "lg": { "$value": "1.5rem",  "$type": "dimension" }
  },
  "duration": { "short": { "$value": "200ms", "$type": "duration" } }
}
```

### shadcn/ui variables
Not applied — `app/globals.css` keeps its stock shadcn neutrals. To align shadcn components with JobPilot, map:
```css
:root {
  --background: oklch(95.6% 0.013 265);  /* canvas */
  --foreground: oklch(21.0% 0.032 265);  /* ink */
  --card:       oklch(99.4% 0.003 265);  /* paper */
  --primary:    oklch(31.5% 0.130 264);  /* navy */
  --primary-foreground: oklch(98.5% 0.006 265);
  --accent:     oklch(61.0% 0.120 232);  /* ocean */
  --border:     oklch(92.8% 0.006 265);  /* rule */
  --input:      oklch(87.2% 0.010 265);  /* rule-2 */
  --ring:       oklch(61.0% 0.120 232);  /* focus */
  --radius:     1rem;
}
```
