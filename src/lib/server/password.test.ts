import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password hashing', () => {
	describe('hashPassword', () => {
		it('should generate a hash in the correct format', async () => {
			const hash = await hashPassword('testpassword');

			expect(hash).toMatch(/^pbkdf2:\d+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
		});

		it('should include 100000 iterations', async () => {
			const hash = await hashPassword('testpassword');
			const parts = hash.split(':');

			expect(parts[1]).toBe('100000');
		});

		it('should generate different hashes for the same password (due to random salt)', async () => {
			const hash1 = await hashPassword('samepassword');
			const hash2 = await hashPassword('samepassword');

			expect(hash1).not.toBe(hash2);
		});

		it('should handle empty password', async () => {
			const hash = await hashPassword('');

			expect(hash).toMatch(/^pbkdf2:\d+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
		});

		it('should handle unicode characters', async () => {
			const hash = await hashPassword('pässwörd123!');

			expect(hash).toMatch(/^pbkdf2:\d+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
		});
	});

	describe('verifyPassword', () => {
		it('should return true for correct password', async () => {
			const password = 'correctpassword';
			const hash = await hashPassword(password);

			const result = await verifyPassword(hash, password);

			expect(result).toBe(true);
		});

		it('should return false for incorrect password', async () => {
			const hash = await hashPassword('correctpassword');

			const result = await verifyPassword(hash, 'wrongpassword');

			expect(result).toBe(false);
		});

		it('should return false for invalid hash format', async () => {
			const result = await verifyPassword('invalid-hash', 'password');

			expect(result).toBe(false);
		});

		it('should return false for hash with wrong prefix', async () => {
			const result = await verifyPassword('bcrypt:100000:salt:hash', 'password');

			expect(result).toBe(false);
		});

		it('should return false for hash with missing parts', async () => {
			const result = await verifyPassword('pbkdf2:100000:salt', 'password');

			expect(result).toBe(false);
		});

		it('should handle case-sensitive passwords', async () => {
			const hash = await hashPassword('Password123');

			expect(await verifyPassword(hash, 'Password123')).toBe(true);
			expect(await verifyPassword(hash, 'password123')).toBe(false);
			expect(await verifyPassword(hash, 'PASSWORD123')).toBe(false);
		});

		it('should handle passwords with special characters', async () => {
			const password = 'p@ssw0rd!#$%^&*()';
			const hash = await hashPassword(password);

			expect(await verifyPassword(hash, password)).toBe(true);
		});

		it('should handle long passwords', async () => {
			const password = 'a'.repeat(1000);
			const hash = await hashPassword(password);

			expect(await verifyPassword(hash, password)).toBe(true);
		});
	});
});
