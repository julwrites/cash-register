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
          outline: 'bg-[var(--color-bg-input)] text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
        },
        gray: {
          outline: 'bg-[var(--color-bg-input)] text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
        },
      },
    },
    select: {
      default: {
        color: 'gray',
      },
      color: {
        white: {
          outline: 'bg-[var(--color-bg-input)] text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
        },
        gray: {
          outline: 'bg-[var(--color-bg-input)] text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
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
            outline: 'bg-[var(--color-bg-input)] text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
          },
          gray: {
            outline: 'bg-[var(--color-bg-input)] text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
          },
        },
      },
      background: 'bg-[var(--color-bg-input)]',
      option: {
        active: 'bg-gray-100 dark:bg-gray-700',
        selected: 'bg-gray-50 dark:bg-gray-700/50',
      },
    },
    textarea: {
      default: {
        color: 'gray',
      },
      color: {
        white: {
          outline: 'bg-[var(--color-bg-input)] text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
        },
        gray: {
          outline: 'bg-[var(--color-bg-input)] text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
        },
      },
    },
  },
});
