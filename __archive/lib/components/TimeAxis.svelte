<!--
<script lang="ts">
	import { scaleTime } from 'd3-scale';
	import { axisTop } from 'd3-axis';
	import { select } from 'd3-selection';
	import { timeFormat } from 'd3-time-format';
	import { getViewRangeForMode, type ViewMode } from '$lib/utils/timeView';

	const {
		timeScale,
		viewMode,
		width = 1000,
		height = 30
	} = $props<{
		timeScale: (d: Date) => number;
		viewMode: ViewMode;
		width?: number;
		height?: number;
	}>();

	let svgElement: SVGSVGElement;
	let gWrapperElement: SVGGElement;

	const now = new Date();
	now.setDate(-20);
	const { tickFormat, tickInterval } = getViewRangeForMode(viewMode, now);

	const tickSizeInner = 6;
	const tickPadding = 5;
	let translateY = $state(tickSizeInner + tickPadding + 1);

	const axis = axisTop(timeScale)
		.ticks(10)
		.tickSizeOuter(0)
		.tickSizeInner(tickSizeInner)
		.tickPadding(tickPadding) // ← paddingで下げる
		.tickFormat((d) => tickFormat(d instanceof Date ? d : new Date(d as number)));

	$effect(() => {
		if (gWrapperElement) {
			select(gWrapperElement).selectAll('*').remove(); // 再描画前にクリア
			select(gWrapperElement).call<[]>(axis);
			// 高さ調整（ラベル）
			const texts = gWrapperElement.querySelectorAll('.tick text');
			let maxH = 0;
			texts.forEach((t) => {
				if (t instanceof SVGTextElement) {
					const b = t.getBBox();
					if (b.height > maxH) maxH = b.height;
				}
			});
			translateY = maxH + 6;
		}
	});

	function endOfDay(date: Date): Date {
		const d = new Date(date);
		d.setHours(23, 59, 59, 999);
		return d;
	}
</script>

<svg
	bind:this={svgElement}
	{width}
	{height}
	class="border border-blue-500 bg-white fill-none stroke-black [&_text]:fill-black"
	style="overflow:visible"
>
	<g bind:this={gWrapperElement} transform={`translate(0, ${translateY})`}></g>
</svg>

-->
<script lang="ts">
	import { axisTop } from 'd3-axis';
	import { select } from 'd3-selection';
	import { getViewRangeForMode, type ViewMode } from '$lib/utils/timeView';
	import type { ScaleTime } from 'd3-scale';

	const {
		timeScale,
		viewMode = 'week',
		width = 1000,
		height = 60
	} = $props<{
		timeScale: ScaleTime<Date, number>;
		viewMode?: ViewMode;
		width?: number;
		height?: number;
	}>();

	let svgElement: SVGSVGElement;
	let upperGroup: SVGGElement;
	let lowerGroup: SVGGElement;

	$effect(() => {
		const { upper, lower } = getViewRangeForMode(viewMode);

		// 上段
		if (upperGroup) {
			const upperAxis = axisTop(timeScale)
				.tickValues(upper.tickInterval)
				.tickFormat((d) => upper.tickFormat(d as Date))
				.tickSizeOuter(0)
				.tickPadding(8);
			select(upperGroup).selectAll('*').remove();
			select(upperGroup).call(upperAxis);
		}

		// 下段（空配列なら非表示にしても良い）
		if (lowerGroup) {
			if (lower.tickInterval.length === 0) {
				select(lowerGroup).selectAll('*').remove();
			} else {
				const lowerAxis = axisTop(timeScale)
					.tickValues(lower.tickInterval)
					.tickFormat((d) => lower.tickFormat(d as Date))
					.tickSizeOuter(0)
					.tickPadding(8);
				select(lowerGroup).selectAll('*').remove();
				select(lowerGroup).call(lowerAxis);
			}
		}
	});
</script>

<svg {width} {height} class="border-b border-gray-300 bg-white text-sm" bind:this={svgElement}>
	<g bind:this={upperGroup} transform="translate(0, 20)" />
	{#if getViewRangeForMode(viewMode).lower.tickInterval.length > 0}
		<g bind:this={lowerGroup} transform="translate(0, 40)" />
	{/if}
</svg>
