<script lang="ts">
	import { onMount, tick } from 'svelte';

	// 描画する行数（動的に変更可）
	//
	const cellHeight = 30;
	const cellWidth = 30;
	const cellNumber = 200;
	const headerCellHeight = 20;
	const headerHeight = headerCellHeight * 2;

	//
	let WrapperElement: HTMLDivElement;
	let leftSVGEl: SVGSVGElement;
	let leftHeaderSVGElement: SVGSVGElement;
	//let contentGroupLeft: SVGGElement;
	let bodySVGEl: SVGSVGElement;
	let contentGroupBody: SVGGElement;
	//
	let rowNumber = 100;
	let columns = $state(['columnA', 'columnB', 'columnC']);
	let rows = $state(
		Array.from({ length: rowNumber }, (_, i) => columns.map((col) => `R(${i + 1})_C(${col})`))
	);

	let columnWidths = $state(columns.map((col, i) => 100 + i * 10));
	let columnLocsX = $derived(
		columns.map((col, i) => {
			return columnWidths.slice(0, i).reduce((total, w) => total + w, 0);
		})
	);
	//
	let columnsWidth = $derived(
		columnLocsX[columnLocsX.length - 1] + columnWidths[columnWidths.length - 1] || 0
	);
	let svgHeight = $state(cellHeight * (rowNumber + 1));
	let bodyWidth = $state(cellWidth * cellNumber);

	//
	let wrapperPos: any = $state({
		top: 0,
		left: 0
	});
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
	});

	let scrollTop = $state(0);
	const handleScrollYWrapper = (e: any) => {
		console.log(e);
		scrollTop = e.target.scrollTop;
	};
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
			isEditing.elem.style.display = 'none';
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
		isEditing.elem.style.display = '';
		//
		const r = Number(isEditing.row);
		const c = Number(isEditing.col);
		const text = InputElement?.textContent || '';
		rows[r][c] = text; //inputText;
		//
		//
		isEditing = false;
		inputText = '';
	}
	//
	//
	let colWidthResizeState: any = $state({
		index: -1,
		startX: -1,
		startWidth: -1
	});
	const onPointerDown = (event: PointerEvent, colIndex: number) => {
		colWidthResizeState = {
			index: colIndex,
			startX: event.clientX,
			startWidth: columnWidths[colIndex]
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
		const deltaX = event.clientX - colWidthResizeState.startX;
		columnWidths[colWidthResizeState.index] = Math.max(50, colWidthResizeState.startWidth + deltaX);
	};

	function onPointerUp() {
		console.log('onPointerUp', colWidthResizeState);
		colWidthResizeState = null;
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerUp);
		leftHeaderSVGElement.style.userSelect = '';
	}
	//
	//
	console.log('sticky2:', columnWidths, columnLocsX, columnsWidth);
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
	onscroll={handleScrollYWrapper}
>
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
				{#each Array(cellNumber + 1) as _, i_col}
					{#if i_col % 10 === 0}
						<text x={cellWidth * i_col + 1} y={0}>
							{i_col}
						</text>
					{/if}
					<text x={cellWidth * i_col + 1} y={headerCellHeight}>
						{i_col}
					</text>
					<line
						x1={cellWidth * i_col}
						y1={i_col % 10 ? headerCellHeight : 0}
						x2={cellWidth * i_col}
						y2={headerHeight}
						class="box-border"
						stroke="lightgray"
						stroke-width="0.25"
					/>
				{/each}
			</g>
			<g id="contentHeaderGrid">
				{#each Array(cellNumber + 1) as _, i_col}
					<line
						x1={cellWidth * i_col}
						y1={i_col % 10 ? headerCellHeight : 0}
						x2={cellWidth * i_col}
						y2={headerHeight}
						class="box-border"
						stroke="lightgray"
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
						stroke="lightgray"
						stroke-width="0.25"
					/>
				{/each}
			</g>
		</svg>
	</div>
	<div id="contentBody" style:z-index="2" style:height="{svgHeight}px" style:width="{bodyWidth}px">
		<svg
			bind:this={bodySVGEl}
			height={svgHeight}
			width={bodyWidth}
			xmlns="http://www.w3.org/2000/svg"
		>
			<g bind:this={contentGroupBody} transform={`translate(0, 0)`}>
				{#each rows as row, i_row}
					<text x="10" y={i_row * cellHeight}>{String(row[0]).repeat(50)}</text>
				{/each}
			</g>
			<g id="contentBodyGrid">
				{#each rows as row, i_row}
					<text x="10" y={i_row * cellHeight}>{String(row[0]).repeat(50)}</text>
					<line
						x1={0}
						y1={i_row * cellHeight}
						x2={bodyWidth}
						y2={i_row * cellHeight}
						class="box-border"
						stroke="lightgray"
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
						stroke="lightgray"
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
			{#each columns as column, i_col}
				<g transform={`translate(0, 0)`}>
					{#each rows as row, i_row}
						<rect
							x={columnLocsX[i_col]}
							y={i_row * cellHeight}
							width={columnWidths[i_col]}
							height={cellHeight}
							fill="white"
						></rect>
						<text
							x={columnLocsX[i_col] + 10}
							y={i_row * cellHeight}
							data-row={i_row}
							data-col={i_col}
							onclick={handleClickSVGText}
						>
							{row[i_col]}
						</text>
						<line
							x1={0}
							y1={i_row * cellHeight}
							x2={columnsWidth}
							y2={i_row * cellHeight}
							class="box-border"
							stroke="lightgray"
							stroke-width="0.25"
						/>
					{/each}
					<line
						x1={columnLocsX[i_col] + columnWidths[i_col]}
						y1={0}
						x2={columnLocsX[i_col] + columnWidths[i_col]}
						y2={svgHeight}
						class="box-border"
						stroke="lightgray"
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
				{#each columns as column, i_col}
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
