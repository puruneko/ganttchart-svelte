<script lang="ts">
	import type { GanttTask } from '$lib/utils/ganttGrid';

	const {
		gTasks,
		columns,
		cellHeight,
		headerHeight
	}: {
		gTasks: GanttTask[];
		columns: string[];
		cellHeight: number;
		headerHeight: number;
	} = $props();
	//
	const w = 100;
	//
	const taskParamAccesser = (task: GanttTask, name: string): any => {
		if (name in task) {
			//@ts-ignore
			return task[name];
		}
		//@ts-ignore
		if (task.extendedProps && name in task.extendedProps) {
			return task.extendedProps[name];
		}
		return 'UNDEFINED';
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

{#if true}
	<svg>
		<!--header-->
		<g>
			{#each columns as column, i}
				<div></div>
			{/each}
		</g>
		<!--body-->
	</svg>
{:else}
	<div class="sticky top-0 z-10" style="margin-top: 0px;">
		<!-- ヘッダー -->
		<div
			class="flex border-t border-b border-gray-400 bg-gray-100 bg-gray-200"
			style="height:{headerHeight * 2}px;max-height:{headerHeight * 2}px;min-height:{headerHeight *
				2}px;"
		>
			{#each columns as column, i}
				<div
					class="flex border-r border-gray-400 text-sm font-bold h-[{headerHeight * 2}px]"
					style="width: {columnWidths[i]}px;height:{headerHeight * 2}px;max-height:{headerHeight *
						2}px;min-height:{headerHeight * 2}px;"
				>
					<span class="text-center" style="flex-grow:1; width:{columnWidths[i] - 1}px;height:100%;"
						>{column}</span
					>
					<!-- リサイズグリップ -->
					<div
						class="cursor-col-resize bg-transparent"
						style="width:1px;min-width:1px; z-index: 10;height:100%;"
						onpointerdown={(e) => onPointerDown(e, i)}
					></div>
				</div>
			{/each}
		</div>

		<!-- 各タスク -->
		{#each gTasks as gTask}
			<div
				class="flex border-b border-gray-300"
				style="height:{cellHeight}px;max-height:{cellHeight}px;min-height:{cellHeight}px;"
			>
				{#each columns as column, i}
					<div
						class="__truncate w-[{w}px] border-r border-gray-400"
						style="width: {columnWidths[
							i
						]}px;height:{cellHeight}px;max-height:{cellHeight}px;min-height:{cellHeight}px;"
					>
						<span>{taskParamAccesser(gTask, column)}</span>
					</div>
				{/each}
			</div>
		{/each}
	</div>
{/if}
