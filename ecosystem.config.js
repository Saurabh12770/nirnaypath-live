module.exports = {
  apps: [{
    name: "nirnaypath-server",
    script: "./backend/app.js",
    interpreter: "node",
    interpreter_args: "--experimental-specifier-resolution=node",
    instances: "max",
    exec_mode: "cluster",
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      NODE_OPTIONS: `--max-old-space-size=${process.env.MEM_LIMIT || 512}`,
      PORT: 3000,
      ASSET_VERSION: "1.0.0"
    },
    env_production: {
      NODE_ENV: "production",
      NODE_OPTIONS: `--max-old-space-size=${process.env.MEM_LIMIT || 512}`,
      PORT: 80,
      ASSET_VERSION: "1.0.0"
    }
  }]
};
