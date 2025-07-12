<script lang="ts">
	import '../lib/styles/theme.css';
	export async function load() {
		try {
			const res = await fetch('/some-api');
			if (!res.ok) {
				return {
					error: true,
					message: 'Fetch failed with ' + res.status
				};
			}
			const data = await res.json();
			return { data };
		} catch (e: any) {
			// エラーにしない
			return {
				error: true,
				message: 'Unexpected error: ' + e.message
			};
		}
	}
</script>

<slot />
<!-- <div class="flex h-screen max-h-screen flex-col" style="overflow: hidden;">
	<header class="bg-metro-blue p-4 text-white">
		<h1>テスト</h1>
	</header>

	<main class="flex-1 bg-gray-50 p-4" style="overflow: scroll;">
		<slot />
	</main>

	
</div> -->
