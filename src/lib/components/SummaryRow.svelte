<script lang="ts">
	import type { GanttTask } from '$lib/types/task';
	import RowTemplate from './RowTemplate.svelte';

	const {
		task,
		children,
		index,
		cellWidth = 40,
		cellHeight = 30,
		onUpdate,
		style = { fill: 'green' }
	}: {
		task: GanttTask;
		children: GanttTask[];
		index: number;
		cellWidth?: number;
		cellHeight?: number;
		onUpdate: (task: GanttTask) => void;
		style?: Record<string, string>;
	} = $props();
</script>

<RowTemplate
	{task}
	{cellWidth}
	{cellHeight}
	onUpdate={(newTask: GanttTask) => {
		onUpdate(newTask);
		const shiftStart = newTask.startCell - task.startCell;
		const shiftEnd = newTask.endCell - task.endCell;
		console.log('children', children);
		children.forEach((childTask) => {
			onUpdate({
				...childTask,
				startCell: childTask.startCell + shiftStart,
				endCell: childTask.endCell + shiftEnd
			});
		});
	}}
	{index}
	{style}
	useResizeLeft={false}
	useResizeRight={false}
/>
