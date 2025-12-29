/**
 * Database Backup Script - PostgreSQL Dump
 * Creates a backup of the entire database for v1.0-CNC-Ready release
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupDir = path.join(__dirname, '../backups');
const backupFile = path.join(backupDir, `database_backup_${timestamp}.sql`);

// Create backups directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

console.log('🔄 Starting database backup...\n');
console.log(`Backup file: ${backupFile}\n`);

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL not found in environment variables');
    process.exit(1);
}

// Execute pg_dump
const command = `pg_dump "${databaseUrl}" > "${backupFile}"`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Backup failed: ${error.message}`);
        return;
    }

    if (stderr) {
        console.log(`⚠️  Warnings: ${stderr}`);
    }

    // Check if file was created
    if (fs.existsSync(backupFile)) {
        const stats = fs.statSync(backupFile);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log('✅ Database backup completed successfully!\n');
        console.log(`📊 Backup Details:`);
        console.log(`   File: ${backupFile}`);
        console.log(`   Size: ${sizeInMB} MB`);
        console.log(`   Timestamp: ${timestamp}\n`);
        console.log('💾 Backup saved and ready for archival.');
    } else {
        console.error('❌ Backup file was not created');
    }
});
