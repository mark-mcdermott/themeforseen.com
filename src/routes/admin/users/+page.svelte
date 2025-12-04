<script lang="ts">
	let { data } = $props();

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Users - Admin</title>
	<meta name="description" content="Admin user management" />
</svelte:head>

<div class="max-w-6xl mx-auto px-6 py-16">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1>Users</h1>
			<p class="text-muted-foreground mt-2">
				{data.users.length} total user{data.users.length === 1 ? '' : 's'}
			</p>
		</div>
	</div>

	<div class="border rounded-lg overflow-hidden">
		<table class="w-full">
			<thead class="bg-muted/50">
				<tr>
					<th class="text-left px-4 py-3 font-medium">User</th>
					<th class="text-left px-4 py-3 font-medium">Email</th>
					<th class="text-left px-4 py-3 font-medium">Role</th>
					<th class="text-left px-4 py-3 font-medium">Joined</th>
					<th class="text-right px-4 py-3 font-medium">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each data.users as user}
					<tr class="hover:bg-muted/30 transition-colors">
						<td class="px-4 py-3">
							<span class="font-medium">{user.name || 'No name'}</span>
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{user.email}
						</td>
						<td class="px-4 py-3">
							{#if user.isAdmin}
								<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
									Admin
								</span>
							{:else}
								<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
									User
								</span>
							{/if}
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{formatDate(user.createdAt)}
						</td>
						<td class="px-4 py-3 text-right">
							<a
								href="/u/{user.id}"
								class="text-sm text-primary hover:underline"
							>
								View
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
