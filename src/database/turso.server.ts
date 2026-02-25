import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from "$env/static/private";
import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

export function db(): Client {
    if (!client) {
        client = createClient({
            url: TURSO_DATABASE_URL!,
            authToken: TURSO_AUTH_TOKEN!,
        });
    }
    return client;
}

// Create table
export async function initTable(){
    await db().execute(`CREATE TABLE IF NOT EXISTS score_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        created_time TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
}

// Get top 10 players by score
export async function getScore(){
    const result = await db().execute(`
        SELECT name, score, created_time
        FROM score_table
        ORDER BY score DESC, created_time ASC
        LIMIT 10
    `);
    
    return result.rows.map((row) => ({
        name: String(row.name),
        score: Number(row.score),
        created_time: String(row.created_time)
    }))
}

// Post player's name and score
export async function postScore(name: string, score: number){
    await db().execute({
        sql: `INSERT INTO score_table (name, score) VALUES (?, ?)`,
        args: [name, score]
    });
}

export async function getRank(score: number): Promise<number> {
    const result = await db().execute({
        sql: `
            SELECT COUNT(*) AS higher
            FROM score_table
            WHERE score > ? OR (score = ? AND created_time < datetime('now'))
        `,
        args: [score, score]
    });

    const higher = Number(result.rows[0].higher);
    return higher + 1;
}