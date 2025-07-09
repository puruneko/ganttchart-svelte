<script lang="ts">
	import type { GanttTask } from '$lib/utils/ganttGrid';
	import type { Component } from 'svelte';
	import type { EventHandler, MouseEventHandler } from 'svelte/elements';

	const {
		task,
		index,
		cellWidth,
		cellHeight,
		onUpdate,
		style = { fill: 'black' },
		useMove = true,
		useResizeLeft = true,
		useResizeRight = true,
		customComponent = undefined
	}: {
		task: GanttTask;
		index: number;
		cellWidth: number;
		cellHeight: number;
		onUpdate: (updated: GanttTask) => void;
		style?: Record<string, string>;
		useMove?: boolean;
		useResizeLeft?: boolean;
		useResizeRight?: boolean;
		customComponent?: (
			props: Partial<{
				task: GanttTask;
				index: number;
				bodyX: number;
				bodyY: number;
				bodyWidth: number;
				bodyHeight: number;
				cellWidth: number;
				cellHeight: number;
				style: Record<string, string>;
			}>
		) => Component;
	} = $props();
	//
	const cellHeightMergin = cellHeight * 0.1;

	// 状態管理
	let dragOffsetX = $state(0);
	let dragOffsetWidth = $state(0);
	let isSizeChanging = '';
	let startX = 0;
	let initialStart = 0;
	let initialEnd = 0;
	const bodyX = $derived(task.startCell * cellWidth + dragOffsetX);
	const bodyY = $derived(index * cellHeight + cellHeightMergin);
	const bodyWidth = $derived((task.endCell - task.startCell) * cellWidth + dragOffsetWidth);
	const bodyHeight = $derived(cellHeight - cellHeightMergin * 2);

	function onPointerDown(event: PointerEvent, mode: 'move' | 'left' | 'right') {
		if (isSizeChanging !== '') {
			return;
		}
		startX = event.clientX;
		initialStart = task.startCell;
		initialEnd = task.endCell;

		isSizeChanging = mode;

		const el = event.currentTarget as SVGGraphicsElement;
		el?.setPointerCapture(event.pointerId);
		event.preventDefault();
	}

	function onPointerMove(event: PointerEvent) {
		const deltaX = event.clientX - startX;
		//const deltaCells = Math.round((deltaX / cellWidth) * 2) / 2;

		if (isSizeChanging === 'move') {
			dragOffsetX = deltaX;
		} else if (isSizeChanging === 'left') {
			dragOffsetX = deltaX;
			dragOffsetWidth = -1 * deltaX;
			//const newStart = Math.min(initialEnd - 0.5, initialStart + deltaCells);
			//onUpdate({ ...task, startCell: Math.max(0, newStart) });
		} else if (isSizeChanging === 'right') {
			dragOffsetWidth = deltaX;
			//const newEnd = Math.max(initialStart + 0.5, initialEnd + deltaCells);
			//onUpdate({ ...task, endCell: newEnd });
		}
	}

	function onPointerUp() {
		const deltaCellsX = Math.round((dragOffsetX / cellWidth) * 2) / 2;
		const deltaCellsWidth = Math.round((dragOffsetWidth / cellWidth) * 2) / 2;

		if (deltaCellsX !== 0 || deltaCellsWidth !== 0) {
			let newTask: GanttTask | null = null;
			if (isSizeChanging === 'move') {
				const startCell = Math.max(0, task.startCell + deltaCellsX);
				newTask = {
					...task,
					startCell,
					endCell: startCell + (task.endCell - task.startCell)
				};
				onUpdate(newTask);
			} else if (isSizeChanging === 'left') {
				const newStart = Math.min(initialEnd - 0.5, initialStart + deltaCellsX);
				newTask = { ...task, startCell: Math.max(0, newStart) };
			} else if (isSizeChanging === 'right') {
				const newEnd = Math.max(initialStart + 0.5, initialEnd + deltaCellsWidth);
				newTask = { ...task, endCell: newEnd };
			}
			//
			if (newTask) {
				console.log('update:', isSizeChanging, newTask);
				onUpdate(newTask);
			}
		}

		//
		startX = 0;
		initialStart = 0;
		initialEnd = 0;
		//
		dragOffsetX = 0;
		dragOffsetWidth = 0;
		isSizeChanging = '';
		//
	}
	const onclickHandler: EventHandler<any> = (evt: Event) => {};
</script>

{#if customComponent === undefined}
	<g onpointermove={onPointerMove} onpointerup={onPointerUp} style="cursor: grab;">
		<!-- 本体バー -->
		<rect
			x={bodyX}
			y={bodyY}
			width={bodyWidth}
			height={bodyHeight}
			rx="4"
			ry="4"
			class="fill-blue-500 hover:fill-blue-600"
			fill={style.fill}
			onpointerdown={useMove ? (e) => onPointerDown(e, 'move') : undefined}
		>
		</rect>

		<!-- タスク名 -->
		<text
			x={task.startCell * cellWidth + dragOffsetX + 5}
			y={index * cellHeight + cellHeight / 2 + 4}
			font-size="12"
			fill="white"
			onpointerdown={(e) => onPointerDown(e, 'move')}
		>
			{task.title}
		</text>

		<!-- 左端ハンドル -->
		{#if useResizeLeft}
			<rect
				x={task.startCell * cellWidth + dragOffsetX}
				y={index * cellHeight}
				width={Math.min(8, bodyWidth * 0.05)}
				height={cellHeight}
				class="cursor-ew-resize fill-transparent"
				onpointerdown={(e) => onPointerDown(e, 'left')}
			/>
		{/if}

		<!-- 右端ハンドル -->
		{#if useResizeRight}
			<rect
				x={task.endCell * cellWidth + dragOffsetX}
				y={index * cellHeight}
				width={Math.min(8, bodyWidth * 0.05)}
				height={cellHeight}
				class="cursor-ew-resize fill-transparent"
				onpointerdown={(e) => onPointerDown(e, 'right')}
			/>
		{/if}
	</g>
{:else}
	{customComponent({
		task,
		index,
		bodyX,
		bodyY,
		bodyWidth,
		bodyHeight,
		cellWidth,
		cellHeight,
		style
	})}
{/if}
