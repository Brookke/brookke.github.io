import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    categories: z
      .union([z.array(z.string()), z.string()])
      .optional()
      .transform((val) => {
        if (typeof val === "string") return [val];
        return val || [];
      }),
    description: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  blog,
};
