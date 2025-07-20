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
	//
	const lineColor = 'gray';

	//
	let WrapperElement: HTMLDivElement;
	let leftSVGEl: SVGSVGElement;
	let leftHeaderSVGElement: SVGSVGElement;
	//let contentGroupLeft: SVGGElement;
	let bodySVGEl: SVGSVGElement;

	//
	//scale
	//
	const getDateParam = (d: Date, name: string) => {
		if (name === 'minute') {
			return d.getMinutes();
		} else if (name === 'hour') {
			return d.getHours();
		} else if (name === 'date') {
			return d.getDate();
		} else if (name === 'week') {
			const one = new Date(d.getFullYear(), 1, 1);
			const days = Math.floor((d.getTime() - one.getTime()) / (1000 * 60 * 60 * 24));
			const weekOffset = 7 - one.getDay() + 1;
			const weekNumber = Math.floor((days - weekOffset) / 7) + 2;
			return weekNumber;
		} else if (name === 'month') {
			return d.getMonth();
		} else if (name === 'quater') {
			return ((Math.floor((d.getMonth() - 1) / 3) + 5) % 5) + 1;
		} else if (name === 'year') {
			return d.getFullYear();
		}
	};
	const hourMilliseconds = 1000 * 60 * 60;
	type T_DateScale = {
		name: string;
		unit: number;
		unitSubstep: number;
		format: (dt: Date) => any;
		extraScales?: {
			name: string;
			unit: number;
			format: (dt: Date) => any;
			isUpdate: (baseDt: Date) => boolean;
		}[];
	};
	let dateScaleSettings: T_DateScale[] = $state([
		{
			name: 'hour',
			unit: hourMilliseconds / 4, //15min
			unitSubstep: 2,
			format: (dt: Date) => dt.getMinutes(),
			extraScales: [
				{
					name: 'date',
					unit: hourMilliseconds * 24 * 1,
					format: (dt: Date) => `${dt.getDate()}日`,
					isUpdate: (dt: Date) => dt.getHours() === 0
				},
				{
					name: 'hour',
					unit: hourMilliseconds * 1,
					format: (dt: Date) => `${dt.getHours()}時`,
					isUpdate: (dt: Date) => dt.getMinutes() === 0
				}
			]
		},
		{
			name: 'date',
			unit: hourMilliseconds * 1, //60min
			unitSubstep: 2,
			format: (dt: Date) => dt.getHours(),
			extraScales: [
				{
					name: 'date',
					unit: hourMilliseconds * 24 * 1,
					format: (dt: Date) => `${dt.getDate()}日`,
					isUpdate: (dt: Date) => dt.getHours() === 0
				}
			]
		}
	]);
	let dateScaleName: string = $state('date');
	let dateScale: T_DateScale = $derived(
		(dateScaleSettings.filter((s) => s.name === dateScaleName) || [dateScaleSettings[0]])[0]
	);
	let dateBase = $derived.by(() => {
		const t = Date.now() - (dateScale.unit * cellNumber) / 4;
		return new Date(Math.ceil(t / dateScale.unit) * dateScale.unit);
	});
	let dateHeaderLabels: { text: string; start: number; end: number }[][] = $derived([
		//extra
		...(dateScale.extraScales || []).map((eScale) => {
			//head offset
			let i_offset = 0;
			while (
				!eScale.isUpdate(new Date(dateBase.getTime() + dateScale.unit * i_offset)) &&
				i_offset < cellNumber
			) {
				i_offset += 1;
			}
			const unit_offset = dateScale.unit * i_offset;
			const ratio = eScale.unit / dateScale.unit;
			const scaleNums = Math.ceil(cellNumber / ratio + 0.5);
			const head =
				i_offset !== 0
					? [
							{
								text: eScale.format(new Date(dateBase.getTime())),
								start: 0,
								end: i_offset
							}
						]
					: [];
			//
			const main = [...Array(scaleNums)].map((_, i) => {
				const end = ratio * (i + 1) + i_offset;
				return {
					text: eScale.format(new Date(dateBase.getTime() + eScale.unit * i + unit_offset)),
					start: ratio * i + i_offset,
					end: Math.min(end, cellNumber)
				};
			});
			return [...head, ...main];
		}),
		//base
		[...Array(cellNumber + 1)].map((_, i_col) => {
			return {
				text: dateScale.format(new Date(dateBase.getTime() + dateScale.unit * i_col)),
				start: i_col,
				end: i_col + 1
			};
		})
	]);
	let headerCellHeight = $state(20);
	let headerHeight = $derived(headerCellHeight * dateHeaderLabels.length);

	//
	//gTasks
	//
	let gTasks: GanttTask[] = $derived.by(() => {
		const parentTaskIds = new Set(tasks.map((task) => task.parentTaskId));
		return Array.from(parentTaskIds)
			.sort()
			.map((parentTaskId) => {
				const children = tasks
					.filter((task) => task.parentTaskId === parentTaskId)
					.map((task) =>
						toGanttTaskFromTask(task, dateBase, dateScale.unit, dateScale.unitSubstep)
					);
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

		console.log('dd', dateHeaderLabels);
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
			task.taskId === newTask.taskId ? toTaskFromGanttTask(newTask, dateBase, dateScale.unit) : task
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
					{#each dateHeaderLabels as dateHeaderLabel, i_headerLevel}
						{#each dateHeaderLabel as label, i_col}
							<text x={cellWidth * label.start + 1} y={cellHeight * i_headerLevel}>
								{label.text}
							</text>
							<line
								x1={cellWidth * label.start}
								y1={cellHeight * i_headerLevel}
								x2={cellWidth * label.start}
								y2={cellHeight * (i_headerLevel + 1)}
								class="box-border"
								stroke="gray"
								stroke-width="0.25"
							/>
						{/each}
					{/each}
				</g>
				<g id="contentHeaderGrid">
					{#each Array(dateHeaderLabels.length + 1) as _, i_row}
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
