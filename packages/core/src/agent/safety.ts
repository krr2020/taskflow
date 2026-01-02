import fs from "node:fs";
import path from "node:path";

/**
 * Ensures all file operations are contained within the project root
 */
export class Sandbox {
	constructor(private projectRoot: string) {}

	/**
	 * Validate that a path is safe (within project root)
	 * Returns the absolute path if safe, throws error if not
	 */
	validatePath(filePath: string): string {
		const resolved = path.resolve(this.projectRoot, filePath);
		if (!resolved.startsWith(this.projectRoot)) {
			throw new Error(
				`Access denied: Path ${filePath} is outside project root`,
			);
		}
		return resolved;
	}
}

/**
 * Manages file backups before modification
 */
export class BackupManager {
	private backupDir: string;

	constructor(private projectRoot: string) {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		this.backupDir = path.join(
			this.projectRoot,
			".taskflow",
			"backups",
			timestamp,
		);
	}

	/**
	 * Create a backup of a file if it exists
	 */
	backupFile(filePath: string): void {
		if (!fs.existsSync(filePath)) return;

		// Calculate relative path to preserve structure in backup
		const relPath = path.relative(this.projectRoot, filePath);
		const destPath = path.join(this.backupDir, relPath);
		const destDir = path.dirname(destPath);

		if (!fs.existsSync(destDir)) {
			fs.mkdirSync(destDir, { recursive: true });
		}

		fs.copyFileSync(filePath, destPath);
	}
}
