import next from 'eslint-config-next';
import reactHooks from 'eslint-plugin-react-hooks';

const config = [
  ...next,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default config;
