<script lang="ts">
	import TaskRow from './TaskRow.svelte';
	import SummaryRow from './SummaryRow.svelte';
	import type { GanttTask } from '$lib/utils/ganttGrid';

	const {
		gTasks,
		cellWidth,
		cellHeight,
		onUpdate
	}: {
		gTasks: GanttTask[];
		cellWidth?: number;
		cellHeight?: number;
		onUpdate: (task: GanttTask) => void;
	} = $props();

	// 子タスクを持つタスクID -> 配下の子タスク一覧
	const getChildrenOf = (parentId: string): GanttTask[] => {
		const map: Record<string, GanttTask[]> = {};
		for (const gTask of gTasks) {
			if (!map[gTask.parentTaskId]) map[gTask.parentTaskId] = [];
			map[gTask.parentTaskId].push(gTask);
		}
		//return map[parentId] ?? [];
		return gTasks.filter((task) => task.parentTaskId === parentId);
	};
</script>

<svg class="h-auto w-full">
	{#each gTasks as gTask, i}
		{#if gTask.taskType === 'summary'}
			<SummaryRow
				task={gTask}
				children={getChildrenOf(gTask.taskId)}
				{cellWidth}
				{cellHeight}
				{onUpdate}
				index={i}
				style={{ fill: 'green' }}
			/>
		{:else}
			<TaskRow
				task={gTask}
				{cellWidth}
				{cellHeight}
				index={i}
				{onUpdate}
				style={{ fill: 'blue' }}
			/>
		{/if}
	{/each}
</svg>
