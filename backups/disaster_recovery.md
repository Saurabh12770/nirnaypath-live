# NirnayPath — Production Disaster Recovery & Backup Guide

This document defines the Site Reliability Engineering (SRE) disaster recovery protocols, backup procedures, and restore routines for the NirnayPath production environment.

---

## 💾 1. Database Backup Protocols

### A. MongoDB Backups (Scheduled & Manual)
MongoDB is backed up daily using `mongodump` with compression enabled, preserving the last 7 days.

* **Manual Backup Trigger:**
  Run the automated backup script from the project root:
  ```bash
  ./scripts/backup.sh
  ```

* **MongoDB Restore Routine:**
  To restore a MongoDB archive file (e.g., in case of data corruption or staging synchronization):
  ```bash
  mongorestore --uri="mongodb://your-mongo-url" --archive="/var/backups/nirnaypath/mongo_2026-05-29_194732.archive" --gzip --drop
  ```
  > [!IMPORTANT]
  > The `--drop` flag will delete existing collections before restoring. Use with extreme caution in production!

### B. Redis RDB Backups
Redis data persistence relies on snapshotting (`RDB`) and append-only files (`AOF`).

* **Manual snapshot trigger:**
  ```bash
  redis-cli -u "redis://your-redis-url" save
  ```
* **Restore Redis database:**
  1. Stop the Redis server instance.
  2. Copy the backed up `dump.rdb` file into the Redis data directory (typically `/data/` or `/var/lib/redis/`).
  3. Start the Redis server instance.

---

## 📬 2. Dead-Letter Queue (DLQ) & Message Recovery

When background workers (such as the `emailWorker` or `digestWorker`) fail permanently after their retry limit, jobs are routed to the Dead Letter Queue (DLQ) to prevent message loss.

* **List DLQ/Failed Jobs:**
  Identify failed jobs via SRE admin API or check the Redis BullMQ state:
  ```bash
  # Check failed email jobs
  redis-cli keys "bull:email:failed:*"
  ```

* **Reprocessing Failed Jobs:**
  Reprocess all failed jobs by running the replay script:
  ```bash
  node scripts/replayDeadLetters.js
  ```
  This will dynamically fetch all failed jobs in the queue, remove their failure flags, and re-enqueue them for processing.

---

## 🚨 3. Incident Recovery & Failover Actions

### A. Subsystem Degraded State Recovery
If backing services (Redis, SMTP, payment gateways) go down, the platform activates **Resilient Degraded Modes** (e.g. read-only, local in-process cache, memory-locks).

1. **Verify Live Status:**
   Request the deep SRE health check:
   ```bash
   curl https://localhost:3000/api/health/deep
   ```
2. **Clear Degraded State manually:**
   If a service recovered but the circuit breaker has not reset yet, trigger an application reload or allow the auto-recovery timer to clear it (defaults to 30s).
   ```bash
   # PM2 soft reload to force connection rebuild
   pm2 reload nirnaypath-server
   ```

### B. PM2 Cluster Node Out-of-Memory (OOM) Recovery
If a node hits the V8 memory threshold (85%), the telemetry engine logs critical alerts. If it crashes or runs out of memory:

1. **Check process list:**
   ```bash
   pm2 status
   ```
2. **Retrieve crash dumps:**
   Check the `/logs/crash_dumps.json` file to locate stack traces.
3. **Reboot PM2 daemon:**
   ```bash
   pm2 restart nirnaypath-server --update-env
   ```
