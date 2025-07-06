<script lang="ts">
	import type { ViewMode } from '$lib/utils/timeView';
	import TimeAxis from './TimeAxis.svelte';
	const { timeScale, viewMode = 'day' } = $props<{
		timeScale: (d: Date) => number;
		viewMode?: ViewMode;
	}>();
</script>

<div class="border-b">
	<TimeAxis {timeScale} {viewMode} width={timeScale.range()[1]} />
</div>
