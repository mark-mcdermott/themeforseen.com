<script lang="ts">
	import { Hero } from '$lib/components/blocks';
</script>

<svelte:head>
	<title>ThemeForseen - Scrollable Color Themes & Font Pairings</title>
	<meta name="description" content="ThemeForseen - Scrollable color themes and font pairings with live preview" />
</svelte:head>

<Hero />

<div class="max-w-6xl mx-auto px-6 mt-16">
	<p class="text-xl leading-9">ThemeForseen is a lightweight tool for your development phase that adds a sidebar to your site where you can easily scroll up and down to quickly try different color themes and font pairings. It's a React component, so it's relatively framework agnostic. Quickly ship your projects without having them look like generic free templates.</p>

	<blockquote class="relative my-16 pl-8 md:pl-12 border-l-4 border-[var(--primary-color,#51c5f4)] py-6 bg-gradient-to-r from-[var(--primary-color,#51c5f4)]/5 to-transparent">
		<p class="text-3xl font-bold leading-[1.4]" style="font-family: 'Rock Salt', cursive;">
			<span class="text-5xl">I forsee...</span> many beautiful webapps in your future!
		</p>
	</blockquote>
</div>
