import { createTheme, rem } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'indigo',
  primaryShade: { light: 6, dark: 6 },
  defaultRadius: 'md',

  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontFamilyMonospace:
    "ui-monospace, 'Cascadia Code', 'SF Mono', Consolas, monospace",
  fontSmoothing: true,

  headings: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    sizes: {
      h1: { fontSize: rem(32), lineHeight: 1.2, fontWeight: 750 },
      h2: { fontSize: rem(20), lineHeight: 1.3, fontWeight: 700 },
      h3: { fontSize: rem(18), lineHeight: 1.35, fontWeight: 700 },
      h4: { fontSize: rem(16), lineHeight: 1.4, fontWeight: 600 },
    },
  },

  // Radius scale (px)
  // small controls 4-8 | cards 8-12 | large containers/panels 16
  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
    panel: rem(16),
    pill: rem(100),
  },

  shadows: {
    xs: '0 1px 2px rgba(16, 24, 40, 0.05)',
    sm: '0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)',
    md: '0 4px 10px -2px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.04)',
    lg: '0 12px 32px -12px rgba(16, 24, 40, 0.18), 0 4px 12px -6px rgba(16, 24, 40, 0.06)',
    xl: '0 24px 60px -20px rgba(16, 24, 40, 0.28)',
    lift: '0 8px 24px -8px rgba(16, 24, 40, 0.12)',
  },

  other: {
    // Shared content max width (px) — used by Container-based pages
    contentMaxWidth: rem(1200),
    contentPaddingDesktop: rem(24),
    contentPaddingTablet: rem(22),
    contentPaddingMobile: rem(16),
  },

  components: {
    Container: {
      defaultProps: {
        size: 'lg',
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: { defaultProps: { radius: 'md' } },
    PasswordInput: { defaultProps: { radius: 'md' } },
    Textarea: { defaultProps: { radius: 'md' } },
    Select: { defaultProps: { radius: 'md' } },
    NativeSelect: { defaultProps: { radius: 'md' } },
    Checkbox: { defaultProps: { radius: 'sm' } },
    Modal: {
      defaultProps: {
        radius: 'panel',
        centered: true,
        shadow: 'lg',
      },
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        verticalSpacing: 'sm',
        horizontalSpacing: 'sm',
      },
    },
    Badge: {
      defaultProps: {
        variant: 'light',
        radius: 'sm',
      },
    },
    Accordion: {
      defaultProps: {
        radius: 'lg',
      },
    },
  },
});

export default theme;