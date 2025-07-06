<script lang="ts">
	import type { GanttTask } from '$lib/types/task';

	const { tasks, className } = $props<{ tasks: GanttTask[]; className: string }>();
</script>

<ul class={`p-2 text-sm ${className ?? ''}`}>
	{#each tasks as task (task.taskId)}
		<li class="border-l py-1 pl-4">
			{task.title}
		</li>
	{/each}
</ul>
