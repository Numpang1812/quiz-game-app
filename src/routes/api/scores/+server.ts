import { json } from '@sveltejs/kit';
import {
	getScore,
	postScore,
	initTable,
	getRank,
	MAX_VALID_SCORE,
	SPECIAL_NAME,
} from '../../../database/turso.server';
import { verifyGameToken, consumeGameToken } from '$lib/server/gameSession.server';

function isValidDateParam(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	const date = new Date(`${value}T00:00:00.000Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export async function GET({ url }) {
	await initTable();

	const from = url.searchParams.get('from') ?? undefined;
	const to = url.searchParams.get('to') ?? undefined;
	const limitParam = url.searchParams.get('limit');
	const uniquePlayersParam = url.searchParams.get('uniquePlayers');

	if (from && !isValidDateParam(from)) {
		return json({ error: 'Invalid from date. Use YYYY-MM-DD' }, { status: 400 });
	}

	if (to && !isValidDateParam(to)) {
		return json({ error: 'Invalid to date. Use YYYY-MM-DD' }, { status: 400 });
	}

	if (from && to && from > to) {
		return json({ error: 'from date must be less than or equal to to date' }, { status: 400 });
	}

	let limit: number | undefined;
	if (limitParam !== null) {
		const parsedLimit = Number(limitParam);
		if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
			return json({ error: 'limit must be a positive integer' }, { status: 400 });
		}
		limit = parsedLimit;
	}

	if (
		uniquePlayersParam !== null &&
		uniquePlayersParam !== 'true' &&
		uniquePlayersParam !== 'false'
	) {
		return json({ error: 'uniquePlayers must be true or false' }, { status: 400 });
	}

	const uniquePlayers = uniquePlayersParam === 'true';

	const scores = await getScore({ from, to, limit, uniquePlayers });
	return json(scores);
}

export async function POST({ request }) {
	await initTable();

	const body = await request.json().catch(() => null);

	// --- Game session token validation ---
	const sessionId = body?.sessionId;
	const signature = body?.signature;

	if (!sessionId || !signature) {
		return json({ error: 'Missing game session token' }, { status: 403 });
	}

	if (!verifyGameToken(sessionId, signature)) {
		return json({ error: 'Invalid game session token' }, { status: 403 });
	}

	if (!consumeGameToken(sessionId)) {
		return json({ error: 'Game session token already used' }, { status: 403 });
	}
	// --- End token validation ---

	const name = typeof body?.name === 'string' ? body.name.trim() : '';
	const score = typeof body?.score === 'number' ? body.score : Number(body?.score);

	if (!Number.isFinite(score)) return json({ error: 'Score is required' }, { status: 400 });
	if (!Number.isInteger(score) || score < 0)
		return json({ error: 'Score must be a non-negative integer' }, { status: 400 });
	if (score > MAX_VALID_SCORE)
		return json(
			{ error: `Score must be less than or equal to ${MAX_VALID_SCORE}` },
			{ status: 400 },
		);
	if (!name) return json({ error: 'Name is required' }, { status: 400 });
	if (name.toUpperCase() === SPECIAL_NAME.toUpperCase())
		return json(
			{ error: 'This name is reserved for THE ONE AND ONLY!! NO ONE HACKS MY GAME!!' },
			{ status: 403 },
		);

	const created_time = await postScore(name, score);
	const rank = await getRank(score, created_time);

	return json({ ok: true, rank }, { status: 201 });
}
