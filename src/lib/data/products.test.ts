import { describe, it, expect } from 'vitest';
import {
	products,
	getProduct,
	getProductVariant,
	getAvailableSizes,
	getAvailableColors,
	getVariantByOptions,
	formatPrice
} from './products';

describe('products data', () => {
	describe('products array', () => {
		it('should have at least one product', () => {
			expect(products.length).toBeGreaterThan(0);
		});

		it('should have valid product structure', () => {
			for (const product of products) {
				expect(product).toHaveProperty('id');
				expect(product).toHaveProperty('slug');
				expect(product).toHaveProperty('name');
				expect(product).toHaveProperty('description');
				expect(product).toHaveProperty('price');
				expect(product).toHaveProperty('images');
				expect(product).toHaveProperty('category');
				expect(product).toHaveProperty('variants');

				expect(typeof product.id).toBe('string');
				expect(typeof product.slug).toBe('string');
				expect(typeof product.price).toBe('number');
				expect(product.price).toBeGreaterThan(0);
				expect(Array.isArray(product.images)).toBe(true);
				expect(Array.isArray(product.variants)).toBe(true);
			}
		});

		it('should have unique product IDs', () => {
			const ids = products.map(p => p.id);
			const uniqueIds = new Set(ids);

			expect(uniqueIds.size).toBe(ids.length);
		});

		it('should have unique product slugs', () => {
			const slugs = products.map(p => p.slug);
			const uniqueSlugs = new Set(slugs);

			expect(uniqueSlugs.size).toBe(slugs.length);
		});

		it('should have valid categories', () => {
			const validCategories = ['tshirt', 'hoodie', 'mug', 'sticker'];

			for (const product of products) {
				expect(validCategories).toContain(product.category);
			}
		});

		it('should have at least one variant per product', () => {
			for (const product of products) {
				expect(product.variants.length).toBeGreaterThan(0);
			}
		});

		it('should have valid variant structure', () => {
			for (const product of products) {
				for (const variant of product.variants) {
					expect(variant).toHaveProperty('id');
					expect(variant).toHaveProperty('size');
					expect(variant).toHaveProperty('color');
					expect(variant).toHaveProperty('colorHex');
					expect(variant).toHaveProperty('printfulSyncVariantId');
					expect(variant).toHaveProperty('inStock');

					expect(typeof variant.id).toBe('string');
					expect(typeof variant.colorHex).toBe('string');
					expect(variant.colorHex).toMatch(/^#[0-9a-fA-F]{6}$/);
					expect(typeof variant.printfulSyncVariantId).toBe('string');
					expect(typeof variant.inStock).toBe('boolean');
				}
			}
		});

		it('should have unique variant IDs within a product', () => {
			for (const product of products) {
				const variantIds = product.variants.map(v => v.id);
				const uniqueIds = new Set(variantIds);

				expect(uniqueIds.size).toBe(variantIds.length);
			}
		});
	});

	describe('getProduct', () => {
		it('should return a product by slug', () => {
			const product = getProduct('womens-relaxed-tee');

			expect(product).toBeDefined();
			expect(product?.slug).toBe('womens-relaxed-tee');
		});

		it('should return undefined for non-existent slug', () => {
			const product = getProduct('non-existent-product');

			expect(product).toBeUndefined();
		});
	});

	describe('getProductVariant', () => {
		it('should return a variant by product and variant ID', () => {
			const variant = getProductVariant('womens-relaxed-tee', 'womens-relaxed-tee-m');

			expect(variant).toBeDefined();
			expect(variant?.id).toBe('womens-relaxed-tee-m');
			expect(variant?.size).toBe('M');
		});

		it('should return undefined for non-existent product', () => {
			const variant = getProductVariant('non-existent', 'some-variant');

			expect(variant).toBeUndefined();
		});

		it('should return undefined for non-existent variant', () => {
			const variant = getProductVariant('womens-relaxed-tee', 'non-existent-variant');

			expect(variant).toBeUndefined();
		});
	});

	describe('getAvailableSizes', () => {
		it('should return unique sizes for a product', () => {
			const product = products.find(p => p.slug === 'womens-relaxed-tee');

			if (product) {
				const sizes = getAvailableSizes(product);

				expect(sizes.length).toBeGreaterThan(0);
				expect(new Set(sizes).size).toBe(sizes.length); // All unique
			}
		});

		it('should only return sizes for in-stock variants', () => {
			// Create a mock product with some out-of-stock variants
			const mockProduct = {
				...products[0],
				variants: [
					{ id: '1', size: 'S', color: 'Black', colorHex: '#000', printfulSyncVariantId: '1', inStock: true },
					{ id: '2', size: 'M', color: 'Black', colorHex: '#000', printfulSyncVariantId: '2', inStock: false },
					{ id: '3', size: 'L', color: 'Black', colorHex: '#000', printfulSyncVariantId: '3', inStock: true }
				]
			};

			const sizes = getAvailableSizes(mockProduct);

			expect(sizes).toContain('S');
			expect(sizes).not.toContain('M');
			expect(sizes).toContain('L');
		});
	});

	describe('getAvailableColors', () => {
		it('should return unique colors for a product', () => {
			const product = products.find(p => p.slug === 'unisex-hoodie');

			if (product) {
				const colors = getAvailableColors(product);

				expect(colors.length).toBeGreaterThan(0);

				// Check structure
				for (const item of colors) {
					expect(item).toHaveProperty('color');
					expect(item).toHaveProperty('hex');
				}
			}
		});

		it('should only return colors for in-stock variants', () => {
			const mockProduct = {
				...products[0],
				variants: [
					{ id: '1', size: 'S', color: 'Black', colorHex: '#000000', printfulSyncVariantId: '1', inStock: true },
					{ id: '2', size: 'S', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '2', inStock: false },
					{ id: '3', size: 'M', color: 'Black', colorHex: '#000000', printfulSyncVariantId: '3', inStock: true }
				]
			};

			const colors = getAvailableColors(mockProduct);

			expect(colors.map(c => c.color)).toContain('Black');
			expect(colors.map(c => c.color)).not.toContain('White');
		});
	});

	describe('getVariantByOptions', () => {
		it('should return the correct variant for size and color', () => {
			const product = products.find(p => p.slug === 'unisex-hoodie');

			if (product) {
				const variant = getVariantByOptions(product, 'M', 'Black');

				expect(variant).toBeDefined();
				expect(variant?.size).toBe('M');
				expect(variant?.color).toBe('Black');
			}
		});

		it('should return undefined if variant is out of stock', () => {
			const mockProduct = {
				...products[0],
				variants: [
					{ id: '1', size: 'S', color: 'Black', colorHex: '#000', printfulSyncVariantId: '1', inStock: false }
				]
			};

			const variant = getVariantByOptions(mockProduct, 'S', 'Black');

			expect(variant).toBeUndefined();
		});

		it('should return undefined for non-existent size/color combination', () => {
			const product = products.find(p => p.slug === 'womens-relaxed-tee');

			if (product) {
				const variant = getVariantByOptions(product, 'XXXL', 'Pink');

				expect(variant).toBeUndefined();
			}
		});
	});

	describe('formatPrice', () => {
		it('should format cents to dollars', () => {
			expect(formatPrice(2000)).toBe('$20.00');
			expect(formatPrice(3500)).toBe('$35.00');
			expect(formatPrice(999)).toBe('$9.99');
		});

		it('should handle zero', () => {
			expect(formatPrice(0)).toBe('$0.00');
		});

		it('should handle single cents', () => {
			expect(formatPrice(1)).toBe('$0.01');
		});

		it('should format with two decimal places', () => {
			expect(formatPrice(100)).toBe('$1.00');
			expect(formatPrice(1000)).toBe('$10.00');
		});
	});
});
