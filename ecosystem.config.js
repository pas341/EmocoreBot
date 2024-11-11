module.exports = {
  apps: [{
    name: "EMO Core Bot",
    script: "./app.js",
    watch: true,
    max_restarts: 5,
    min_uptime: 500,
    // Delay between restart
    watch_delay: 1000,
    ignore_watch: ["node_modules", "logs", "data"],
    env_development: {
      "NODE_ENV": `development`,
    },
    env: {
      "NODE_ENV": "production",
    }
  }]
}

