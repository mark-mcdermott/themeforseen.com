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
		price: 2000, // $20.00
		images: ['/products/womens-relaxed-t-shirt-white-front.png'],
		category: 'tshirt',
		printfulProductId: 0,
		variants: [
			{ id: 'womens-relaxed-tee-s', size: 'S', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077610', inStock: true },
			{ id: 'womens-relaxed-tee-m', size: 'M', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077618', inStock: true },
			{ id: 'womens-relaxed-tee-l', size: 'L', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077626', inStock: true },
			{ id: 'womens-relaxed-tee-xl', size: 'XL', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077634', inStock: true },
			{ id: 'womens-relaxed-tee-2xl', size: '2XL', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077642', inStock: true },
		]
	},
	{
		id: 'toddler-tee',
		slug: 'toddler-tee',
		name: 'Toddler Short Sleeve Tee',
		description: 'A cute and comfortable t-shirt for the little ones. Featuring the ThemeForseen design.',
		price: 2000, // $20.00
		images: ['/products/toddler-tee-white-front.png'],
		category: 'tshirt',
		printfulProductId: 0,
		variants: [
			{ id: 'toddler-tee-2t', size: '2T', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077495', inStock: true },
			{ id: 'toddler-tee-3t', size: '3T', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077496', inStock: true },
			{ id: 'toddler-tee-4t', size: '4T', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077497', inStock: true },
			{ id: 'toddler-tee-5t', size: '5T', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077498', inStock: true },
		]
	},
	{
		id: 'premium-zip-hoodie',
		slug: 'premium-zip-hoodie',
		name: 'Premium Full Zip Hoodie',
		description: 'A cozy premium full zip hoodie featuring the ThemeForseen design. Perfect for cooler weather.',
		price: 3500, // $35.00
		images: ['/products/premium-full-zip-hoodie.png'],
		category: 'hoodie',
		printfulProductId: 0,
		variants: [
			{ id: 'premium-zip-hoodie-s', size: 'S', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077282', inStock: true },
			{ id: 'premium-zip-hoodie-m', size: 'M', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077286', inStock: true },
			{ id: 'premium-zip-hoodie-l', size: 'L', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077295', inStock: true },
			{ id: 'premium-zip-hoodie-xl', size: 'XL', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077304', inStock: true },
		]
	},
	{
		id: 'mens-box-hoodie',
		slug: 'mens-box-hoodie',
		name: "Men's Box Hoodie",
		description: 'A stylish box fit hoodie for men featuring the ThemeForseen design. Comfortable and modern.',
		price: 4000, // $40.00
		images: ['/products/mens-box-hoodie-white-front.png'],
		category: 'hoodie',
		printfulProductId: 0,
		variants: [
			{ id: 'mens-box-hoodie-s', size: 'S', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077096', inStock: true },
			{ id: 'mens-box-hoodie-m', size: 'M', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077102', inStock: true },
			{ id: 'mens-box-hoodie-l', size: 'L', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077109', inStock: true },
			{ id: 'mens-box-hoodie-xl', size: 'XL', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096077113', inStock: true },
		]
	},
	{
		id: 'unisex-hoodie',
		slug: 'unisex-hoodie',
		name: 'Unisex Hoodie',
		description: 'A classic unisex hoodie featuring the ThemeForseen design. Available in Black and White.',
		price: 3500, // $35.00
		images: [
			'/products/unisex-hoodie-black-front.png',
			'/products/unisex-hoodie-white-front.png',
		],
		category: 'hoodie',
		printfulProductId: 0,
		variants: [
			// Black
			{ id: 'unisex-hoodie-black-s', size: 'S', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5096072369', inStock: true },
			{ id: 'unisex-hoodie-black-m', size: 'M', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5096072370', inStock: true },
			{ id: 'unisex-hoodie-black-l', size: 'L', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5096072371', inStock: true },
			{ id: 'unisex-hoodie-black-xl', size: 'XL', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5096072372', inStock: true },
			// White
			{ id: 'unisex-hoodie-white-s', size: 'S', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096072374', inStock: true },
			{ id: 'unisex-hoodie-white-m', size: 'M', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096072375', inStock: true },
			{ id: 'unisex-hoodie-white-l', size: 'L', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096072376', inStock: true },
			{ id: 'unisex-hoodie-white-xl', size: 'XL', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096072377', inStock: true },
		]
	},
	{
		id: 'oversized-high-neck-tee',
		slug: 'oversized-high-neck-tee',
		name: 'Unisex Organic Oversized High Neck T-Shirt',
		description: 'A stylish organic oversized high neck t-shirt featuring the ThemeForseen design. Available in multiple colors.',
		price: 2650, // $26.50
		images: [
			'/products/unisex-organic-oversized-high-neck-t-shirt-black-front.png',
			'/products/unisex-organic-oversized-high-neck-t-shirt-french-navy-front.png',
			'/products/unisex-organic-oversized-high-neck-t-shirt-heather-grey-front.png',
			'/products/unisex-organic-oversized-high-neck-t-shirt-stone-front.png',
			'/products/unisex-organic-oversized-high-neck-t-shirt-white-front.png',
		],
		category: 'tshirt',
		printfulProductId: 0,
		variants: [
			// French Navy
			{ id: 'oversized-tee-navy-s', size: 'S', color: 'French Navy', colorHex: '#1e3a5f', printfulSyncVariantId: '5096066097', inStock: true },
			{ id: 'oversized-tee-navy-m', size: 'M', color: 'French Navy', colorHex: '#1e3a5f', printfulSyncVariantId: '5096066098', inStock: true },
			{ id: 'oversized-tee-navy-l', size: 'L', color: 'French Navy', colorHex: '#1e3a5f', printfulSyncVariantId: '5096066099', inStock: true },
			{ id: 'oversized-tee-navy-xl', size: 'XL', color: 'French Navy', colorHex: '#1e3a5f', printfulSyncVariantId: '5096066100', inStock: true },
			{ id: 'oversized-tee-navy-2xl', size: '2XL', color: 'French Navy', colorHex: '#1e3a5f', printfulSyncVariantId: '5096066101', inStock: true },
			// Black
			{ id: 'oversized-tee-black-s', size: 'S', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5096066102', inStock: true },
			{ id: 'oversized-tee-black-m', size: 'M', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5096066103', inStock: true },
			{ id: 'oversized-tee-black-l', size: 'L', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5096066104', inStock: true },
			{ id: 'oversized-tee-black-xl', size: 'XL', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5096066105', inStock: true },
			{ id: 'oversized-tee-black-2xl', size: '2XL', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5096066106', inStock: true },
			// Heather Grey
			{ id: 'oversized-tee-grey-s', size: 'S', color: 'Heather Grey', colorHex: '#9ca3af', printfulSyncVariantId: '5096066107', inStock: true },
			{ id: 'oversized-tee-grey-m', size: 'M', color: 'Heather Grey', colorHex: '#9ca3af', printfulSyncVariantId: '5096066108', inStock: true },
			{ id: 'oversized-tee-grey-l', size: 'L', color: 'Heather Grey', colorHex: '#9ca3af', printfulSyncVariantId: '5096066109', inStock: true },
			{ id: 'oversized-tee-grey-xl', size: 'XL', color: 'Heather Grey', colorHex: '#9ca3af', printfulSyncVariantId: '5096066110', inStock: true },
			{ id: 'oversized-tee-grey-2xl', size: '2XL', color: 'Heather Grey', colorHex: '#9ca3af', printfulSyncVariantId: '5096066111', inStock: true },
			// Stone
			{ id: 'oversized-tee-stone-s', size: 'S', color: 'Stone', colorHex: '#d4c4b0', printfulSyncVariantId: '5096066112', inStock: true },
			{ id: 'oversized-tee-stone-m', size: 'M', color: 'Stone', colorHex: '#d4c4b0', printfulSyncVariantId: '5096066113', inStock: true },
			{ id: 'oversized-tee-stone-l', size: 'L', color: 'Stone', colorHex: '#d4c4b0', printfulSyncVariantId: '5096066114', inStock: true },
			{ id: 'oversized-tee-stone-xl', size: 'XL', color: 'Stone', colorHex: '#d4c4b0', printfulSyncVariantId: '5096066115', inStock: true },
			// White
			{ id: 'oversized-tee-white-s', size: 'S', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096066116', inStock: true },
			{ id: 'oversized-tee-white-m', size: 'M', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096066117', inStock: true },
			{ id: 'oversized-tee-white-l', size: 'L', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096066118', inStock: true },
			{ id: 'oversized-tee-white-xl', size: 'XL', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096066119', inStock: true },
			{ id: 'oversized-tee-white-2xl', size: '2XL', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '5096066120', inStock: true },
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
