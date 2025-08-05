import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url"),
  source: text("source").notNull(),
  sourceType: text("source_type").notNull(),
  sourceId: text("source_id").notNull(),
  content: text("content"),
  duration: integer("duration"), // video length in seconds (YouTube specific)
  publishedAt: timestamp("published_at"), // original publish time
  score: integer("score").default(0),
  filtered: boolean("filtered").default(false), // whether this passed filtering
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Theo - t3.gg", "Hacker News", etc.
  type: text("type").notNull(), // "youtube", "rss", "hackernews"
  identifier: text("identifier").notNull(), // channel_id, RSS URL, etc.
  active: boolean("active").default(true),
  fetchAll: boolean("fetch_all").default(true), // true = simple fetch, false = use filters
  filterRules: text("filter_rules"), // JSON string with filtering criteria
  lastFetched: timestamp("last_fetched"),
  lastFetchCount: integer("last_fetch_count").default(0), // how many items fetched last time
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export types for TypeScript inference
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;

// Filter rules interface for type safety
export interface FilterRules {
  titleIncludes?: string[]; // must contain these keywords
  titleExcludes?: string[]; // must not contain these keywords
  minDuration?: number; // minimum video length in seconds
  maxDuration?: number; // maximum video length in seconds
  publishedAfter?: string; // ISO date string
  descriptionIncludes?: string[]; // description must contain these
}
