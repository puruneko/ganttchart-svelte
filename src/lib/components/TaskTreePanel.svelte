<script lang="ts">
	import type { GanttTask } from '$lib/types/task';

	const {
		gTasks,
		columns,
		headerHeight = 30,
		cellHeight = 30
	}: {
		gTasks: GanttTask[];
		columns: string[];
		headerHeight: number;
		cellHeight: number;
	} = $props();
	//
	const w = 100;
	//
	const taskParamAccesser = (task: GanttTask, name: string): any => {
		//@ts-ignore
		return name in task ? task[name] : task.data[name];
	};
	const columnWidths = $state(columns.map((c) => 60)); // [Name, Start, End]
	let resizingColIndex = -1;
	let startX = 0;
	let startWidth = 0;

	function onPointerDown(event: PointerEvent, colIndex: number) {
		resizingColIndex = colIndex;
		startX = event.clientX;
		startWidth = columnWidths[colIndex];

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
	}

	function onPointerMove(event: PointerEvent) {
		if (resizingColIndex < 0) return;
		const delta = event.clientX - startX;
		columnWidths[resizingColIndex] = Math.max(50, startWidth + delta);
	}

	function onPointerUp() {
		resizingColIndex = -1;
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerUp);
	}
</script>

<div class="sticky top-0 z-10" style="margin-top: 0px;">
	<!-- ヘッダー -->
	<div
		class="flex border-b border-gray-400 bg-gray-100 bg-gray-200"
		style={`height: ${headerHeight}px; max-height: ${headerHeight}px;min-height: ${headerHeight}px;`}
	>
		{#each columns as column, i}
			<div
				class={`flex border-r border-gray-400 px-2 py-1 text-sm font-bold`}
				style="width: {columnWidths[i]}px;"
			>
				<span class="text-center" style="flex-grow:1; width:{columnWidths[i] - 1}px;">{column}</span
				>
				<!-- リサイズグリップ -->
				<div
					class="cursor-col-resize bg-transparent"
					style="width:1px;min-width:1px; z-index: 10;"
					onpointerdown={(e) => onPointerDown(e, i)}
				></div>
			</div>
		{/each}
	</div>

	<!-- 各タスク -->
	{#each gTasks as gTask}
		<div
			class="flex border-b border-gray-300"
			style="height: {cellHeight}px; max-height: {cellHeight}px;min-height: {cellHeight}px;"
		>
			{#each columns as column, i}
				<div
					class={`__truncate w-[${w}px] border-r border-gray-400 px-2 py-1`}
					style="width: {columnWidths[i]}px;"
				>
					<span>{taskParamAccesser(gTask, column)}</span>
				</div>
			{/each}
		</div>
	{/each}
</div>
