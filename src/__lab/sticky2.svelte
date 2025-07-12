<script lang="ts">
	import { onMount, tick } from 'svelte';

	// 描画する行数（動的に変更可）
	//
	const headerHeight = 50;
	const cellHeight = 30;
	const cellWidth = 20;
	const cellNumber = 200;

	//
	let WrapperElement: HTMLDivElement;
	let leftSVGEl: SVGSVGElement;
	//let contentGroupLeft: SVGGElement;
	let bodySVGEl: SVGSVGElement;
	let contentGroupBody: SVGGElement;
	//
	let rowNumber = 100;
	let columns = $state(['columnA', 'columnB', 'columnC']);
	let rows = $state(
		Array.from({ length: rowNumber }, (_, i) => columns.map((col) => `R(${i + 1})_C(${col})`))
	);

	let columnWidths = $derived(columns.map((col, i) => 100 + i * 10));
	let columnLocsX = $derived(
		columns.map((col, i) => {
			return columnWidths.slice(0, i).reduce((total, w) => total + w, 0);
		})
	);
	//
	let columnsWidth = $derived(
		columnLocsX[columnLocsX.length - 1] + columnWidths[columnWidths.length - 1] || 0
	);
	let svgHeight = $state(headerHeight + cellHeight * (rowNumber + 1));
	let bodyWidth = $state(cellWidth * cellNumber);

	//
	let wrapperPos: any = $state(null);
	onMount(async () => {
		// レンダリング完了後にBBOXを取得
		await tick();
		// const bboxLeft = contentGroupLeft.getBBox();
		// leftSVGHeight = headerHeight + bboxLeft.height;
		// const bboxBody = contentGroupBody.getBBox();
		// bodySVGHeight = headerHeight + bboxBody.height;
		// bodySVGWidth = bboxBody.width;
		const rect = WrapperElement.getBoundingClientRect();
		const pageX = rect.left + window.scrollX;
		const pageY = rect.top + window.scrollY;
		wrapperPos = {
			top: pageY,
			left: pageX
		};
	});

	let scrollTop = $state(0);
	const handleScrollYWrapper = (e: any) => {
		console.log(e);
		scrollTop = e.target.scrollTop;
	};
	let contentScrollLeft = $state(0);
	const handleScrollXContent = (e: any) => {
		contentScrollLeft = e.target.scrollLeft;
	};
	let InputElement: HTMLDivElement | null = $state(null);
	let isDisplayInput = $state(false);
	let inputElementTop = $state('0');
	let inputElementLeft = $state('0');
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
		isEditing = { row: text.dataset.row, col: text.dataset.col };
		console.log('handleClickSVGText', isEditing);

		// 遅延してフォーカス（マウント後）
		setTimeout(() => {
			if (!InputElement) {
				return;
			}
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
		const r = Number(isEditing.row);
		const c = Number(isEditing.col);
		const text = InputElement?.textContent || '';
		rows[r][c] = text; //inputText;
		//
		isEditing = false;
		inputText = '';
	}
	console.log('sticky2:', columnWidths, columnLocsX, columnsWidth);
</script>

<div
	bind:this={WrapperElement}
	id="wrapper"
	style="position:relative; display: flex; overflow-y: scroll; overflow-x: hidden;width: 80vw; min-width: {columnsWidth}px; max-height: 80vh"
	onscroll={handleScrollYWrapper}
>
	{#if wrapperPos}
		<div
			bind:this={InputElement}
			contenteditable="true"
			role="textbox"
			aria-multiline="false"
			style="position: fixed;
    z-index: 10;
    box-sizing: content-box;
    padding: 0;
    margin: 0;
    outline: none;
    white-space: nowrap;
    background: none;
    color: inherit;
      left: {inputStyle.left};
      top: {inputStyle.top};
      width: {inputStyle.width};
      height: {inputStyle.height};
      font-size: {inputStyle.fontSize};
	  display: {isEditing ? undefined : 'none'}
    "
			onblur={commitEdit}
			onkeydown={(e) => e.key === 'Enter' && commitEdit()}
		>
			{inputText}
		</div>
		<svg
			height={headerHeight}
			width={columnsWidth + bodyWidth}
			style="position:fixed; top:{wrapperPos.top}px;left:{wrapperPos.left}px; max-width:100%"
		>
			<g id="leftHeader" transform={`translate(0, 0)`}>
				{#each columns as column, i_col}
					<rect
						x={columnLocsX[i_col]}
						y={0}
						width={columnWidths[i_col]}
						height={headerHeight}
						fill="lightgray"
					></rect>
					<text x={columnLocsX[i_col] + 10} y={cellHeight}>{column}</text>
				{/each}
			</g>
			<!-- <g transform={`translate(0, 0)`}>
				<rect
					x={columnsWidth}
					y={0}
					width={cellWidth * cellNumber}
					height={headerHeight}
					fill="lightgray"
				/>
				<text x={columnsWidth + 10} y={cellHeight}
					>固定ヘッダーContent {Array.from({ length: cellNumber })
						.map((_, i) => i)
						.join('_')}</text
				>
			</g> -->
		</svg>
		<div id="leftPane" style="width:330; flex-shrink:0; flex-grow: 0;">
			<svg
				bind:this={leftSVGEl}
				height={svgHeight}
				width={columnsWidth}
				xmlns="http://www.w3.org/2000/svg"
			>
				{#each columns as column, i_col}
					<g transform={`translate(0, ${headerHeight})`}>
						{#each rows as row, i_row}
							<rect
								x={columnLocsX[i_col]}
								y={(i_row + 1) * cellHeight}
								width={columnWidths[i_col]}
								height={cellHeight}
								fill="white"
							></rect>
							<text
								x={columnLocsX[i_col] + 10}
								y={(i_row + 1) * cellHeight}
								data-row={i_row}
								data-col={i_col}
								onclick={handleClickSVGText}>{row[i_col]}</text
							>
						{/each}
					</g>
				{/each}

				<!-- <g transform={`translate(0, 0)`}>
					{#each columns as column, i_col}
						<rect
							x={columnLocsX[i_col]}
							y={scrollTop}
							width={columnWidths[i_col]}
							height={headerHeight}
							fill="lightgray"
						></rect>
						<text x={columnLocsX[i_col] + 10} y={scrollTop + cellHeight}>{column}</text>
					{/each}
				</g> -->
			</svg>
		</div>
		<div
			id="content"
			style="overflow-x: scroll; height:fit-content; width:fit-content;"
			onscroll={handleScrollXContent}
		>
			<svg
				bind:this={bodySVGEl}
				height={svgHeight}
				width={bodyWidth}
				xmlns="http://www.w3.org/2000/svg"
			>
				<g bind:this={contentGroupBody} transform={`translate(0, ${headerHeight})`}>
					{#each rows as row, i}
						<text x="10" y={(i + 1) * cellHeight}>{String(row[0]).repeat(50)}</text>
					{/each}
				</g>

				<!-- <g transform={`translate(0, 0)`}>
					<rect x="0" y={scrollTop} width="100%" height={headerHeight} fill="lightgray" />
					<text x="10" y={scrollTop + cellHeight}
						>固定ヘッダーContent {Array.from({ length: cellNumber })
							.map((_, i) => i)
							.join('_')}</text
					>
				</g> -->
			</svg>
			<svg
				height={headerHeight}
				width={columnsWidth + bodyWidth}
				style="position:absolute; top:{wrapperPos.top}px;left:{wrapperPos.left}px; max-width:100%"
			>
				<g id="contentHeader" transform={`translate(0, 0)`}>
					<rect
						x={columnsWidth}
						y={0}
						width={cellWidth * cellNumber}
						height={headerHeight}
						fill="lightgray"
					/>
					<text x={columnsWidth + 10} y={cellHeight}
						>固定ヘッダーContent {Array.from({ length: cellNumber })
							.map((_, i) => i)
							.join('_')}</text
					>
				</g>
			</svg>
		</div>
	{/if}
</div>
