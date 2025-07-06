<script lang="ts">
	import '../lib/styles/theme.css';
</script>

<div class="flex h-screen max-h-screen flex-col" style="overflow: hidden;">
	<header class="bg-metro-blue p-4 text-white">
		<h1>テスト</h1>
	</header>

	<main class="flex-1 bg-gray-50 p-4" style="overflow: scroll;">
		<slot />
	</main>

	<!--<footer class="bg-gray-200 p-2 text-center text-sm">© 2025 ねこプル</footer>-->
</div>
