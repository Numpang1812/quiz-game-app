import { GAME_SESSION_SECRET } from '$env/static/private';
import { createHmac, randomUUID } from 'crypto';

const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** sessionId → expiry timestamp */
const usedTokens = new Map<string, number>();

function cleanupExpiredTokens(): void {
	const now = Date.now();
	for (const [id, expiry] of usedTokens) {
		if (now > expiry) {
			usedTokens.delete(id);
		}
	}
}

function sign(sessionId: string): string {
	return createHmac('sha256', GAME_SESSION_SECRET).update(sessionId).digest('hex');
}

/** Generate a new single-use game session token. */
export function createGameToken(): { sessionId: string; signature: string } {
	const sessionId = randomUUID();
	const signature = sign(sessionId);
	return { sessionId, signature };
}

/** Verify that the signature matches the sessionId. */
export function verifyGameToken(sessionId: string, signature: string): boolean {
	if (typeof sessionId !== 'string' || typeof signature !== 'string') {
		return false;
	}
	const expected = sign(sessionId);
	return expected === signature;
}

/**
 * Consume a token so it cannot be reused.
 * Returns `true` if the token was fresh (first use), `false` if already consumed.
 */
export function consumeGameToken(sessionId: string): boolean {
	cleanupExpiredTokens();

	if (usedTokens.has(sessionId)) {
		return false;
	}

	usedTokens.set(sessionId, Date.now() + TOKEN_TTL_MS);
	return true;
}
