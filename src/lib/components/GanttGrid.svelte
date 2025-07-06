<script lang="ts">
	const {
		numCols, // 列数
		numRows, // 行数
		cellWidth, // 1マスの横幅
		cellHeight, // 1マスの縦幅
		width,
		height
	} = $props<{
		numCols: number;
		numRows: number;
		cellWidth: number;
		cellHeight: number;
		width: number;
		height: number;
	}>();
</script>

<g {width} {height} class="__-translate-x-px pointer-events-none absolute top-0 left-0 w-full">
	<!-- 縦線 -->
	{#each Array(numCols + 1) as _, colIdx}
		<line
			x1={(colIdx + 1) * cellWidth}
			y1={0}
			x2={(colIdx + 1) * cellWidth}
			y2={numRows * cellHeight}
			stroke="currentColor"
			class="box-content stroke-gray-400 stroke-[0.05]"
			fill="none"
		/>
	{/each}

	<!-- 横線 -->
	{#each Array(numRows + 1) as _, rowIdx}
		<line
			x1={0}
			y1={rowIdx * cellHeight}
			x2={numCols * cellWidth}
			y2={rowIdx * cellHeight}
			class="box-border"
			stroke="lightgray"
			stroke-width="0.25"
		/>
	{/each}
</g>
