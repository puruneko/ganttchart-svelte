<script lang="ts">
	import type { GanttTask } from '$lib/types/task';
	import GanttGrid from './GanttGrid.svelte';
	import GanttTaskRows from './GanttTaskRows.svelte';
	import GridHeader from './GridHeader.svelte';
	import TaskTreePanel from './TaskTreePanel.svelte';

	let { tasks, cellNumber }: { tasks: GanttTask[]; cellNumber: number } = $props();

	let gTasks: GanttTask[] = $derived.by(() => {
		const parentTaskIds = new Set(tasks.map((task) => task.parentTaskId));
		return Array.from(parentTaskIds)
			.sort()
			.map((parentTaskId) => {
				const children = tasks.filter((task) => task.parentTaskId === parentTaskId);
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
	//
	//
	let taskTreePanelElement: HTMLDivElement | null = $state(null);
	let gridHeaderElement: HTMLDivElement | null = $state(null);
	let taskTreeWidth = $state(0);
	let headerHeight = $state(0);
	const cellWidth = 20;
	const cellHeight = 20;

	const onTaskUpdate = (newTask: GanttTask) => {
		tasks = tasks.map((task: GanttTask) => (task.taskId === newTask.taskId ? newTask : task));
	};

	$effect(() => {
		console.log('ganttchart $effect');
		if (!taskTreePanelElement) {
			console.log('taskTreePanelElement not found');
			return;
		}
		taskTreeWidth = taskTreePanelElement.getBoundingClientRect().width;
		if (!(gridHeaderElement instanceof Element)) {
			console.log('gridHeaderElement not found');
			return;
		}
		const computed = getComputedStyle(gridHeaderElement as Element);
		const lineHeightStr = computed.lineHeight;
		headerHeight =
			parseFloat(computed.height) +
			parseFloat(computed.borderTopWidth) +
			parseFloat(computed.borderBottomWidth) +
			parseFloat(computed.paddingTop) +
			parseFloat(computed.paddingBottom);
		console.log(
			'computed',
			computed,
			gridHeaderElement,
			gridHeaderElement.offsetHeight,
			gridHeaderElement.getBoundingClientRect(),
			gridHeaderElement.getClientRects()
		);
	});
</script>

<div class="flex w-full overflow-auto font-mono text-xs" style="height:100%; overflow: visible;">
	<!-- 左側：Task情報 -->
	<div
		bind:this={taskTreePanelElement}
		class="___border-r ____border-gray-300 min-w-[200px] shrink-0"
	>
		<TaskTreePanel
			{gTasks}
			columns={['taskId', 'title', 'startCell', 'endCell', 'parentTaskId', 'taskType']}
			{headerHeight}
			{cellHeight}
		/>
	</div>

	<!-- 右側：Gantt情報 -->
	<div class={`-translate-x-[${taskTreeWidth}]px`}>
		<div bind:this={gridHeaderElement}>
			<GridHeader columns={cellNumber} {cellWidth} {cellHeight} />
		</div>
		<svg
			class="w-full border"
			style={`height: ${gTasks.length * cellHeight}px; width: ${cellWidth * cellNumber}`}
		>
			<GanttTaskRows {gTasks} {cellWidth} {cellHeight} onUpdate={onTaskUpdate} />
			<GanttGrid
				numCols={cellNumber}
				numRows={gTasks.length}
				{cellWidth}
				{cellHeight}
				width={cellNumber * cellWidth}
				height={gTasks.length * cellHeight}
			/>
		</svg>
	</div>
</div>
