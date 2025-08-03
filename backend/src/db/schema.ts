import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url"),
  source: text("source").notNull(),
  content: text("content"),
  score: integer("score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export type for TypeScript inference
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
