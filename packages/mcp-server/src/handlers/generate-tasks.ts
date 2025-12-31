import { z } from "zod";
import path from "node:path";
import fs from "node:fs";
import { getResource } from "../utils/resource.js";

export const generateTasksHandler = async (args: any) => {
    const schema = z.object({
        step: z.enum(["planning_rules", "save"]),
        prdFileName: z.string().optional(),
        tasksJSON: z.any().optional(),
    });
    const { step, prdFileName, tasksJSON } = schema.parse(args);
    const tasksDir = path.join(process.cwd(), "tasks");

    if (step === "planning_rules") {
        if (!fs.existsSync(tasksDir)) {
            return {
                content: [{ type: "text", text: "No 'tasks' directory found. Please generate a PRD first using 'generate_prd'." }]
            };
        }

        // If user didn't specify a PRD, list available ones or error
        if (!prdFileName) {
            const files = fs.readdirSync(tasksDir).filter(f => f.startsWith("prd-") && f.endsWith(".md"));
            if (files.length === 0) {
                return { content: [{ type: "text", text: "No PRD files found in 'tasks/'. Please create one first." }] };
            }
            return {
                content: [{ type: "text", text: `Found PRDs: ${files.join(", ")}. Please specify 'prdFileName' to proceed.` }]
            };
        }

        const prdPath = path.join(tasksDir, prdFileName);
        if (!fs.existsSync(prdPath)) {
            return { content: [{ type: "text", text: `PRD file not found: ${prdPath}` }] };
        }

        const prdContent = fs.readFileSync(prdPath, "utf-8");
        const rules = getResource("task-generation.md");

        return {
            content: [{
                type: "text",
                text: `CONTEXT (PRD):\n${prdContent}\n\nRULES:\n${rules}\n\nINSTRUCTION: Please generate the JSON structure based on the PRD and Rules.`
            }]
        };
    }

    if (step === "save") {
        if (!tasksJSON) {
            throw new Error("tasksJSON is required for 'save' step.");
        }

        // 1. Ensure tasks dir
        if (!fs.existsSync(tasksDir)) {
            fs.mkdirSync(tasksDir, { recursive: true });
        }

        // 2. Update Project Index
        const featureId = tasksJSON.id;
        const featureTitle = tasksJSON.title;
        const featureName = (featureTitle || "feature").toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const projectIndexPath = path.join(tasksDir, "project-index.json");
        let projectIndex = { project: "My Project", features: [] };
        if (fs.existsSync(projectIndexPath)) {
            projectIndex = JSON.parse(fs.readFileSync(projectIndexPath, "utf-8"));
        }
        // Add feature if not exists
        const existingFeature = projectIndex.features.find((f: any) => f.id === featureId);
        if (!existingFeature) {
            projectIndex.features.push({
                id: featureId,
                title: featureTitle,
                status: "not-started",
                path: `F${featureId}-${featureName}`
            } as never);
            fs.writeFileSync(projectIndexPath, JSON.stringify(projectIndex, null, 2));
        }

        // 3. Create Feature Folder
        const featureDir = path.join(tasksDir, `F${featureId}-${featureName}`);
        if (!fs.existsSync(featureDir)) {
            fs.mkdirSync(featureDir, { recursive: true });
        }

        // 4. Write Feature JSON
        const featureJsonPath = path.join(featureDir, `F${featureId}-${featureName}.json`);
        fs.writeFileSync(featureJsonPath, JSON.stringify(tasksJSON, null, 2));

        // 5. Create Stories and Tasks
        const filesCreated: string[] = [];
        if (tasksJSON.stories && Array.isArray(tasksJSON.stories)) {
            for (const story of tasksJSON.stories) {
                const storyDirName = `S${story.id}-${(story.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
                const storyDir = path.join(featureDir, storyDirName);
                if (!fs.existsSync(storyDir)) {
                    fs.mkdirSync(storyDir, { recursive: true });
                }

                if (story.tasks && Array.isArray(story.tasks)) {
                    for (const task of story.tasks) {
                        const taskFileName = `T${task.id}-${(task.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
                        const taskPath = path.join(storyDir, taskFileName);
                        fs.writeFileSync(taskPath, JSON.stringify(task, null, 2));
                        filesCreated.push(path.relative(process.cwd(), taskPath));
                    }
                }
            }
        }

        return {
            content: [{ type: "text", text: `Success! Created task files:\n- ${filesCreated.join("\n- ")}` }]
        };
    }

    return { content: [] };
};
