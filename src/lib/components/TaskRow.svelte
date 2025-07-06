<!-- <script lang="ts">
	import type { GanttTask } from '$lib/types/task';

	const { task, index, cellWidth, cellHeight, onUpdate } = $props<{
		task: GanttTask;
		index: number;
		cellWidth: number;
		cellHeight: number;
		onUpdate: (updated: GanttTask) => void;
	}>();

	let isDragging = $state(false);
	let dragOffsetX = $state(0);

	let startX = 0;

	function onPointerDown(event: PointerEvent) {
		isDragging = true;
		startX = event.clientX;
		const svgElement = event.currentTarget as SVGGraphicsElement;
		svgElement?.setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (!isDragging) return;
		const deltaX = event.clientX - startX;
		dragOffsetX = deltaX;
	}

	function onPointerUp(event: PointerEvent) {
		if (!isDragging) return;

		isDragging = false;
		const totalOffset = dragOffsetX;
		const offsetInCells = Math.round((totalOffset / cellWidth) * 2) / 2; // 0.5マス単位

		const newStart = task.startCell + offsetInCells;
		const newEnd = task.endCell + offsetInCells;

		onUpdate({
			...task,
			startCell: Math.max(0, newStart),
			endCell: Math.max(0.5, newEnd)
		});

		dragOffsetX = 0;
	}
</script>

<g
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	style="cursor: grab;"
>
	<rect
		x={task.startCell * cellWidth + dragOffsetX}
		y={cellHeight * index}
		width={(task.endCell - task.startCell) * cellWidth}
		height={cellHeight}
		rx="4"
		ry="4"
		class="fill-blue-500 hover:fill-blue-600"
	/>
	<text
		x={task.startCell * cellWidth + dragOffsetX + 5}
		y={cellHeight * index + cellHeight / 2 + 4}
		font-size="12"
		fill="white"
	>
		{task.title}
	</text>
</g> -->

<!-- <script lang="ts">
	import type { GanttTask } from '$lib/types/task';

	const {
		task,
		index,
		cellWidth,
		cellHeight,
		onUpdate,
		style = { fill: 'black' },
		useMove = true,
		useResizeLeft = true,
		useResizeRight = true
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
	} = $props();
	//
	const cellHeightMergin = cellHeight * 0.1;

	// 状態管理
	let isSizeChanging: string = $state('');
	let dragOffsetX = $state(0);
	let startX = 0;
	let initialStart = 0;
	let initialEnd = 0;
	let bodyWidth = $derived((task.endCell - task.startCell) * cellWidth);

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
		const deltaCells = Math.round((deltaX / cellWidth) * 2) / 2;

		if (isSizeChanging === 'move') {
			dragOffsetX = deltaX;
		} else if (isSizeChanging === 'left') {
			const newStart = Math.min(initialEnd - 0.5, initialStart + deltaCells);
			onUpdate({ ...task, startCell: Math.max(0, newStart) });
		} else if (isSizeChanging === 'right') {
			const newEnd = Math.max(initialStart + 0.5, initialEnd + deltaCells);
			onUpdate({ ...task, endCell: newEnd });
		}
	}

	function onPointerUp() {
		const deltaCells = Math.round((dragOffsetX / cellWidth) * 2) / 2;

		if (isSizeChanging === 'move' && deltaCells !== 0) {
			console.log(
				'update',
				deltaCells,
				0,
				task.startCell + deltaCells,
				task.startCell + 0.5,
				task.endCell + deltaCells
			);
			const startCell = Math.max(0, task.startCell + deltaCells);
			onUpdate({
				...task,
				startCell,
				endCell: startCell + (task.endCell - task.startCell)
			});
		}

		dragOffsetX = 0;
		isSizeChanging = '';
	}
</script>

<g onpointermove={onPointerMove} onpointerup={onPointerUp} style="cursor: grab;">

	<rect
		x={task.startCell * cellWidth + dragOffsetX}
		y={index * cellHeight + cellHeightMergin}
		width={bodyWidth}
		height={cellHeight - cellHeightMergin * 2}
		rx="4"
		ry="4"
		class="fill-blue-500 hover:fill-blue-600"
		fill={style.fill}
		onpointerdown={useMove ? (e) => onPointerDown(e, 'move') : undefined}
	/>

	<text
		x={task.startCell * cellWidth + dragOffsetX + 5}
		y={index * cellHeight + cellHeight / 2 + 4}
		font-size="12"
		fill="white"
		onpointerdown={(e) => onPointerDown(e, 'move')}
	>
		{task.title}
	</text>

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
</g> -->

<script lang="ts">
	import type { GanttTask } from '$lib/types/task';
	import RowTemplate from './RowTemplate.svelte';

	const {
		task,
		index,
		cellWidth = 40,
		cellHeight = 30,
		onUpdate,
		style = { fill: 'blue' }
	}: {
		task: GanttTask;
		index: number;
		cellWidth?: number;
		cellHeight?: number;
		onUpdate: (task: GanttTask) => void;
		style?: Record<string, string>;
	} = $props();
</script>

<RowTemplate {task} {cellWidth} {cellHeight} {index} {onUpdate} {style} />
