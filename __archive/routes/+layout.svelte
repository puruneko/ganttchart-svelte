<script lang="ts">
	import '../lib/styles/theme.css';
</script>

<div class="flex min-h-screen flex-col">
	<header class="bg-metro-blue p-4 text-white">
		<h1>ガントチャートアプリ</h1>
	</header>

	<main class="flex-1 bg-gray-50 p-4">
		<slot />
	</main>

	<footer class="bg-gray-200 p-2 text-center text-sm">© 2025 ねこプル</footer>
</div>
