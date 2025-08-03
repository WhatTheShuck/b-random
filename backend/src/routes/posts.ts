import { FastifyInstance } from "fastify";
import { db } from "../db";
import { posts } from "../db/schema";
import { desc, asc, eq, ilike, gte } from "drizzle-orm";

export async function postsRoutes(fastify: FastifyInstance) {
  // Get all posts with optional sorting
  fastify.get("/posts", async (request, reply) => {
    const { sort = "score", order = "desc" } = request.query as {
      sort?: "score" | "createdAt" | "title";
      order?: "asc" | "desc";
    };

    try {
      const sortColumn = posts[sort];
      const orderFn = order === "desc" ? desc : asc;

      const allPosts = await db
        .select()
        .from(posts)
        .orderBy(orderFn(sortColumn));

      return {
        success: true,
        data: allPosts,
        count: allPosts.length,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: "Failed to fetch posts",
      });
    }
  });

  // Get single post by ID
  fastify.get("/posts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.id, parseInt(id)))
        .limit(1);

      if (post.length === 0) {
        reply.status(404).send({
          success: false,
          error: "Post not found",
        });
        return;
      }

      return {
        success: true,
        data: post[0],
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: "Failed to fetch post",
      });
    }
  });

  // Get posts by source
  fastify.get("/posts/source/:source", async (request, reply) => {
    const { source } = request.params as { source: string };

    try {
      const sourcePosts = await db
        .select()
        .from(posts)
        .where(ilike(posts.source, `%${source}%`))
        .orderBy(desc(posts.score));

      return {
        success: true,
        data: sourcePosts,
        count: sourcePosts.length,
        source: source,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: "Failed to fetch posts by source",
      });
    }
  });

  // Get top posts (score > threshold)
  fastify.get("/posts/top", async (request, reply) => {
    const { threshold = 80 } = request.query as { threshold?: number };

    try {
      const topPosts = await db
        .select()
        .from(posts)
        .where(gte(posts.score, Number(threshold)))
        .orderBy(desc(posts.score));

      return {
        success: true,
        data: topPosts,
        count: topPosts.length,
        threshold: Number(threshold),
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: "Failed to fetch top posts",
      });
    }
  });
}
