<script lang="ts">
	import { replaceState } from '$app/navigation';
	let contentHeight = $state(0);
</script>

<div id="parent">
	<div class="content">
		<!-- child4：先に配置して下に -->
		<div id="child4" class="box">
			{#each Array.from({ length: 100 }).map((_, i) => i) as i}
				<p>{'@@@@          @@@@'.repeat(10)}</p>
			{/each}
		</div>

		<!-- child1〜3：後に配置して上に -->
		<div id="child1" class="box">child1<br />← sticky-X</div>
		<div id="child2" class="box">child2<br />↑ sticky-Y</div>
		<div id="child3" class="box">child3<br />↖ sticky-XY</div>
	</div>
</div>

<!-- <script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	let svgEl: SVGSVGElement;
	let contentGroup: SVGGElement;
	let svgHeight = $state(0);

	// ヘッダーの高さ（固定）
	const headerHeight = 40;

	// 描画する行数（動的に変更可）
	let rows = Array.from({ length: 100 }, (_, i) => `Row ${i + 1}`);

	onMount(async () => {
		// レンダリング完了後にBBOXを取得
		await tick();
		const bbox = contentGroup.getBBox();
		svgHeight = headerHeight + bbox.height;
	});

	let scrollTop = $state(0);
	const handleScroll = (e: any) => {
		console.log(e);
		scrollTop = e.target.scrollTop;
	};
</script>

<div id="mergin" style="height:250px"></div>
<div class="wrapper" onscroll={handleScroll}>
	<svg bind:this={svgEl} height={svgHeight} width="100%" xmlns="http://www.w3.org/2000/svg">
		<g bind:this={contentGroup} transform={`translate(0, ${headerHeight})`}>
			{#each rows as row, i}
				<text x="10" y={(i + 1) * 20}>{row}</text>
			{/each}
		</g>

		<g transform={`translate(0, 0)`}>
			<rect x="0" y={scrollTop} width="100%" height={headerHeight} fill="lightgray" />
			<text x="10" y={scrollTop + 25}>固定ヘッダー</text>
		</g>
	</svg>
</div>

<script lang="ts">
	//
	const headerHeight = 50;
	//
	const sampleText = 'aabbccddeeffgghhiijjkk'.repeat(30);
	const rows = 100;
	//
	const cellHeight = 30;
</script>

<div style="height:300px;width:500px; overflow-y: auto;">
	<svg style="width:100%;height:auto">
		<g>
			{#each Array.from({ length: rows }).map((_, i) => i) as i}
				<rect
					x={10}
					y={cellHeight * i}
					width={100}
					height={cellHeight * 0.9}
					rx="4"
					ry="4"
					class="fill-blue-500 hover:fill-blue-600"
					fill={'blue'}
				>
				</rect>
			{/each}
		</g>
		<g class="fixedSvg"></g>
	</svg>
</div>

<div
	id="wrapper"
	style="background-color: gray; width:100%;height: 90vh; overflow-y: visible;overflow-x: scroll; display: flex;"
>
	<div
		id="leftPane"
		style="background-color: greenyellow; width:200px; position:static; left:0;z-index: 3;"
	>
		left
		{#each Array.from({ length: rows }).map((i) => i) as i}
			<p style="color:red">{i}{sampleText}</p>
		{/each}
	</div>
	<div id="x" style="overflow-y: scroll; display: flex;">
		<div
			id="chartHeader"
			style="background-color: skyblue; width: auto; height: {headerHeight}px;
        position:sticky ;top:0; z-index:2"
		>
			chartHeader {sampleText}
		</div>
		<div id="chartBody" style="background-color: lightblue; z-index: 1;">
			chartBody
			{#each Array.from({ length: rows }).map((i) => i) as i}
				<p>{i}{sampleText}</p>
			{/each}
		</div>
	</div>
</div>

<div class="relative h-full overflow-hidden">
	<div class="sticky top-0 z-10 flex">
		<div class="w-[250px] shrink-0 border-r bg-white px-2 py-1">
			tree header {sampleText}
		</div>
		<div class="flex-1 overflow-x-auto border-b bg-white">
			<div class="min-w-[2000px]">
				chartHeader {sampleText}
			</div>
		</div>
	</div>

	<div class="flex h-full overflow-y-auto">
		<div class="w-[250px] shrink-0 border-r">
			left
			{#each Array.from({ length: rows }).map((i) => i) as i}
				<p>{i}{sampleText}</p>
			{/each}
		</div>

		<div class="flex-1 overflow-x-auto">
			<div class="min-w-[2000px]">
				left
				{#each Array.from({ length: rows }).map((i) => i) as i}
					<p>{i}{sampleText}</p>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	html,
	body {
		margin: 0;
		padding: 0;
		height: 100%;
		overflow: hidden; /* スクロールはwrapperに集約 */
	}
	#wrapper {
		display: flex;
		height: 100%;
	}

	#chart {
		position: relative;
		height: 100%;
		overflow-y: scroll;
		flex: 1;
		display: flex;
	}

	#leftPane {
		width: 200px;
		background: #f4f4f4;
		position: sticky;
		left: 0;
		z-index: 2;
		flex-shrink: 0;
	}

	#main {
		flex: 1;
		overflow: auto;
		position: relative;
	}

	.header {
		position: sticky;
		top: 0;
		background: white;
		z-index: 1;
		border-bottom: 1px solid #ccc;
	}

	.header .row {
		display: flex;
		min-width: 1000px;
	}

	.cell {
		padding: 8px;
		border: 1px solid #ccc;
		min-width: 150px;
		box-sizing: border-box;
	}

	.row {
		display: flex;
		min-width: 1000px;
	}

	.content .row {
		height: 40px;
	}

	/* 長さを調整 */
	.content {
		height: 2000px;
	}
</style>

<style>
	.wrapper {
		height: 200px;
		overflow-y: auto;
		border: 1px solid #ccc;
	}

	svg {
		display: block;
		width: 100%;
	}

	text {
		font-family: sans-serif;
		font-size: 14px;
	}
</style> -->

<style>
	#parent {
		width: 500px;
		height: 100vh;
		overflow: auto;
		position: relative;
		border: 1px solid gray;
	}

	.content {
		width: 1000px;
		height: fit-content;
		position: relative;
	}

	.box {
		width: 120px;
		height: 60px;
		padding: 8px;
		font-weight: bold;
		color: white;
		text-align: center;
		line-height: 60px;
	}

	/* child4: 背景に表示 */
	#child4 {
		background: #c0392b;
		position: absolute;
		top: 0px;
		left: 0px;
		z-index: 0;
		width: 200%;
		height: fit-content;
		text-align: left;
	}

	/* child1～3: 前面に表示 */
	#child1 {
		background: #f39c12;
		position: sticky;
		left: 0;
		top: 100px;
		z-index: 2;
	}

	#child2 {
		background: #2980b9;
		position: sticky;
		top: 0;
		left: 200px;
		z-index: 2;
		width: 400px;
	}

	#child3 {
		background: #27ae60;
		position: sticky;
		top: 0;
		left: 0;
		z-index: 3;
	}
</style>
