<script lang="ts">
	import type { Task } from '$lib/types/task';
	import { toGanttTaskFromTask, toTaskFromGanttTask, type GanttTask } from '$lib/utils/ganttGrid';
	import GanttGrid from './GanttGrid.svelte';
	import GanttTaskRows from './GanttTaskRows.svelte';
	import GridHeader from './GridHeader.svelte';
	import TaskTreePanel from './TaskTreePanel.svelte';

	let { tasks, cellNumber }: { tasks: Task[]; cellNumber: number } = $props();

	let dateBase = $state(new Date(Date.now()));
	let dateUnit = $state(1000 * 60 * 60 * 1);
	let dateUnitSubstep = $state(2);

	let gTasks: GanttTask[] = $derived.by(() => {
		const parentTaskIds = new Set(tasks.map((task) => task.parentTaskId));
		return Array.from(parentTaskIds)
			.sort()
			.map((parentTaskId) => {
				const children = tasks
					.filter((task) => task.parentTaskId === parentTaskId)
					.map((task) => toGanttTaskFromTask(task, dateBase, dateUnit, dateUnitSubstep));
				if (parentTaskId === '') {
					return children;
				}
				const startCell = children.reduce((cell, child) => Math.min(child.startCell, cell), 999999);
				const endCell = children.reduce((cell, child) => Math.max(child.endCell, cell), startCell);
				const summary: GanttTask = {
					taskId: parentTaskId,
					parentTaskId: '',
					taskType: 'summary',
					title: `s${parentTaskId}`,
					startCell,
					endCell
				};
				return [summary, ...children];
			})
			.flat();
	});

	let locMax = $state(0);
	let locMin = $state(0);
	let headerHeight = $state(20);
	const cellWidth = $state(20);
	const cellHeight = $state(20);
	//
	const useCols = $state([
		'taskId',
		'title',
		'startCell',
		'endCell',
		'startDate',
		'endDate',
		'parentTaskId',
		'taskType'
	]);

	const onTaskUpdate = (newTask: GanttTask) => {
		tasks = tasks.map((task: Task) =>
			task.taskId === newTask.taskId ? toTaskFromGanttTask(newTask, dateBase, dateUnit) : task
		);
	};
	console.log('task,gTask', tasks, gTasks);
</script>

<div class="flex w-full overflow-auto font-mono text-xs" style="height:100%; overflow: visible;">
	<TaskTreePanel {gTasks} columns={useCols} {cellHeight} {headerHeight} />

	<div>
		<GridHeader columns={cellNumber} {cellWidth} {cellHeight} {headerHeight} />

		<svg
			class="w-full border"
			style={`height: ${gTasks.length * cellHeight}px; width: ${cellWidth * cellNumber}`}
		>
			<GanttGrid
				numCols={cellNumber}
				numRows={gTasks.length}
				{cellWidth}
				{cellHeight}
				width={cellNumber * cellWidth}
				height={gTasks.length * cellHeight}
			/>
			<GanttTaskRows {gTasks} {cellWidth} {cellHeight} onUpdate={onTaskUpdate} />
		</svg>
	</div>
</div>
