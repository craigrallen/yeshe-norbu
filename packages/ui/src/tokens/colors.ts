/** Brand color tokens for Yeshin Norbu. */
export const colors = {
  primary: {
    DEFAULT: '#C8A951',
    light: '#E0CB7E',
    dark: '#A08530',
  },
  secondary: {
    DEFAULT: '#2D2D2D',
    light: '#4A4A4A',
    dark: '#1A1A1A',
  },
  accent: {
    DEFAULT: '#B8763C',
    light: '#D4985E',
    dark: '#8C5A2B',
  },
  surface: '#FFFFFF',
  background: '#F9F7F4',
  text: {
    primary: '#1A1A1A',
    muted: '#6B6B6B',
    inverse: '#FFFFFF',
  },
  border: '#E5E1DC',
  success: '#2D7D46',
  error: '#C53030',
  warning: '#D69E2E',
} as const;

/**
 * CSS custom property declarations for use in a global stylesheet.
 * Apply these to :root to make tokens available everywhere.
 */
export const cssVars = `
:root {
  --color-primary: ${colors.primary.DEFAULT};
  --color-primary-light: ${colors.primary.light};
  --color-primary-dark: ${colors.primary.dark};
  --color-secondary: ${colors.secondary.DEFAULT};
  --color-secondary-light: ${colors.secondary.light};
  --color-secondary-dark: ${colors.secondary.dark};
  --color-accent: ${colors.accent.DEFAULT};
  --color-accent-light: ${colors.accent.light};
  --color-accent-dark: ${colors.accent.dark};
  --color-surface: ${colors.surface};
  --color-background: ${colors.background};
  --color-text-primary: ${colors.text.primary};
  --color-text-muted: ${colors.text.muted};
  --color-text-inverse: ${colors.text.inverse};
  --color-border: ${colors.border};
  --color-success: ${colors.success};
  --color-error: ${colors.error};
  --color-warning: ${colors.warning};
}
`;
