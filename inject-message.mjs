import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Manual env parsing since we're running outside SvelteKit
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
    envContent.split('\n')
        .filter(line => line.includes('=') && !line.startsWith('#'))
        .map(line => {
            const [key, ...val] = line.split('=');
            return [key.trim(), val.join('=').trim()];
        })
);

const client = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
});

const SPECIAL_NAME = 'NO ONE HACKS MY GAME';
const SPECIAL_SCORE = 676767;

async function inject() {
    console.log('⏳ Connecting to Turso...');

    // Check if it already exists
    const existing = await client.execute({
        sql: 'SELECT COUNT(*) as count FROM score_table WHERE name = ?',
        args: [SPECIAL_NAME]
    });

    if (Number(existing.rows[0].count) > 0) {
        console.log('⚠️  Entry already exists! Skipping injection.');
    } else {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await client.execute({
            sql: 'INSERT INTO score_table (name, score, created_time) VALUES (?, ?, ?)',
            args: [SPECIAL_NAME, SPECIAL_SCORE, now]
        });
        console.log(`✅ Injected: "${SPECIAL_NAME}" with score ${SPECIAL_SCORE}`);
    }

    // Verify
    const result = await client.execute({
        sql: 'SELECT name, score, created_time FROM score_table WHERE name = ?',
        args: [SPECIAL_NAME]
    });
    console.log('📊 Verification:', result.rows[0]);

    process.exit(0);
}

inject();
