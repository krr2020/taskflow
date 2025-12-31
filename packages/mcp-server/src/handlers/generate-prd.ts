import { z } from "zod";
import path from "node:path";
import fs from "node:fs";
import { getResource } from "../utils/resource.js";

export const generatePrdHandler = async (args: any) => {
    const schema = z.object({
        step: z.enum(["requirements_gathering", "generated_template", "save"]),
        featureName: z.string().optional(),
        content: z.string().optional(),
    });
    const { step, featureName, content } = schema.parse(args);

    if (step === "requirements_gathering") {
        return {
            content: [{ type: "text", text: getResource("prd-requirements.md") }],
        };
    }

    if (step === "generated_template") {
        return {
            content: [{ type: "text", text: getResource("prd-template.md") }],
        };
    }

    if (step === "save") {
        if (!featureName || !content) {
            throw new Error("featureName and content are required for 'save' step.");
        }
        const tasksDir = path.join(process.cwd(), "tasks");
        if (!fs.existsSync(tasksDir)) {
            fs.mkdirSync(tasksDir, { recursive: true });
        }
        const prdPath = path.join(tasksDir, `prd-${featureName}.md`);
        fs.writeFileSync(prdPath, content);

        return {
            content: [{ type: "text", text: `PRD saved to ${prdPath}` }],
        };
    }

    return { content: [] };
};
