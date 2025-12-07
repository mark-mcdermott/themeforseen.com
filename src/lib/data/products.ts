export interface ProductVariant {
	id: string;
	size: string;
	color: string;
	colorHex: string;
	printfulVariantId: number; // Printful's variant ID for ordering
	inStock: boolean;
}

export interface Product {
	id: string;
	slug: string;
	name: string;
	description: string;
	price: number; // in cents
	images: string[];
	category: 'tshirt' | 'hoodie' | 'mug' | 'sticker';
	printfulProductId: number; // Printful's product template ID
	variants: ProductVariant[];
}

// Placeholder products - replace with real Printful product/variant IDs once set up
export const products: Product[] = [
	{
		id: 'crystal-ball-tee',
		slug: 'crystal-ball-tee',
		name: 'Crystal Ball Tee',
		description: 'The classic ThemeForseen crystal ball logo on a soft, comfortable cotton t-shirt. Perfect for developers who like to see the future of their designs.',
		price: 2500, // $25.00
		images: ['/images/store/crystal-ball-tee.png'],
		category: 'tshirt',
		printfulProductId: 71, // Gildan 64000 Unisex Softstyle T-Shirt
		variants: [
			// Black variants
			{ id: 'crystal-ball-tee-black-s', size: 'S', color: 'Black', colorHex: '#1a1a1a', printfulVariantId: 4011, inStock: true },
			{ id: 'crystal-ball-tee-black-m', size: 'M', color: 'Black', colorHex: '#1a1a1a', printfulVariantId: 4012, inStock: true },
			{ id: 'crystal-ball-tee-black-l', size: 'L', color: 'Black', colorHex: '#1a1a1a', printfulVariantId: 4013, inStock: true },
			{ id: 'crystal-ball-tee-black-xl', size: 'XL', color: 'Black', colorHex: '#1a1a1a', printfulVariantId: 4014, inStock: true },
			{ id: 'crystal-ball-tee-black-2xl', size: '2XL', color: 'Black', colorHex: '#1a1a1a', printfulVariantId: 4015, inStock: true },
			// White variants
			{ id: 'crystal-ball-tee-white-s', size: 'S', color: 'White', colorHex: '#ffffff', printfulVariantId: 4017, inStock: true },
			{ id: 'crystal-ball-tee-white-m', size: 'M', color: 'White', colorHex: '#ffffff', printfulVariantId: 4018, inStock: true },
			{ id: 'crystal-ball-tee-white-l', size: 'L', color: 'White', colorHex: '#ffffff', printfulVariantId: 4019, inStock: true },
			{ id: 'crystal-ball-tee-white-xl', size: 'XL', color: 'White', colorHex: '#ffffff', printfulVariantId: 4020, inStock: true },
			{ id: 'crystal-ball-tee-white-2xl', size: '2XL', color: 'White', colorHex: '#ffffff', printfulVariantId: 4021, inStock: true },
		]
	},
	{
		id: 'i-forsee-tee',
		slug: 'i-forsee-tee',
		name: 'I Forsee... Tee',
		description: '"I forsee... many beautiful webapps in your future!" The signature catchphrase on a premium cotton tee.',
		price: 2500, // $25.00
		images: ['/images/store/i-forsee-tee.png'],
		category: 'tshirt',
		printfulProductId: 71,
		variants: [
			{ id: 'i-forsee-tee-black-s', size: 'S', color: 'Black', colorHex: '#1a1a1a', printfulVariantId: 4011, inStock: true },
			{ id: 'i-forsee-tee-black-m', size: 'M', color: 'Black', colorHex: '#1a1a1a', printfulVariantId: 4012, inStock: true },
			{ id: 'i-forsee-tee-black-l', size: 'L', color: 'Black', colorHex: '#1a1a1a', printfulVariantId: 4013, inStock: true },
			{ id: 'i-forsee-tee-black-xl', size: 'XL', color: 'Black', colorHex: '#1a1a1a', printfulVariantId: 4014, inStock: true },
			{ id: 'i-forsee-tee-black-2xl', size: '2XL', color: 'Black', colorHex: '#1a1a1a', printfulVariantId: 4015, inStock: true },
			{ id: 'i-forsee-tee-navy-s', size: 'S', color: 'Navy', colorHex: '#1e3a5f', printfulVariantId: 4025, inStock: true },
			{ id: 'i-forsee-tee-navy-m', size: 'M', color: 'Navy', colorHex: '#1e3a5f', printfulVariantId: 4026, inStock: true },
			{ id: 'i-forsee-tee-navy-l', size: 'L', color: 'Navy', colorHex: '#1e3a5f', printfulVariantId: 4027, inStock: true },
			{ id: 'i-forsee-tee-navy-xl', size: 'XL', color: 'Navy', colorHex: '#1e3a5f', printfulVariantId: 4028, inStock: true },
			{ id: 'i-forsee-tee-navy-2xl', size: '2XL', color: 'Navy', colorHex: '#1e3a5f', printfulVariantId: 4029, inStock: true },
		]
	}
];

// Helper functions
export function getProduct(slug: string): Product | undefined {
	return products.find(p => p.slug === slug);
}

export function getProductVariant(productId: string, variantId: string): ProductVariant | undefined {
	const product = products.find(p => p.id === productId);
	return product?.variants.find(v => v.id === variantId);
}

export function getAvailableSizes(product: Product): string[] {
	return [...new Set(product.variants.filter(v => v.inStock).map(v => v.size))];
}

export function getAvailableColors(product: Product): { color: string; hex: string }[] {
	const colors = new Map<string, string>();
	product.variants
		.filter(v => v.inStock)
		.forEach(v => colors.set(v.color, v.colorHex));
	return Array.from(colors.entries()).map(([color, hex]) => ({ color, hex }));
}

export function getVariantByOptions(product: Product, size: string, color: string): ProductVariant | undefined {
	return product.variants.find(v => v.size === size && v.color === color && v.inStock);
}

export function formatPrice(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}
