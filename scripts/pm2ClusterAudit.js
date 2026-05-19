// scripts/pm2ClusterAudit.js
const pm2 = require('pm2');
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function auditCluster() {
  return new Promise((resolve, reject) => {
    pm2.connect(async (err) => {
      if (err) {
        console.error(err);
        process.exit(2);
      }

      pm2.list(async (err, list) => {
        if (err) reject(err);
        
        console.log(`Auditing ${list.length} PM2 instances...`);
        let synced = true;
        
        for (const proc of list) {
          // Check feature flags sync
          const instanceFlags = await redis.get(`flags:sync:${proc.pm_id}`);
          if (!instanceFlags) {
            console.warn(`Instance ${proc.pm_id} flags not synced or reported.`);
          }
        }
        
        // Distributed lock verification
        const lock = await redis.setnx('cluster:audit:lock', 1);
        if (lock) {
            console.log('Distributed lock acquired successfully.');
            await redis.del('cluster:audit:lock');
        } else {
            console.warn('Lock failed, cluster might be desynced or another audit is running.');
            synced = false;
        }

        pm2.disconnect();
        resolve({ synced, instances: list.length });
      });
    });
  });
}

auditCluster().then(console.log).catch(console.error);
