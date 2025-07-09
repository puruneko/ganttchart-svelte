import type { Task, TaskType } from '$lib/types/task';

export type CellCoordinate = number;

export type GanttTask = {
	taskId: string; // 一意なID
	parentTaskId: string; // 親taskId（summary用）

	taskType: TaskType; // 'task' or 'summary'
	title: string; // 表示名
	startCell: CellCoordinate; // X軸 開始位置（将来的に Date へ）
	endCell: CellCoordinate; // X軸 終了位置

	// 表示やUI用スタイルを明示的に分離
	style?: {
		isExpanded?: boolean; // summary 展開状態
		colorClass?: string; // Tailwind CSSクラス
		height?: number; // 行高さカスタム（任意）
	};

	// 任意の拡張情報（非表示のメタデータ）
	extendedProps?: Record<string, any>;
};

export const toCellCoordinateFromDate = (
	date: Date,
	dateBase: Date,
	dateUnit: number,
	substep = 1
) => {
	const subunit = 1 / substep;
	const _p = (date.getTime() - dateBase.getTime()) / dateUnit;
	return Math.ceil(_p / subunit) * subunit;
};

export const toDateFromCellCoordinate = (
	coordinate: CellCoordinate,
	dateBase: Date,
	dateUnit: number
) => {
	return new Date(coordinate * dateUnit + dateBase.getTime());
};

export const toGanttTaskFromTask = (
	task: Task,
	dateBase: Date,
	dateUnit: number,
	substep?: number
) => {
	return {
		...task,
		startCell: toCellCoordinateFromDate(task.startDate, dateBase, dateUnit, substep),
		endCell: toCellCoordinateFromDate(task.endDate, dateBase, dateUnit, substep)
	};
};

export const toTaskFromGanttTask = (gTask: GanttTask, dateBase: Date, dateUnit: number): Task => {
	return {
		...gTask,
		startDate: toDateFromCellCoordinate(gTask.startCell, dateBase, dateUnit),
		endDate: toDateFromCellCoordinate(gTask.endCell, dateBase, dateUnit)
	};
};
