import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { cart, cartItemCount, cartSubtotal, isCartOpen, openCart, closeCart, toggleCart } from './cart';
import type { CartItem } from './cart';

describe('cart store', () => {
	beforeEach(() => {
		// Clear cart before each test
		cart.clear();
	});

	describe('addItem', () => {
		it('should add a new item to the cart', () => {
			const item = {
				productId: 'test-product',
				variantId: 'test-variant',
				name: 'Test Product',
				size: 'M',
				color: 'Black',
				price: 2000,
				image: '/test.png'
			};

			cart.addItem(item, 1);
			const items = get(cart);

			expect(items).toHaveLength(1);
			expect(items[0].productId).toBe('test-product');
			expect(items[0].quantity).toBe(1);
		});

		it('should increase quantity when adding the same item', () => {
			const item = {
				productId: 'test-product',
				variantId: 'test-variant',
				name: 'Test Product',
				size: 'M',
				color: 'Black',
				price: 2000,
				image: '/test.png'
			};

			cart.addItem(item, 1);
			cart.addItem(item, 2);
			const items = get(cart);

			expect(items).toHaveLength(1);
			expect(items[0].quantity).toBe(3);
		});

		it('should treat different variants as different items', () => {
			const item1 = {
				productId: 'test-product',
				variantId: 'variant-1',
				name: 'Test Product',
				size: 'S',
				color: 'Black',
				price: 2000,
				image: '/test.png'
			};

			const item2 = {
				productId: 'test-product',
				variantId: 'variant-2',
				name: 'Test Product',
				size: 'M',
				color: 'Black',
				price: 2000,
				image: '/test.png'
			};

			cart.addItem(item1);
			cart.addItem(item2);
			const items = get(cart);

			expect(items).toHaveLength(2);
		});

		it('should default quantity to 1', () => {
			const item = {
				productId: 'test-product',
				variantId: 'test-variant',
				name: 'Test Product',
				size: 'M',
				color: 'Black',
				price: 2000,
				image: '/test.png'
			};

			cart.addItem(item);
			const items = get(cart);

			expect(items[0].quantity).toBe(1);
		});
	});

	describe('removeItem', () => {
		it('should remove an item from the cart', () => {
			const item = {
				productId: 'test-product',
				variantId: 'test-variant',
				name: 'Test Product',
				size: 'M',
				color: 'Black',
				price: 2000,
				image: '/test.png'
			};

			cart.addItem(item);
			cart.removeItem('test-product', 'test-variant');
			const items = get(cart);

			expect(items).toHaveLength(0);
		});

		it('should not affect other items when removing', () => {
			const item1 = {
				productId: 'product-1',
				variantId: 'variant-1',
				name: 'Product 1',
				size: 'S',
				color: 'Black',
				price: 2000,
				image: '/test1.png'
			};

			const item2 = {
				productId: 'product-2',
				variantId: 'variant-2',
				name: 'Product 2',
				size: 'M',
				color: 'White',
				price: 3000,
				image: '/test2.png'
			};

			cart.addItem(item1);
			cart.addItem(item2);
			cart.removeItem('product-1', 'variant-1');
			const items = get(cart);

			expect(items).toHaveLength(1);
			expect(items[0].productId).toBe('product-2');
		});
	});

	describe('updateQuantity', () => {
		it('should update item quantity', () => {
			const item = {
				productId: 'test-product',
				variantId: 'test-variant',
				name: 'Test Product',
				size: 'M',
				color: 'Black',
				price: 2000,
				image: '/test.png'
			};

			cart.addItem(item, 1);
			cart.updateQuantity('test-product', 'test-variant', 5);
			const items = get(cart);

			expect(items[0].quantity).toBe(5);
		});

		it('should remove item when quantity is set to 0', () => {
			const item = {
				productId: 'test-product',
				variantId: 'test-variant',
				name: 'Test Product',
				size: 'M',
				color: 'Black',
				price: 2000,
				image: '/test.png'
			};

			cart.addItem(item, 1);
			cart.updateQuantity('test-product', 'test-variant', 0);
			const items = get(cart);

			expect(items).toHaveLength(0);
		});

		it('should remove item when quantity is negative', () => {
			const item = {
				productId: 'test-product',
				variantId: 'test-variant',
				name: 'Test Product',
				size: 'M',
				color: 'Black',
				price: 2000,
				image: '/test.png'
			};

			cart.addItem(item, 1);
			cart.updateQuantity('test-product', 'test-variant', -1);
			const items = get(cart);

			expect(items).toHaveLength(0);
		});
	});

	describe('clear', () => {
		it('should remove all items from the cart', () => {
			cart.addItem({
				productId: 'product-1',
				variantId: 'variant-1',
				name: 'Product 1',
				size: 'S',
				color: 'Black',
				price: 2000,
				image: '/test1.png'
			});
			cart.addItem({
				productId: 'product-2',
				variantId: 'variant-2',
				name: 'Product 2',
				size: 'M',
				color: 'White',
				price: 3000,
				image: '/test2.png'
			});

			cart.clear();
			const items = get(cart);

			expect(items).toHaveLength(0);
		});
	});

	describe('getItems', () => {
		it('should return current cart items', () => {
			const item = {
				productId: 'test-product',
				variantId: 'test-variant',
				name: 'Test Product',
				size: 'M',
				color: 'Black',
				price: 2000,
				image: '/test.png'
			};

			cart.addItem(item, 2);
			const items = cart.getItems();

			expect(items).toHaveLength(1);
			expect(items[0].quantity).toBe(2);
		});
	});

	describe('cartItemCount', () => {
		it('should return 0 for empty cart', () => {
			expect(get(cartItemCount)).toBe(0);
		});

		it('should return total quantity across all items', () => {
			cart.addItem({
				productId: 'product-1',
				variantId: 'variant-1',
				name: 'Product 1',
				size: 'S',
				color: 'Black',
				price: 2000,
				image: '/test1.png'
			}, 2);

			cart.addItem({
				productId: 'product-2',
				variantId: 'variant-2',
				name: 'Product 2',
				size: 'M',
				color: 'White',
				price: 3000,
				image: '/test2.png'
			}, 3);

			expect(get(cartItemCount)).toBe(5);
		});
	});

	describe('cartSubtotal', () => {
		it('should return 0 for empty cart', () => {
			expect(get(cartSubtotal)).toBe(0);
		});

		it('should calculate correct subtotal', () => {
			cart.addItem({
				productId: 'product-1',
				variantId: 'variant-1',
				name: 'Product 1',
				size: 'S',
				color: 'Black',
				price: 2000, // $20.00
				image: '/test1.png'
			}, 2);

			cart.addItem({
				productId: 'product-2',
				variantId: 'variant-2',
				name: 'Product 2',
				size: 'M',
				color: 'White',
				price: 3500, // $35.00
				image: '/test2.png'
			}, 1);

			// (2000 * 2) + (3500 * 1) = 7500 cents = $75.00
			expect(get(cartSubtotal)).toBe(7500);
		});
	});

	describe('cart drawer state', () => {
		beforeEach(() => {
			closeCart();
		});

		it('should start closed', () => {
			expect(get(isCartOpen)).toBe(false);
		});

		it('should open cart', () => {
			openCart();
			expect(get(isCartOpen)).toBe(true);
		});

		it('should close cart', () => {
			openCart();
			closeCart();
			expect(get(isCartOpen)).toBe(false);
		});

		it('should toggle cart', () => {
			expect(get(isCartOpen)).toBe(false);
			toggleCart();
			expect(get(isCartOpen)).toBe(true);
			toggleCart();
			expect(get(isCartOpen)).toBe(false);
		});
	});
});
