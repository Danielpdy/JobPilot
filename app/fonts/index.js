// ═══════════════════════════════════════════════════════════
// Site fonts — the one place to change typefaces for the whole front end.
//
// To swap a font: drop the .woff2 next to this file and change `path`
// (and `weight`) below. Nothing else needs editing. tokens.css maps
// these to --font-body and --font-display, and every page reads those.
//
//   primary → body text, labels, buttons, inputs     (--font-body)
//   accent  → titles, headings, big figures          (--font-display)
//
// Current pair: Supreme + Chubbo Bold (Fontshare, ITF Free Font License).
// ═══════════════════════════════════════════════════════════
import localFont from 'next/font/local';

export const primaryFont = localFont({
  src: [{ path: './Supreme-Variable.woff2', weight: '100 800', style: 'normal' }],
  variable: '--font-primary',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});

export const accentFont = localFont({
  src: [{ path: './Chubbo-Bold.woff2', weight: '700', style: 'normal' }],
  variable: '--font-accent',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

// Applied to <html> in app/layout.jsx so every page can read the variables
export const fontVariables = `${primaryFont.variable} ${accentFont.variable}`;
