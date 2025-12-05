export { default as LandingTemplate } from './LandingTemplate.svelte';
export { default as BlogTemplate } from './BlogTemplate.svelte';
export { default as DashboardTemplate } from './DashboardTemplate.svelte';
export { default as EcommerceTemplate } from './EcommerceTemplate.svelte';

export const templates = [
	{ id: 'landing', name: 'SaaS Landing Page', component: 'LandingTemplate' },
	{ id: 'blog', name: 'Blog Article', component: 'BlogTemplate' },
	{ id: 'dashboard', name: 'Dashboard', component: 'DashboardTemplate' },
	{ id: 'ecommerce', name: 'E-commerce', component: 'EcommerceTemplate' }
] as const;

export type TemplateId = (typeof templates)[number]['id'];
