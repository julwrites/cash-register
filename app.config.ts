const inputColor = {
  outline: 'bg-[var(--color-bg-input)] text-[var(--color-text-body)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
};

export default defineAppConfig({
  ui: {
    primary: 'blue',
    gray: 'cool',
    card: {
      background: 'bg-[var(--color-bg-card)]',
      divide: 'divide-[var(--color-border-card)]',
      ring: 'ring-1 ring-[var(--color-border-card)]',
      shadow: 'shadow-sm',
      body: {
        base: 'text-[var(--color-text-body)]',
      },
      header: {
        base: 'text-[var(--color-text-body)]',
      },
      footer: {
        base: 'text-[var(--color-text-body)]',
      },
    },
    modal: {
      background: 'bg-[var(--color-bg-card)]',
      overlay: {
        background: 'bg-gray-900/75 dark:bg-gray-900/80',
      },
      ring: 'ring-1 ring-[var(--color-border-card)]',
    },
    dropdown: {
      background: 'bg-[var(--color-bg-card)]',
      ring: 'ring-1 ring-[var(--color-border-card)]',
      divide: 'divide-[var(--color-border-card)]',
      item: {
        base: 'text-[var(--color-text-body)]',
        active: 'bg-[var(--color-bg-hover)] text-[var(--color-text-body)]',
        inactive: 'text-[var(--color-text-body)]',
        disabled: 'cursor-not-allowed opacity-50 text-[var(--color-text-muted)]',
      },
    },
    button: {
      default: {
        color: 'gray',
      },
      color: {
        gray: {
          ghost: 'text-[var(--color-text-body)] hover:bg-[var(--color-bg-hover)] focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
          solid: 'shadow-sm ring-1 ring-inset ring-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-body)] hover:bg-[var(--color-bg-hover)] disabled:bg-[var(--color-bg-subtle)] focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
          link: 'text-[var(--color-text-body)] hover:text-[var(--color-text-muted)] underline-offset-4 hover:underline focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
        },
        white: {
          solid: 'shadow-sm ring-1 ring-inset ring-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-body)] hover:bg-[var(--color-bg-hover)] disabled:bg-[var(--color-bg-card)] focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
          ghost: 'text-[var(--color-text-body)] hover:bg-[var(--color-bg-hover)] focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
        },
      },
    },
    input: {
      default: {
        color: 'gray',
      },
      color: {
        white: inputColor,
        gray: inputColor,
      },
    },
    select: {
      default: {
        color: 'gray',
      },
      color: {
        white: inputColor,
        gray: inputColor,
      },
    },
    selectMenu: {
      default: {
        color: 'gray',
      },
      input: {
        color: {
          white: inputColor,
          gray: inputColor,
        },
      },
      background: 'bg-[var(--color-bg-card)]',
      option: {
        active: 'bg-[var(--color-bg-hover)]',
        selected: 'bg-[var(--color-bg-subtle)]',
        color: 'text-[var(--color-text-body)]',
      },
    },
    textarea: {
      default: {
        color: 'gray',
      },
      color: {
        white: inputColor,
        gray: inputColor,
      },
    },
  },
});
