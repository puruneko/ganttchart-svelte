<script lang="ts">
	import SummaryRow from '$lib/components/SummaryRow.svelte';
	import TaskRow from '$lib/components/TaskRow.svelte';
	import type { Task } from '$lib/types/task';
	import { toGanttTaskFromTask, toTaskFromGanttTask, type GanttTask } from '$lib/utils/ganttGrid';
	import { onMount, tick } from 'svelte';

	let { tasks, cellNumber }: { tasks: Task[]; cellNumber: number } = $props();

	// 描画する行数（動的に変更可）
	//
	let cellHeight = $state(20);
	let cellWidth = $state(20);
	let headerCellHeight = $state(20);
	let headerHeight = $derived(headerCellHeight * 2);
	//
	const lineColor = 'gray';

	//
	let WrapperElement: HTMLDivElement;
	let leftSVGEl: SVGSVGElement;
	let leftHeaderSVGElement: SVGSVGElement;
	//let contentGroupLeft: SVGGElement;
	let bodySVGEl: SVGSVGElement;

	//
	//gTasks
	//
	let dateUnit = $state(1000 * 60 * 60 * 1);
	let dateBase = $state(new Date(Date.now() - ($state.snapshot(dateUnit) * cellNumber) / 4));
	let dateUnitSubstep = $state(2);
	let dateHeaderLabel = $derived(
		[...Array(cellNumber + 1).keys()].map((i) => {
			return new Date(dateBase.getTime() + dateUnit * i);
		})
	);

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

	//
	//wrapper pos
	//
	let wrapperPos: {
		top?: number;
		left?: number;
	} = $state({});
	onMount(async () => {
		// レンダリング完了後にBBOXを取得
		await tick();
		const rect = WrapperElement.getBoundingClientRect();
		const pageX = rect.left + window.scrollX;
		const pageY = rect.top + window.scrollY;
		wrapperPos = {
			top: pageY,
			left: pageX
		};
		//

		onPointerMoveRendarLoop();
	});

	//
	//input
	//
	let InputElement: HTMLDivElement | null = $state(null);
	let inputText = $state('');
	let isEditing: any = $state(false);
	let inputStyle = $state({
		left: '0px',
		top: '0px',
		width: '0px',
		height: '0px',
		fontSize: '16px'
	});
	const handleClickSVGText = (evt: any) => {
		const text = evt.currentTarget as SVGTextElement;
		const bbox = text.getBBox();
		const ctm = text.getScreenCTM();

		console.log('handleClickSVGText', evt, text, bbox, ctm);

		if (!ctm) return;

		// SVG座標(左上)をスクリーン座標に変換
		const pt = leftSVGEl.createSVGPoint();
		pt.x = bbox.x;
		pt.y = bbox.y;
		const screenPt = pt.matrixTransform(ctm);

		inputText = text.textContent || '';
		inputStyle = {
			left: `${screenPt.x}px`,
			top: `${screenPt.y}px`,
			width: `${bbox.width}px`,
			height: `${bbox.height}px`,
			fontSize: text.getAttribute('font-size') || 'inherit'
		};
		isEditing = { row: text.dataset.row, col: text.dataset.col, elem: text };
		console.log('handleClickSVGText', isEditing);

		// 遅延してフォーカス（マウント後）
		setTimeout(() => {
			if (!InputElement || !isEditing.elem) {
				return;
			}
			isEditing.elem.style.setProperty('display', 'none');
			InputElement.focus();
			// 全選択
			const range = document.createRange();
			range.selectNodeContents(InputElement);
			const sel = window.getSelection();
			sel?.removeAllRanges();
			sel?.addRange(range);
		});
	};
	function commitEdit() {
		//
		inputText = '';
		if (isEditing.elem && isEditing.elem.style) {
			isEditing.elem.style.setProperty('display', '');
		}
		//
		const r = Number(isEditing.row);
		const c = Number(isEditing.col);
		const text = InputElement?.textContent || '';
		onTaskUpdate({
			...gTasks[r],
			[useCols[c]]: text //inputText;
		});
		//
		//
		isEditing = false;
	}

	//
	//col
	//
	let useCols = $state([
		'taskId',
		'title',
		'startCell',
		'endCell',
		'startDate',
		'endDate',
		'parentTaskId',
		'taskType'
	]);

	let columnWidths = $state(useCols.map((col, i) => 50));
	let columnLocsX = $derived(
		useCols.map((col, i) => {
			return columnWidths.slice(0, i).reduce((total, w) => total + w, 0);
		})
	);
	//
	let columnsWidth = $derived(
		columnLocsX[columnLocsX.length - 1] + columnWidths[columnWidths.length - 1] || 0
	);
	let svgHeight = $derived(cellHeight * (gTasks.length + 1));
	let bodyWidth = $derived(cellWidth * cellNumber);

	//
	//col resize
	//
	let colWidthResizeState: any = $state({
		index: -1,
		startX: -1,
		startWidth: -1,
		event: null
	});
	const onPointerDown = (event: PointerEvent, colIndex: number) => {
		colWidthResizeState = {
			index: colIndex,
			startX: event.clientX,
			startWidth: columnWidths[colIndex],
			event: null
		};
		console.log('onPointerDown', colWidthResizeState);

		if (!leftHeaderSVGElement) {
			return;
		}
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		leftHeaderSVGElement.style.userSelect = 'none';
	};
	const onPointerMove = (event: PointerEvent) => {
		console.log('onPointerMove', event);
		if (colWidthResizeState.index < 0) return;
		colWidthResizeState.event = event;
	};
	const onPointerMoveRendarLoop = () => {
		if (colWidthResizeState && colWidthResizeState.event) {
			const deltaX = colWidthResizeState.event.clientX - colWidthResizeState.startX;
			columnWidths[colWidthResizeState.index] = Math.max(
				50,
				colWidthResizeState.startWidth + deltaX
			);
		}
		requestAnimationFrame(onPointerMoveRendarLoop);
	};
	function onPointerUp() {
		console.log('onPointerUp', colWidthResizeState);
		colWidthResizeState = null;
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerUp);
		leftHeaderSVGElement.style.userSelect = '';
	}

	//
	//utils
	//
	const onTaskUpdate = (newTask: GanttTask) => {
		console.log('sticky2 onTaskUpdate', newTask);
		tasks = tasks.map((task: Task) =>
			task.taskId === newTask.taskId ? toTaskFromGanttTask(newTask, dateBase, dateUnit) : task
		);
	};
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

	//
	//debug
	//
	let debugVer = $state('0');
	console.log('sticky2:', columnWidths, columnLocsX, columnsWidth);
	//
	//
