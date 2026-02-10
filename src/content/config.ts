import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    author: z.string().optional(),
    authorImage: z.string().optional(),
    authorEmail: z.string().optional(),
    authorPhone: z.string().optional(),
  }),
});

export const collections = { blog };
