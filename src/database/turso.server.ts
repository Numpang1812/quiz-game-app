import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';
import { createClient, type Client } from '@libsql/client';

export const MAX_VALID_SCORE = 50;
export const SPECIAL_NAME = 'NO ONE HACKS MY GAME';

let client: Client | null = null;
let initPromise: Promise<void> | null = null;

export function db(): Client {
	if (!client) {
		client = createClient({
			url: TURSO_DATABASE_URL!,
			authToken: TURSO_AUTH_TOKEN!,
		});
	}
	return client;
}

async function initializeTableOnce(): Promise<void> {
	await db().execute(`CREATE TABLE IF NOT EXISTS score_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        created_time TEXT NOT NULL DEFAULT (datetime('now'))
    )`);

	await db().execute(
		`CREATE INDEX IF NOT EXISTS idx_score_created_time ON score_table(score DESC, created_time ASC)`,
	);
	await db().execute(
		`CREATE INDEX IF NOT EXISTS idx_name_score_created_time ON score_table(name, score DESC, created_time ASC)`,
	);

	await db().execute({
		sql: `DELETE FROM score_table WHERE (score < 0 OR score > ?) AND name != ?`,
		args: [MAX_VALID_SCORE, SPECIAL_NAME],
	});
}

// Create table (one-time per server lifecycle)
export async function initTable() {
	if (!initPromise) {
		initPromise = initializeTableOnce().catch((error) => {
			initPromise = null;
			throw error;
		});
	}

	await initPromise;
}

type GetScoresOptions = {
	from?: string;
	to?: string;
	limit?: number;
	uniquePlayers?: boolean;
};

function toStartOfDayUtc(dateString: string): string {
	return `${dateString} 00:00:00`;
}

function toNextDayUtc(dateString: string): string {
	const date = new Date(`${dateString}T00:00:00.000Z`);
	date.setUTCDate(date.getUTCDate() + 1);
	return toSqliteDateTimeUtc(date);
}

function toSqliteDateTimeUtc(value: Date): string {
	return value.toISOString().slice(0, 19).replace('T', ' ');
}

export async function getScore(options: GetScoresOptions = {}) {
	if (options.uniquePlayers) {
		const args: Array<string | number> = [MAX_VALID_SCORE, SPECIAL_NAME];
		const limitClause = Number.isFinite(options.limit) && (options.limit ?? 0) > 0 ? 'LIMIT ?' : '';

		if (limitClause) {
			args.push(Number(options.limit));
		}

		const result = await db().execute({
			sql: `
                WITH ranked_scores AS (
                    SELECT
                        name,
                        score,
                        created_time,
                        ROW_NUMBER() OVER (
                            PARTITION BY name
                            ORDER BY score DESC, datetime(created_time) ASC
                        ) AS row_num
                    FROM score_table
                    WHERE (score >= 0 AND score <= ?) OR name = ?
                )
                SELECT name, score, created_time
                FROM ranked_scores
                WHERE row_num = 1
                ORDER BY score DESC, datetime(created_time) ASC
                ${limitClause}
            `,
			args,
		});

		return result.rows.map((row) => ({
			name: String(row.name),
			score: Number(row.score),
			created_time: String(row.created_time),
		}));
	}

	const whereParts: string[] = ['((score >= 0 AND score <= ?) OR name = ?)'];
	const args: Array<string | number> = [MAX_VALID_SCORE, SPECIAL_NAME];

	if (options.from) {
		whereParts.push('datetime(created_time) >= datetime(?)');
		args.push(toStartOfDayUtc(options.from));
	}

	if (options.to) {
		whereParts.push('datetime(created_time) < datetime(?)');
		args.push(toNextDayUtc(options.to));
	}

	const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
	const limitClause = Number.isFinite(options.limit) && (options.limit ?? 0) > 0 ? 'LIMIT ?' : '';

	if (limitClause) {
		args.push(Number(options.limit));
	}

	const result = await db().execute({
		sql: `
            SELECT name, score, created_time
            FROM score_table
            ${whereClause}
            ORDER BY score DESC, datetime(created_time) ASC
            ${limitClause}
        `,
		args,
	});

	return result.rows.map((row) => ({
		name: String(row.name),
		score: Number(row.score),
		created_time: String(row.created_time),
	}));
}

// Post player's name and score
export async function postScore(name: string, score: number) {
	const now = toSqliteDateTimeUtc(new Date());
	await db().execute({
		sql: `INSERT INTO score_table (name, score, created_time) VALUES (?, ?, ?)`,
		args: [name, score, now],
	});
	return now;
}

export async function getRank(score: number, created_time: string): Promise<number> {
	const result = await db().execute({
		sql: `
            SELECT COUNT(*) AS higher
            FROM score_table
            WHERE ((score >= 0 AND score <= ?) OR name = ?)
              AND (score > ? OR (score = ? AND datetime(created_time) < datetime(?)))
        `,
		args: [MAX_VALID_SCORE, SPECIAL_NAME, score, score, created_time],
	});

	const higher = Number(result.rows[0].higher);
	return higher + 1;
}
