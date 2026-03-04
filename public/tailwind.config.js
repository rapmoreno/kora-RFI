tailwind.config = {
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',

        primary: {
          light: 'var(--primary-light)',
          DEFAULT: 'var(--primary-base)',
          dark: 'var(--primary-dark)',
        },
        secondary: {
          light: 'var(--secondary-light)',
          DEFAULT: 'var(--secondary-base)',
          dark: 'var(--secondary-dark)',
        },

        error: {
          light: 'var(--error-light)',
          DEFAULT: 'var(--error-base)',
          dark: 'var(--error-dark)',
        },
        success: {
          light: 'var(--success-light)',
          DEFAULT: 'var(--success-base)',
          dark: 'var(--success-dark)',
        },
        warning: {
          light: 'var(--warning-light)',
          DEFAULT: 'var(--warning-base)',
          dark: 'var(--warning-dark)',
        },
        info: {
          light: 'var(--info-light)',
          DEFAULT: 'var(--info-base)',
          dark: 'var(--info-dark)',
        },
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        inverse: 'var(--text-inverse)',
        link: 'var(--text-link)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      fontFamily: {
        base: 'var(--font-family-base)',
        secondary: 'var(--font-family-secondary)',
        mono: 'var(--font-family-mono)',
      },
    },
  },
};
