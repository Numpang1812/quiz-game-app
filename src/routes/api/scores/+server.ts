import { json, type RequestEvent } from '@sveltejs/kit'
import {
	getScore,
	postScore,
	initTable,
	getRank,
	MAX_VALID_SCORE,
	SPECIAL_NAME,
} from '../../../database/turso.server'
import { verifyGameToken, consumeGameToken } from '$lib/server/gameSession.server'

function isValidDateParam(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false
	}

	const date = new Date(`${value}T00:00:00.000Z`)
	return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

function validateDateRange(from: string | null, to: string | null): { error?: string } {
	if (from && !isValidDateParam(from)) {
		return { error: 'Invalid from date. Use YYYY-MM-DD' }
	}

	if (to && !isValidDateParam(to)) {
		return { error: 'Invalid to date. Use YYYY-MM-DD' }
	}

	if (from && to && from > to) {
		return { error: 'from date must be less than or equal to to date' }
	}

	return {}
}

function parseQueryParams(limitParam: string | null, uniquePlayersParam: string | null) {
	let limit: number | undefined
	if (limitParam !== null) {
		const parsedLimit = Number(limitParam)
		if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
			return { error: 'limit must be a positive integer' }
		}
		limit = parsedLimit
	}

	if (
		uniquePlayersParam !== null &&
		uniquePlayersParam !== 'true' &&
		uniquePlayersParam !== 'false'
	) {
		return { error: 'uniquePlayers must be true or false' }
	}

	const uniquePlayers = uniquePlayersParam === 'true'
	return { limit, uniquePlayers }
}

export async function GET({ url }: RequestEvent) {
	await initTable()

	const from = url.searchParams.get('from') ?? undefined
	const to = url.searchParams.get('to') ?? undefined
	const limitParam = url.searchParams.get('limit')
	const uniquePlayersParam = url.searchParams.get('uniquePlayers')

	const dateError = validateDateRange(from ?? null, to ?? null)
	if (dateError.error) {
		return json({ error: dateError.error }, { status: 400 })
	}

	const paramsResult = parseQueryParams(limitParam, uniquePlayersParam)
	if ((paramsResult as { error?: string }).error) {
		return json({ error: (paramsResult as { error: string }).error }, { status: 400 })
	}

	const { limit, uniquePlayers } = paramsResult as { limit?: number; uniquePlayers: boolean }

	const scores = await getScore({ from, to, limit, uniquePlayers })
	return json(scores)
}

type ScoreValidationResult =
	| { valid: false; error: string; status: number }
	| { valid: true; name: string; score: number }

function validateScoreData(body: Record<string, unknown> | null): ScoreValidationResult {
	const name = typeof body?.name === 'string' ? body.name.trim() : ''
	const score = typeof body?.score === 'number' ? body.score : Number(body?.score)

	if (!Number.isFinite(score)) return { valid: false, error: 'Score is required', status: 400 }
	if (!Number.isInteger(score) || score < 0)
		return { valid: false, error: 'Score must be a non-negative integer', status: 400 }
	if (score > MAX_VALID_SCORE)
		return {
			valid: false,
			error: `Score must be less than or equal to ${MAX_VALID_SCORE}`,
			status: 400,
		}
	if (!name) return { valid: false, error: 'Name is required', status: 400 }
	if (name.toUpperCase() === SPECIAL_NAME.toUpperCase())
		return {
			valid: false,
			error: 'This name is reserved for THE ONE AND ONLY!! NO ONE HACKS MY GAME!!',
			status: 403,
		}

	return { valid: true, name, score }
}

export async function POST({ request }: RequestEvent) {
	await initTable()

	const body = await request.json().catch(() => null)

	// --- Game session token validation ---
	const sessionId = body?.sessionId
	const signature = body?.signature

	if (!sessionId || !signature) {
		return json({ error: 'Missing game session token' }, { status: 403 })
	}

	if (!verifyGameToken(sessionId, signature)) {
		return json({ error: 'Invalid game session token' }, { status: 403 })
	}

	if (!consumeGameToken(sessionId)) {
		return json({ error: 'Game session token already used' }, { status: 403 })
	}
	// --- End token validation ---

	const validationResult = validateScoreData(body)
	if (!validationResult.valid) {
		return json({ error: validationResult.error }, { status: validationResult.status })
	}

	const { name, score } = validationResult

	const created_time = await postScore(name, score)
	const rank = await getRank(score, created_time)

	return json({ ok: true, rank }, { status: 201 })
}
