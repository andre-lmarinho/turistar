// commitlint.config.cjs
module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern: /^(:\w+:|\p{Extended_Pictographic}) (.+)$/u,
      headerCorrespondence: ['emoji', 'subject'],
    },
  },
  rules: {
    'subject-empty': [0],
    'type-empty': [0, 'always'],
    'header-max-length': [2, 'always', 72],
  },
};
