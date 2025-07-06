<script lang="ts">
	import type { GanttTask } from '$lib/types/task';

	const props = $props<{
		task: GanttTask;
		timeScale: (d: Date) => number;
		barHeight?: number;
		y: number;
	}>();
	const {
		task,
		timeScale,
		barHeight = 20,
		y = 0
	} = props as {
		task: GanttTask;
		timeScale: (d: Date) => number;
		barHeight?: number;
		y: number;
	};

	const barX = $derived(timeScale(task.startDate));
	const barWidth = $derived(timeScale(task.endDate) - barX);
	const colorClass = task.colorClass ?? 'bg-blue-500';
</script>

<foreignObject x={barX} {y} width={barWidth} height={barHeight} class="overflow-visible">
	<div
		class={`h-full w-full ${colorClass} pointer-events-none flex items-center rounded-sm px-1 text-[10px] text-white`}
		xmlns="http://www.w3.org/1999/xhtml"
	>
		{task.title}
	</div>
</foreignObject>
