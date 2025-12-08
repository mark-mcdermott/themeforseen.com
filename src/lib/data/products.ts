export interface ProductVariant {
	id: string;
	size: string;
	color: string;
	colorHex: string;
	printfulSyncVariantId: string; // Printful's sync variant ID for ordering
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

export const products: Product[] = [
	{
		id: 'womens-relaxed-tee',
		slug: 'womens-relaxed-tee',
		name: "Women's Relaxed T-Shirt",
		description: 'A comfortable, relaxed fit t-shirt featuring the ThemeForseen design. Perfect for everyday wear.',
		price: 2080, // $20.80
		images: [],
		category: 'tshirt',
		printfulProductId: 0,
		variants: [
			{ id: 'womens-relaxed-tee-s', size: 'S', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3f7d8269', inStock: true },
			{ id: 'womens-relaxed-tee-m', size: 'M', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3f7d82f5', inStock: true },
			{ id: 'womens-relaxed-tee-l', size: 'L', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3f7d8349', inStock: true },
			{ id: 'womens-relaxed-tee-xl', size: 'XL', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3f7d83a3', inStock: true },
			{ id: 'womens-relaxed-tee-2xl', size: '2XL', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3f7d83f9', inStock: true },
		]
	},
	{
		id: 'toddler-tee',
		slug: 'toddler-tee',
		name: 'Toddler Short Sleeve Tee',
		description: 'A cute and comfortable t-shirt for the little ones. Featuring the ThemeForseen design.',
		price: 1958, // $19.58
		images: [],
		category: 'tshirt',
		printfulProductId: 0,
		variants: [
			{ id: 'toddler-tee-2t', size: '2T', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3e77d7a6', inStock: true },
			{ id: 'toddler-tee-3t', size: '3T', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3e77d819', inStock: true },
			{ id: 'toddler-tee-4t', size: '4T', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3e77d867', inStock: true },
			{ id: 'toddler-tee-5t', size: '5T', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3e77d8b6', inStock: true },
		]
	},
	{
		id: 'premium-zip-hoodie',
		slug: 'premium-zip-hoodie',
		name: 'Premium Full Zip Hoodie',
		description: 'A cozy premium full zip hoodie featuring the ThemeForseen design. Perfect for cooler weather.',
		price: 3504, // $35.04
		images: [],
		category: 'hoodie',
		printfulProductId: 0,
		variants: [
			{ id: 'premium-zip-hoodie-s', size: 'S', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3c9edba9', inStock: true },
			{ id: 'premium-zip-hoodie-m', size: 'M', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3c9edc59', inStock: true },
			{ id: 'premium-zip-hoodie-l', size: 'L', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3c9edce2', inStock: true },
			{ id: 'premium-zip-hoodie-xl', size: 'XL', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3c9edd59', inStock: true },
		]
	},
	{
		id: 'mens-box-hoodie',
		slug: 'mens-box-hoodie',
		name: "Men's Box Hoodie",
		description: 'A stylish box fit hoodie for men featuring the ThemeForseen design. Comfortable and modern.',
		price: 3894, // $38.94
		images: [],
		category: 'hoodie',
		printfulProductId: 0,
		variants: [
			{ id: 'mens-box-hoodie-s', size: 'S', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3b757283', inStock: true },
			{ id: 'mens-box-hoodie-m', size: 'M', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3b7572f6', inStock: true },
			{ id: 'mens-box-hoodie-l', size: 'L', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3b757346', inStock: true },
			{ id: 'mens-box-hoodie-xl', size: 'XL', color: 'Default', colorHex: '#888888', printfulSyncVariantId: '69374a3b757381', inStock: true },
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
