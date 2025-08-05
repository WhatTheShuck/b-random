import { FastifyInstance } from "fastify";
import { fetchingService } from "../services/fetchingService";
import { db } from "../db";
import { sources } from "../db/schema";
import { eq } from "drizzle-orm";

export async function fetchRoutes(fastify: FastifyInstance) {
  // Manual refresh all sources
  fastify.post("/fetch/all", async (request, reply) => {
    try {
      await fetchingService.fetchAllSources();
      return {
        success: true,
        message: "All sources fetched successfully",
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: "Failed to fetch all sources",
      });
    }
  });

  // Manual refresh specific source
  fastify.post("/fetch/source/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const source = await db
        .select()
        .from(sources)
        .where(eq(sources.id, parseInt(id)))
        .limit(1);

      if (source.length === 0) {
        reply.status(404).send({
          success: false,
          error: "Source not found",
        });
        return;
      }

      const newPostsCount = await fetchingService.fetchSource(source[0]);

      return {
        success: true,
        message: `Fetched ${newPostsCount} new posts from ${source[0].name}`,
        newPostsCount,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: "Failed to fetch source",
      });
    }
  });
}
