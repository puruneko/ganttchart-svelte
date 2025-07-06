export type TaskType = 'task' | 'summary';

export interface GanttTask {
	taskId: string;
	parentTaskId: string | null;
	taskType: TaskType;

	title: string;
	startDate: Date;
	endDate: Date;

	isExpanded?: boolean;

	colorClass?: string;
	metadata?: Record<string, any>;
}
