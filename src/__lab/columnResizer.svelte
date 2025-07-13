<script lang="ts">
	export type T_ResizeState = null | {
		startBBox: DOMRect;
		width: number;
	};

	let resizeState: T_ResizeState = $state(null);

	const onPointerDown = (event: PointerEvent) => {
		if (!targetElem) {
			return;
		}

		const bbox: DOMRect = targetElem.getBBox();
		resizeState = {
			startBBox: bbox,
			width: bbox.width
		};
		if (onStart) {
			onStart(event, resizeState);
		}
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		targetElem.style.userSelect = 'none';
	};

	const onPointerMove = (event: PointerEvent) => {
		if (!resizeState) return;
		const deltaX = event.clientX - resizeState.startBBox.x;
		resizeState.width = Math.max(50, resizeState.startBBox.width + deltaX);
		if (onMoving) {
			onMoving(event, resizeState);
			return;
		}
	};

	function onPointerUp(event: PointerEvent) {
		if (onEnd) {
			onEnd(event, resizeState);
		}
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerUp);
		resizeState = null;
		targetElem.style.userSelect = '';
	}

	const defaultProps = {
		fill: 'rgba(0,0,0,0)',
		style: 'cursor: col-resize'
	};

	let {
		targetElem,
		x,
		y,
		width,
		height,
		onStart,
		onMoving,
		onEnd,
		props = defaultProps
	}: {
		targetElem: any;
		x: number;
		y: number;
		width: number;
		height: number;
		onStart?: (event: PointerEvent, resizeState: T_ResizeState) => void;
		onMoving?: (event: PointerEvent, resizeState: T_ResizeState) => void;
		onEnd?: (event: PointerEvent, resizeState: T_ResizeState) => void;
		props?: Record<string, string>;
	} = $props();
</script>

<rect
	{x}
	{y}
	{width}
	{height}
	fill="rgba(0,0,0,0)"
	style="cursor: col-resize;"
	onpointerdown={onPointerDown}
	{...props}
></rect>
