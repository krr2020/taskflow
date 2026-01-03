export function getStatusColor(status: string): string {
	switch (status) {
		case "completed":
			return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
		case "in-progress":
			return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
		case "blocked":
			return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
		case "on-hold":
			return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
		default:
			return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
	}
}

export function createSlug(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}
