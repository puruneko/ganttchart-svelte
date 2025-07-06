<script lang="ts">
	import TimeScaleHeader from './TimeScaleHeader.svelte';
	import TaskTreePanel from './TaskTreePanel.svelte';
	import GanttTaskRows from './GanttTaskRows.svelte';

	import { scaleTime } from 'd3-scale';
	import * as d3 from 'd3-time';
	import { getViewRangeForMode, type ViewMode } from '$lib/utils/timeView';
	import type { GanttTask } from '$lib/types/task';

	const { tasks, viewMode = 'day' } = $props<{
		tasks: GanttTask[];
		viewMode?: ViewMode;
	}>();

	const now = new Date();
	const { start, end } = getViewRangeForMode(viewMode, now);

	const timeScale = $state(
		scaleTime()
			.domain([start, end])
			.range([0, 1440 * 3]) // 3日分 * 1440px（1px=1min 相当）
	);
</script>

<div class="flex h-full">
	<TaskTreePanel {tasks} className="w-1/4 border-r" />
	<div class="flex-1 overflow-x-auto overflow-y-hidden">
		<TimeScaleHeader {timeScale} {viewMode} />
		<GanttTaskRows {tasks} {timeScale} rowHeight={30} />
	</div>
</div>
