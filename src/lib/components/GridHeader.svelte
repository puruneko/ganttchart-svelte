<script lang="ts">
	const { columns, cellWidth, cellHeight } = $props<{
		columns: number;
		cellWidth: number;
		cellHeight: number;
	}>();

	const getGroupLabel = (col: number) =>
		Math.floor(col / 10)
			.toString()
			.padStart(2, '0');
</script>

<div class="sticky top-0 z-10 bg-gray-100">
	<!-- 上段ヘッダー（10の位） -->
	<div class="box-border flex w-fit border-b">
		{#each Array(columns) as _, col}
			{#if col % 10 === 0}
				<div
					class="border-r border-gray-400 text-center text-sm font-bold"
					style={`width: ${10 * cellWidth}px; max-width: ${10 * cellWidth}px;min-width: ${10 * cellWidth}px;
							/*height: ${cellHeight}px; max-height: ${cellHeight}px;min-height: ${cellHeight}px;*/`}
				>
					{getGroupLabel(col)}
				</div>
			{/if}
		{/each}
	</div>

	<!-- 下段ヘッダー（マス番号） -->
	<div class="flex">
		{#each Array(columns) as _, col}
			<div
				class="border-r border-gray-300 text-center text-xs"
				style={`width: ${cellWidth}px;min-width: ${cellWidth}px;max-width: ${cellWidth}px;
						/*height: ${cellHeight}px; max-height: ${cellHeight}px;min-height: ${cellHeight}px;*/`}
			>
				{col.toString().padStart(2, '0')}
			</div>
		{/each}
	</div>
</div>
