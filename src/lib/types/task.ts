export type TaskType = 'task' | 'summary';

export interface Task {
	taskId: string; // 一意なID
	parentTaskId: string; // 親taskId（summary用）

	taskType: TaskType; // 'task' or 'summary'
	title: string; // 表示名
	startDate: Date;
	endDate: Date;

	// 表示やUI用スタイルを明示的に分離
	style?: {
		isExpanded?: boolean; // summary 展開状態
		colorClass?: string; // Tailwind CSSクラス
		height?: number; // 行高さカスタム（任意）
	};

	// 任意の拡張情報（非表示のメタデータ）
	extendedProps?: Record<string, any>;
}
