import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
	plugins: [
		// Generate .d.ts files
		dts({
			entryRoot: "./src",
			outDir: "./dist",
			tsconfigPath: "./tsconfig.json",
			rollupTypes: true,
		}),
		// Copy templates and other assets
		viteStaticCopy({
			targets: [
				{
					src: "templates",
					dest: ".",
				},
			],
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "Taskflow",
			fileName: "index",
			formats: ["es"],
		},
		rollupOptions: {
			output: {
				// Preserve file structure for Node.js compatibility
				preserveModules: true,
				entryFileNames: "[name].js",
				chunkFileNames: "[name].js",
				assetFileNames: "[name].[ext]",
			},
			// Externalize all dependencies and Node.js builtins
			external: [
				// Node.js built-ins
				/^node:.*/,
				// Dependencies
				/@hono\/node-server/,
				/@inquirer\//,
				/chalk/,
				/commander/,
				/execa/,
				/hono/,
				/marked/,
				/marked-terminal/,
				/ora/,
				/picocolors/,
				/semver/,
				/zod/,
			],
		},
		target: "node18",
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: true,
		ssr: true, // Important for Node.js builds
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
		// Use 'node' condition for Node.js builds
		conditions: ["node"],
	},
});
