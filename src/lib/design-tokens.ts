// Design Tokens - Motion, Spacing, Colors
// Based on impeccable design system standards

export const motionTokens = {
  // Duration tokens (100/300/500 rule)
  instant: '100ms',
  fast: '150ms',
  smooth: '200ms',
  normal: '300ms',
  entrance: '500ms',
  exit: '375ms', // 75% of entrance

  // Easing curves (exponential for natural physics)
  easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
  easeOutQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeIn: 'cubic-bezier(0.7, 0, 0.84, 0)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;

export const spacingTokens = {
  // 4pt base scale: granular and precise
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
  '4xl': '64px',
  '5xl': '96px',

  // Named values for semantic use
  gutter: '16px', // Standard grid spacing
  section: '48px', // Space between major sections
  column: '24px', // Space between columns
} as const;

export const colorTokens = {
  // Semantic colors (OKLCH - perceptually uniform)
  success: {
    light: {
      bg: 'oklch(92% 0.05 142)',
      text: 'oklch(28% 0.08 142)',
    },
    dark: {
      bg: 'oklch(28% 0.08 142 / 0.15)',
      text: 'oklch(82% 0.1 142)',
    },
  },
  warning: {
    light: {
      bg: 'oklch(93% 0.08 70)',
      text: 'oklch(42% 0.15 70)',
    },
    dark: {
      bg: 'oklch(42% 0.15 70 / 0.15)',
      text: 'oklch(85% 0.15 70)',
    },
  },
  error: {
    light: {
      bg: 'oklch(92% 0.06 29)',
      text: 'oklch(32% 0.1 29)',
    },
    dark: {
      bg: 'oklch(32% 0.1 29 / 0.15)',
      text: 'oklch(82% 0.12 29)',
    },
  },
  info: {
    light: {
      bg: 'oklch(91% 0.05 250)',
      text: 'oklch(28% 0.08 250)',
    },
    dark: {
      bg: 'oklch(28% 0.08 250 / 0.15)',
      text: 'oklch(82% 0.1 250)',
    },
  },
} as const;

export const elevationTokens = {
  // Z-index scale for layering
  dropdown: 1000,
  stickyHeader: 900,
  modalBackdrop: 800,
  modal: 801,
  toast: 1100,
  tooltip: 1200,

  // Shadow scales
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// Type exports for CSS-in-JS usage
export type MotionToken = typeof motionTokens[keyof typeof motionTokens];
export type SpacingToken = typeof spacingTokens[keyof typeof spacingTokens];
export type ElevationToken = typeof elevationTokens[keyof typeof elevationTokens];
