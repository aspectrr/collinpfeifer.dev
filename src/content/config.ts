import { defineCollection, z } from "astro:content";

const blog = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		author: z.string().optional(),
		authorImage: z.string().optional(),
		authorEmail: z.string().optional(),
		authorPhone: z.string().optional(),
		draft: z.boolean().default(false).optional(),
		series: z.string().optional(),
		partNumber: z.number().optional(),
		partTitle: z.string().optional(),
	}),
});

const codingSessions = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		pubDate: z.coerce.date(),
		description: z.string(),
		model: z.string().optional(),
		cost: z.string().optional(),
		tokens: z.string().optional(),
		draft: z.boolean().default(false).optional(),
	}),
});

export const collections = { blog, "coding-sessions": codingSessions };
