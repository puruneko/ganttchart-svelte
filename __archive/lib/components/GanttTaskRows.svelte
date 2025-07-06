<script lang="ts">
	import TaskBar from './TaskBar.svelte';
	import SummaryBar from './SummaryBar.svelte';
	import type { GanttTask } from '$lib/types/task';

	const {
		tasks,
		timeScale,
		rowHeight = 30
	} = $props<{
		tasks: GanttTask[];
		timeScale: (d: Date) => number;
		rowHeight?: number;
	}>();
</script>

<svg class="h-full w-full">
	{#each tasks as task, i (task.taskId)}
		{#if task.taskType === 'summary'}
			<SummaryBar {task} {timeScale} y={i * rowHeight} barHeight={rowHeight - 4} />
		{:else}
			<TaskBar {task} {timeScale} y={i * rowHeight} barHeight={rowHeight - 4} />
		{/if}
	{/each}
</svg>
