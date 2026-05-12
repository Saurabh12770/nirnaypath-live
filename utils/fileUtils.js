const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Perform an atomic write to a file to prevent corruption during race conditions.
 * Writes to a temporary file first, then renames it to the target path.
 */
async function atomicWriteFile(targetPath, data) {
    const dir = path.dirname(targetPath);
    const tempFileName = `.tmp_${crypto.randomBytes(8).toString('hex')}_${path.basename(targetPath)}`;
    const tempPath = path.join(dir, tempFileName);

    try {
        // 1. Ensure directory exists
        await fs.mkdir(dir, { recursive: true });

        // 2. Write data to temporary file
        const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        await fs.writeFile(tempPath, content, 'utf8');

        // 3. Atomic rename (replaces target if it exists)
        await fs.rename(tempPath, targetPath);
        
        return true;
    } catch (error) {
        console.error(`[AtomicWrite] Failed to write to ${targetPath}:`, error.message);
        
        // Cleanup temp file if it exists
        try {
            await fs.unlink(tempPath);
        } catch (cleanupErr) {
            // Ignore cleanup errors
        }
        
        throw error;
    }
}

module.exports = { atomicWriteFile };
