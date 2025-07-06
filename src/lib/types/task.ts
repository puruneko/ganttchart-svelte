export type TaskType = 'task' | 'summary';

export interface GanttTask {
	taskId: string; // 一意なID
	parentTaskId: string; // 親taskId（summary用）

	taskType: TaskType; // 'task' or 'summary'
	title: string; // 表示名
	startCell: number; // X軸 開始位置（将来的に Date へ）
	endCell: number; // X軸 終了位置

	// 表示やUI用スタイルを明示的に分離
	style?: {
		isExpanded?: boolean; // summary 展開状態
		colorClass?: string; // Tailwind CSSクラス
		height?: number; // 行高さカスタム（任意）
	};

	// 任意の拡張情報（非表示のメタデータ）
	extendedProps?: Record<string, any>;
}