</script>

<div
	bind:this={WrapperElement}
	id="wrapper"
	style:position="relative"
	style:overflow="scroll"
	style:width="80vw"
	style:max-width="80vw"
	style:min-width="{columnsWidth}px"
	style:max-height="80vh"
>
	{#if wrapperPos.top !== undefined && wrapperPos.left !== undefined}
		<div
			bind:this={InputElement}
			contenteditable="true"
			role="textbox"
			aria-multiline="false"
			style:position="fixed"
			style:z-index="10"
			style:box-sizing="content-box"
			style:padding="0"
			style:margin="0"
			style:outline="none"
			style:white-space="nowrap"
			style:background="none"
			style:color="inherit"
			style:left={inputStyle.left}
			style:top={inputStyle.top}
			style:width={inputStyle.width}
			style:height={inputStyle.height}
			style:font-size={inputStyle.fontSize}
			style:display={isEditing ? undefined : 'none'}
			onblur={commitEdit}
			onkeydown={(e) => e.key === 'Enter' && commitEdit()}
		>
			{inputText}
		</div>

		<div
			id="contentHeader"
			style:position="sticky"
			style:top="0px"
			style:left="0px"
			style:z-index="6"
			style:height="{headerHeight}px"
			style:width="{bodyWidth}px"
		>
			<svg height="{headerHeight}px" width="{bodyWidth}px" xmlns="http://www.w3.org/2000/svg">
				<g transform={`translate(0, 0})`}>
					<rect x={0} y={0} width={cellWidth * cellNumber} height={headerHeight} fill="lightblue" />
					{#each dateHeaderLabel as dt, i_col}
						{#if dt.getHours() === 0}
							<text x={cellWidth * i_col + 1} y={0}>
								{dt.getDate()}
							</text>
						{/if}
						<text x={cellWidth * i_col + 1} y={headerCellHeight}>
							{dt.getHours()}
						</text>
					{/each}
				</g>
				<g id="contentHeaderGrid">
					{#each dateHeaderLabel as dt, i_col}
						<line
							x1={cellWidth * i_col}
							y1={dt.getHours() !== 0 ? headerCellHeight : 0}
							x2={cellWidth * i_col}
							y2={headerHeight}
							class="box-border"
							stroke="gray"
							stroke-width="0.25"
						/>
					{/each}
					{#each Array(2 + 1) as _, i_row}
						<line
							x1={0}
							y1={i_row * headerCellHeight}
							x2={bodyWidth}
							y2={i_row * headerCellHeight}
							class="box-border"
							stroke="gray"
							stroke-width="0.25"
						/>
					{/each}
				</g>
			</svg>
		</div>
		<div
			id="contentBody"
			style:z-index="2"
			style:height="{svgHeight}px"
			style:width="{bodyWidth}px"
		>
			<svg
				bind:this={bodySVGEl}
				height={svgHeight}
				width={bodyWidth}
				xmlns="http://www.w3.org/2000/svg"
			>
				<g id="contentBody">
					{#each gTasks as gTask, i_gtask}
						<!-- <text x="10" y={i_gtask * cellHeight}>{String(gTask.title).repeat(50)}</text> -->

						{#if gTask.taskType === 'summary'}
							<SummaryRow
								task={gTask}
								children={getChildrenOf(gTask.taskId)}
								{cellWidth}
								{cellHeight}
								index={i_gtask}
								onUpdate={onTaskUpdate}
								style={{ fill: 'green' }}
							/>
						{:else}
							<TaskRow
								task={gTask}
								{cellWidth}
								{cellHeight}
								index={i_gtask}
								onUpdate={onTaskUpdate}
								style={{ fill: 'blue' }}
							/>
						{/if}
					{/each}
				</g>
				<g id="contentBodyGrid">
					{#each gTasks as gTask, i_gtask}
						<line
							x1={0}
							y1={i_gtask * cellHeight}
							x2={bodyWidth}
							y2={i_gtask * cellHeight}
							class="box-border"
							stroke={lineColor}
							stroke-width="0.25"
						/>
					{/each}
					{#each Array(cellNumber + 1) as _, i_col}
						<line
							x1={cellWidth * i_col}
							y1={0}
							x2={cellWidth * i_col}
							y2={svgHeight}
							class="box-border"
							stroke={lineColor}
							stroke-width="0.25"
						/>
					{/each}
				</g>
			</svg>
		</div>
		<div
			id="leftBody"
			style:position="sticky"
			style:left="0px"
			style:top="0px"
			style:z-index="4"
			style:transform="translateY(-{svgHeight}px)"
			style:__margin-top="-{svgHeight}px"
			style:__height="{svgHeight}px"
			style:width="{columnsWidth}px"
		>
			<svg
				bind:this={leftSVGEl}
				height={svgHeight}
				width={columnsWidth}
				xmlns="http://www.w3.org/2000/svg"
			>
				{#each useCols as column, i_col}
					<g transform="translate({columnLocsX[i_col]}, 0)">
						{#each gTasks as gTask, i_gtask}
							<rect
								data-x={columnLocsX[i_col]}
								y={i_gtask * cellHeight}
								width={columnWidths[i_col]}
								height={cellHeight}
								fill="white"
							></rect>
							<text
								data-x={columnLocsX[i_col] + 10}
								y={i_gtask * cellHeight}
								data-row={i_gtask}
								data-col={i_col}
								onclick={handleClickSVGText}
							>
								{taskParamAccesser(gTask, column)}
							</text>
						{/each}
					</g>
					<g
						>{#each gTasks as gTask, i_gtask}
							<line
								x1={0}
								y1={i_gtask * cellHeight}
								x2={columnsWidth}
								y2={i_gtask * cellHeight}
								class="box-border"
								stroke={lineColor}
								stroke-width="0.25"
							/>
						{/each}
						<line
							x1={columnLocsX[i_col] + columnWidths[i_col]}
							y1={0}
							x2={columnLocsX[i_col] + columnWidths[i_col]}
							y2={svgHeight}
							class="box-border"
							stroke={lineColor}
							stroke-width="0.25"
						/>
					</g>
				{/each}
			</svg>
		</div>
		<div
			id="leftHeader"
			style:position="fixed"
			style:top="{wrapperPos.top}px"
			style:left="{wrapperPos.left}px"
			style:z-index="8"
			style:height="{headerHeight}px"
			style:width="{columnsWidth + bodyWidth}px"
		>
			<svg
				bind:this={leftHeaderSVGElement}
				height={headerHeight}
				width={columnsWidth + bodyWidth}
				xmlns="http://www.w3.org/2000/svg"
			>
				<g transform={`translate(0, 0)`}>
					{#each useCols as column, i_col}
						<rect
							x={columnLocsX[i_col]}
							y={0}
							width={columnWidths[i_col]}
							height={headerHeight}
							fill="skyblue"
						></rect>
						<text
							class="svg-textanchor-middle"
							x={columnLocsX[i_col] + columnWidths[i_col] / 2}
							y={headerHeight / 2}>{column}</text
						>

						<rect
							x={columnLocsX[i_col] + columnWidths[i_col] - 5}
							y={0}
							width={5}
							height={headerHeight}
							fill="rgba(0,0,0,0)"
							style="cursor: col-resize;"
							onpointerdown={(e) => onPointerDown(e, i_col)}
						></rect>
					{/each}
				</g>
			</svg>
		</div>
	{/if}
</div>

<style>
	svg text {
		/*y方向の基準変更*/
		dominant-baseline: text-before-edge; /*超大事！textの配置基準を左上に設定*/
		/*dominant-baseline: middle; /*文字の中心*/
		/*dominant-baseline: baseline; /*ベースライン（デフォルト）*/

		/*x方向の基準変更*/
		text-anchor: start; /*左揃え（デフォルト）*/
		/*text-anchor: middle; /*中央揃え*/
		/*text-anchor: end; /*右揃え*/
	}
	.svg-textanchor-middle {
		dominant-baseline: middle; /*文字の中心*/
		text-anchor: middle; /*中央揃え*/
	}
</style>
