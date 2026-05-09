module.exports = {
  apps: [{
    name: 'portfolio',
    script: 'node',
    args: 'node_modules/next/dist/bin/next start -p 9002',
    cwd: '.',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
