import { describe, it, expect } from 'vitest';
import { generateLicenseKey, generateId } from './stripe';

describe('stripe utilities', () => {
	describe('generateLicenseKey', () => {
		it('should generate a license key in the correct format', () => {
			const key = generateLicenseKey();

			expect(key).toMatch(/^TF-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
		});

		it('should not include confusing characters (0, O, I, 1)', () => {
			// Generate many keys to increase confidence
			for (let i = 0; i < 100; i++) {
				const key = generateLicenseKey();

				expect(key).not.toMatch(/[0OI1]/);
			}
		});

		it('should generate unique keys', () => {
			const keys = new Set<string>();

			for (let i = 0; i < 100; i++) {
				keys.add(generateLicenseKey());
			}

			// All 100 keys should be unique
			expect(keys.size).toBe(100);
		});

		it('should always start with TF- prefix', () => {
			for (let i = 0; i < 10; i++) {
				const key = generateLicenseKey();

				expect(key.startsWith('TF-')).toBe(true);
			}
		});

		it('should have exactly 4 segments of 4 characters each', () => {
			const key = generateLicenseKey();
			const parts = key.split('-');

			expect(parts).toHaveLength(5); // TF + 4 segments
			expect(parts[0]).toBe('TF');
			expect(parts[1]).toHaveLength(4);
			expect(parts[2]).toHaveLength(4);
			expect(parts[3]).toHaveLength(4);
			expect(parts[4]).toHaveLength(4);
		});

		it('should only contain uppercase letters and digits 2-9', () => {
			const key = generateLicenseKey();
			const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
			const segments = key.substring(3); // Remove 'TF-'

			for (const char of segments.replace(/-/g, '')) {
				expect(allowedChars).toContain(char);
			}
		});
	});

	describe('generateId', () => {
		it('should generate a valid UUID', () => {
			const id = generateId();

			expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
		});

		it('should generate unique IDs', () => {
			const ids = new Set<string>();

			for (let i = 0; i < 100; i++) {
				ids.add(generateId());
			}

			expect(ids.size).toBe(100);
		});
	});
});
