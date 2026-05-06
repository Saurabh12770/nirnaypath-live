module.exports = {
  apps: [{
    name: "nirnaypath-server",
    script: "./server/app.js",
    instances: "max", // Or a specific number like 4
    exec_mode: "cluster",
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "development",
      PORT: 3000,
      ASSET_VERSION: "1.0.0"
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 80,
      ASSET_VERSION: "1.0.0"
    }
  }]
};
