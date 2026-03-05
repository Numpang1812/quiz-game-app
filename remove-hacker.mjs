import { createClient } from '@libsql/client'
import fs from 'fs'
import path from 'path'

// Manual env parsing
const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = Object.fromEntries(
	envContent
		.split('\n')
		.filter((line) => line.includes('=') && !line.startsWith('#'))
		.map((line) => {
			const [key, ...val] = line.split('=')
			return [key.trim(), val.join('=').trim()]
		}),
)

const client = createClient({
	url: env.TURSO_DATABASE_URL,
	authToken: env.TURSO_AUTH_TOKEN,
})

const SPECIAL_NAME = 'NO ONE HACKS MY GAME'

async function remove() {
	console.log('⏳ Connecting to Turso...')

	// Check if it exists
	const existing = await client.execute({
		sql: 'SELECT COUNT(*) as count FROM score_table WHERE name = ?',
		args: [SPECIAL_NAME],
	})

	if (Number(existing.rows[0].count) === 0) {
		console.log('⚠️  Entry does not exist. Nothing to delete.')
	} else {
		await client.execute({
			sql: 'DELETE FROM score_table WHERE name = ?',
			args: [SPECIAL_NAME],
		})
		console.log(`🗑️  Deleted entry with name "${SPECIAL_NAME}"`)
	}

	// Verify deletion
	const verify = await client.execute({
		sql: 'SELECT COUNT(*) as count FROM score_table WHERE name = ?',
		args: [SPECIAL_NAME],
	})

	console.log('📊 Remaining entries with that name:', verify.rows[0].count)

	process.exit(0)
}

remove()
