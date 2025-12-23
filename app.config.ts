export default defineAppConfig({
  ui: {
    primary: 'blue',
    gray: 'cool',
    input: {
      default: {
        color: 'gray',
      },
      color: {
        white: {
          outline: 'bg-[var(--color-bg-input)] text-[var(--color-text-body)] placeholder:text-[var(--color-text-muted)] ring-1 ring-inset ring-[var(--color-border)] focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
        },
        gray: {
          outline: 'bg-[var(--color-bg-input)] text-[var(--color-text-body)] placeholder:text-[var(--color-text-muted)] ring-1 ring-inset ring-[var(--color-border)] focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
        },
      },
    },
    select: {
      default: {
        color: 'gray',
      },
      color: {
        white: {
          outline: 'bg-[var(--color-bg-input)] text-[var(--color-text-body)] placeholder:text-[var(--color-text-muted)] ring-1 ring-inset ring-[var(--color-border)] focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
        },
        gray: {
          outline: 'bg-[var(--color-bg-input)] text-[var(--color-text-body)] placeholder:text-[var(--color-text-muted)] ring-1 ring-inset ring-[var(--color-border)] focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
        },
      },
    },
    selectMenu: {
      default: {
        color: 'gray',
      },
      input: {
        color: {
          white: {
            outline: 'bg-[var(--color-bg-input)] text-[var(--color-text-body)] placeholder:text-[var(--color-text-muted)] ring-1 ring-inset ring-[var(--color-border)] focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
          },
          gray: {
            outline: 'bg-[var(--color-bg-input)] text-[var(--color-text-body)] placeholder:text-[var(--color-text-muted)] ring-1 ring-inset ring-[var(--color-border)] focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
          },
        },
      },
      background: 'bg-[var(--color-bg-input)]',
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
        white: {
          outline: 'bg-[var(--color-bg-input)] text-[var(--color-text-body)] placeholder:text-[var(--color-text-muted)] ring-1 ring-inset ring-[var(--color-border)] focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
        },
        gray: {
          outline: 'bg-[var(--color-bg-input)] text-[var(--color-text-body)] placeholder:text-[var(--color-text-muted)] ring-1 ring-inset ring-[var(--color-border)] focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
        },
      },
    },
  },
});
