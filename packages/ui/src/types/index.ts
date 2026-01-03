export interface Task {
	id: string;
	title: string;
	status: string;
	dependencies: string[];
	description?: string;
	skill?: string;
	estimatedHours?: number;
	context?: string[];
	subtasks?: Array<{ id: string; description: string; status: string }>;
	acceptanceCriteria?: string[];
}

export interface Story {
	id: string;
	title: string;
	status: string;
	description?: string;
	tasks: Task[];
}

export interface Feature {
	id: string;
	title: string;
	status: string;
	description?: string;
	stories: Story[];
}

export interface ProjectData {
	project: {
		name: string;
		description: string;
	};
	features: Feature[];
}
