import { createGameToken } from '$lib/server/gameSession.server';

export function load() {
	const { sessionId, signature } = createGameToken();
	return { sessionId, signature };
}
