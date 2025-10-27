module.exports = {
  apps: [
    {
      name: 'Recuriment',
      script: './dist/index.js',
      interpreter: 'node',
      watch: false,
      error_file: './pm2logs/err.log',
      out_file: './pm2logs/out.log',
      log_file: './pm2logs/combined.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
