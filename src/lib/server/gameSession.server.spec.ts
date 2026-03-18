import { describe, it, expect, vi } from 'vitest'

// Mock $env/static/private before importing the module
vi.mock('$env/static/private', () => ({
	GAME_SESSION_SECRET: 'test-secret-key-for-unit-tests',
}))

// Import after mocking
const { createGameToken, verifyGameToken, consumeGameToken } = await import('./gameSession.server')

describe('gameSession.server', () => {
	describe('createGameToken', () => {
		it('returns a sessionId and signature', () => {
			const token = createGameToken()

			expect(token).toHaveProperty('sessionId')
			expect(token).toHaveProperty('signature')
			expect(typeof token.sessionId).toBe('string')
			expect(typeof token.signature).toBe('string')
			expect(token.sessionId.length).toBeGreaterThan(0)
			expect(token.signature.length).toBeGreaterThan(0)
		})

		it('returns unique sessionIds each time', () => {
			const token1 = createGameToken()
			const token2 = createGameToken()

			expect(token1.sessionId).not.toBe(token2.sessionId)
			expect(token1.signature).not.toBe(token2.signature)
		})
	})

	describe('verifyGameToken', () => {
		it('accepts a valid sessionId + signature pair', () => {
			const { sessionId, signature } = createGameToken()

			expect(verifyGameToken(sessionId, signature)).toBe(true)
		})

		it('rejects a tampered signature', () => {
			const { sessionId } = createGameToken()

			expect(verifyGameToken(sessionId, 'fake-signature')).toBe(false)
		})

		it('rejects a tampered sessionId', () => {
			const { signature } = createGameToken()

			expect(verifyGameToken('fake-session-id', signature)).toBe(false)
		})

		it('rejects non-string inputs', () => {
			expect(verifyGameToken(null as any, 'abc')).toBe(false)
			expect(verifyGameToken('abc', undefined as any)).toBe(false)
			expect(verifyGameToken(123 as any, 456 as any)).toBe(false)
		})
	})

	describe('consumeGameToken', () => {
		it('returns true on first use', () => {
			const { sessionId } = createGameToken()

			expect(consumeGameToken(sessionId)).toBe(true)
		})

		it('returns false on replay (second use)', () => {
			const { sessionId } = createGameToken()

			expect(consumeGameToken(sessionId)).toBe(true)
			expect(consumeGameToken(sessionId)).toBe(false)
		})

		it('allows different tokens to be consumed independently', () => {
			const token1 = createGameToken()
			const token2 = createGameToken()

			expect(consumeGameToken(token1.sessionId)).toBe(true)
			expect(consumeGameToken(token2.sessionId)).toBe(true)
			// But replayed ones still fail
			expect(consumeGameToken(token1.sessionId)).toBe(false)
		})
	})
})
