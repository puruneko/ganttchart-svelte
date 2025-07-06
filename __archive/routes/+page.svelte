<script lang="ts">
	import GanttChart from '$lib/components/GanttChart.svelte';
	import type { GanttTask } from '$lib/types/task';
	import type { ViewMode } from '$lib/utils/timeView';

	const tasks: GanttTask[] = [
		{
			taskId: '1',
			parentTaskId: null,
			taskType: 'summary',
			title: 'プロジェクトA',
			startDate: new Date('2025-07-01'),
			endDate: new Date('2025-07-10'),
			isExpanded: true
		},
		{
			taskId: '1-1',
			parentTaskId: '1',
			taskType: 'task',
			title: '設計',
			startDate: new Date('2025-07-01'),
			endDate: new Date('2025-07-03')
		},
		{
			taskId: '1-2',
			parentTaskId: '1',
			taskType: 'task',
			title: '実装',
			startDate: new Date('2025-07-04'),
			endDate: new Date('2025-07-10')
		}
	];
	const viewMode: ViewMode = 'day';
	const viewStartDate = new Date('2025-07-01');
	const viewEndDate = new Date('2025-07-2');
</script>

<GanttChart {tasks} {viewMode} />
