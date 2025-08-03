import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { posts } from "./schema";

// Create a separate pool just for seeding
const seedPool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  max: 1, // Only need one connection for seeding
});

const seedDb = drizzle(seedPool);

const testData = [
  {
    title: "Building Scalable Microservices with Rust",
    url: "https://www.youtube.com/watch?v=example1",
    source: "YouTube - Rust Programming",
    content:
      "Deep dive into building microservices architecture using Rust, covering async programming, error handling, and performance optimisation.",
    score: 85,
  },
  {
    title: "Show HN: I built a terminal-based task manager in Go",
    url: "https://news.ycombinator.com/item?id=example1",
    source: "Hacker News",
    content:
      "Terminal-based task manager with vim-like keybindings, built using Go and the Bubble Tea framework.",
    score: 92,
  },
  {
    title: "The Future of JavaScript: ECMAScript 2024 Features",
    url: "https://javascript.info/example-post",
    source: "RSS - JavaScript Weekly",
    content:
      "Overview of the latest ECMAScript 2024 features including new array methods, improved async handling, and performance improvements.",
    score: 78,
  },
  {
    title: "PostgreSQL 17: What's New and Performance Improvements",
    url: "https://www.postgresql.org/about/news/example",
    source: "RSS - PostgreSQL News",
    content:
      "PostgreSQL 17 introduces significant performance improvements, new indexing capabilities, and enhanced JSON support.",
    score: 88,
  },
  {
    title: "Docker Best Practices for Production Deployments",
    url: "https://www.youtube.com/watch?v=example2",
    source: "YouTube - DevOps Toolkit",
    content:
      "Comprehensive guide to Docker best practices including multi-stage builds, security considerations, and optimising container size.",
    score: 81,
  },
  {
    title: "Ask HN: What's your preferred tech stack for 2024?",
    url: "https://news.ycombinator.com/item?id=example2",
    source: "Hacker News",
    content:
      "Community discussion about preferred technology stacks, covering frontend frameworks, backend languages, and database choices.",
    score: 76,
  },
  {
    title: "Arch Linux Installation Guide: Complete Walkthrough",
    url: "https://archlinux.org/example-guide",
    source: "RSS - Arch Linux News",
    content:
      "Step-by-step guide to installing Arch Linux, including partitioning, package selection, and post-installation configuration.",
    score: 73,
  },
  {
    title: "Advanced TypeScript Patterns and Techniques",
    url: "https://www.youtube.com/watch?v=example3",
    source: "YouTube - TypeScript Mastery",
    content:
      "Advanced TypeScript concepts including conditional types, mapped types, and advanced generic patterns for better type safety.",
    score: 89,
  },
];

async function seedDatabase() {
  console.log("Seeding database with test data...");

  try {
    // Clear existing data
    await seedDb.delete(posts);
    console.log("Cleared existing posts");

    // Insert test data
    await seedDb.insert(posts).values(testData);
    console.log(`Inserted ${testData.length} test posts`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await seedPool.end();
  }
}

seedDatabase();
