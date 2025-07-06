<script lang="ts">
	import type { GanttTask } from '$lib/types/task';

	const {
		task,
		timeScale,
		barHeight = 20,
		y = 0
	} = $props<{
		task: GanttTask;
		timeScale: (d: Date) => number;
		barHeight?: number;
		y: number;
	}>();

	const barX = $derived(timeScale(task.startDate));
	const barWidth = $derived(timeScale(task.endDate) - barX);
</script>

<rect
	x={barX}
	{y}
	width={barWidth}
	height={barHeight}
	rx="3"
	ry="3"
	class="fill-gray-600 opacity-80"
/>
