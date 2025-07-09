<script lang="ts">
	const {
		columns,
		cellWidth,
		cellHeight,
		headerHeight
	}: {
		columns: number;
		cellWidth: number;
		cellHeight: number;
		headerHeight: number;
	} = $props();

	const getGroupLabel = (col: number) =>
		Math.floor(col / 10)
			.toString()
			.padStart(2, '0');
	let heightStyle = $derived(
		`height:${headerHeight}px;max-height:${headerHeight}px;min-height:${headerHeight}px;`
	);
	let headerHeightStyle = $derived(
		`height:${headerHeight * 2}px;max-height:${headerHeight * 2}px;min-height:${headerHeight * 2}px;`
	);
</script>

<div class="sticky border-t border-r border-l" style={headerHeightStyle}>
	<!-- 上段ヘッダー（10の位） -->
	<div class="flex border-b" style={heightStyle}>
		{#each Array(columns) as _, col}
			{#if col % 10 === 0}
				<div
					class="border-r text-center text-sm font-bold"
					style="width: {10 * cellWidth}px; max-width: {10 * cellWidth}px;min-width: {10 *
						cellWidth}px; {heightStyle}"
				>
					{getGroupLabel(col)}
				</div>
			{/if}
		{/each}
	</div>

	<!-- 下段ヘッダー（マス番号） -->
	<div class="flex" style={heightStyle}>
		{#each Array(columns) as _, col}
			<div
				class="border-r border-gray-300 text-center text-xs"
				style="width: {cellWidth}px;min-width: {cellWidth}px;max-width: {cellWidth}px; {heightStyle}"
			>
				{col.toString().padStart(2, '0')}
			</div>
		{/each}
	</div>
</div>
