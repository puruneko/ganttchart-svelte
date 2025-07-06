<script lang="ts">
	import GanttChart from '$lib/components/GanttChart.svelte';
	import type { GanttTask } from '$lib/types/task';
	//
	function randomInt(n: number, m: number): number {
		return Math.floor(Math.random() * (m - n + 1)) + n;
	}
	function uniqueRandomInts(n: number, m: number, x: number): number[] {
		const range = m - n + 1;
		if (x > range) {
			throw new Error('x must be less than or equal to the size of the range');
		}

		const result: number[] = [];
		const used = new Set<number>();

		while (result.length < x) {
			const rand = Math.floor(Math.random() * range) + n;
			if (!used.has(rand)) {
				used.add(rand);
				result.push(rand);
			}
		}

		return result;
	}
	//
	//
	//
	//
	//
	//
	const cellNumber = 100;
	const taskNumber = 1000;
	const summaryNumber = randomInt(10, 20);
	const summaryIds = uniqueRandomInts(0, taskNumber, summaryNumber);
	const tasks: GanttTask[] = Array.from({ length: taskNumber }).map((_, i) => {
		const rCellNumber = randomInt(0, cellNumber / 4);
		const rTaskNumber = randomInt(0, taskNumber);
		const s = randomInt(0, rCellNumber);
		const e = Math.min(s + rCellNumber, cellNumber - 1);
		return {
			taskId: `t${i}`,
			title: `Task ${i}`,
			startCell: s,
			endCell: e,
			parentTaskId: rTaskNumber < taskNumber * 0.99 ? `pp${rTaskNumber}` : '',
			taskType: 'task'
		};
	});
</script>

<GanttChart {tasks} {cellNumber} />
