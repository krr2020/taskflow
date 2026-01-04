import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		// Generate .d.ts files
		dts({
			entryRoot: "./src",
			outDir: "./dist",
			tsconfigPath: "./tsconfig.json",
			rollupTypes: true,
		}),
	],
	build: {
		lib: {
			entry: "./src/index.ts",
			name: "TaskflowMCP",
			fileName: "index",
			formats: ["es"],
		},
		rollupOptions: {
			output: {
				preserveModules: true,
				entryFileNames: "[name].js",
				chunkFileNames: "[name].js",
				assetFileNames: "[name].[ext]",
			},
			// Externalize all dependencies
			external: ["@modelcontextprotocol/sdk", "@krr2020/taskflow", "zod"],
		},
		target: "node18",
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: true,
		ssr: true, // Important for Node.js builds
	},
	resolve: {
		// Use 'node' condition for Node.js builds
		conditions: ["node"],
	},
});
