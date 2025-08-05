import { FastifyInstance } from "fastify";
import { db } from "../db";
import { sources, type NewSource, type FilterRules } from "../db/schema";
import { eq } from "drizzle-orm";

export async function sourcesRoutes(fastify: FastifyInstance) {
  // Get all sources
  fastify.get("/sources", async (request, reply) => {
    try {
      const allSources = await db.select().from(sources);
      return {
        success: true,
        data: allSources,
        count: allSources.length,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: "Failed to fetch sources",
      });
    }
  });

  // Add new source
  fastify.post("/sources", async (request, reply) => {
    const sourceData = request.body as {
      name: string;
      type: "youtube" | "rss" | "hackernews";
      identifier: string;
      fetchAll?: boolean;
      filterRules?: FilterRules;
    };

    try {
      const newSource: NewSource = {
        name: sourceData.name,
        type: sourceData.type,
        identifier: sourceData.identifier,
        fetchAll: sourceData.fetchAll ?? true,
        filterRules: sourceData.filterRules
          ? JSON.stringify(sourceData.filterRules)
          : null,
      };

      const [createdSource] = await db
        .insert(sources)
        .values(newSource)
        .returning();

      return {
        success: true,
        data: createdSource,
        message: "Source created successfully",
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: "Failed to create source",
      });
    }
  });

  // Update source
  fastify.put("/sources/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const updateData = request.body as Partial<{
      name: string;
      active: boolean;
      fetchAll: boolean;
      filterRules: FilterRules;
    }>;

    try {
      const updatedSource = await db
        .update(sources)
        .set({
          ...updateData,
          filterRules: updateData.filterRules
            ? JSON.stringify(updateData.filterRules)
            : undefined,
          updatedAt: new Date(),
        })
        .where(eq(sources.id, parseInt(id)))
        .returning();

      if (updatedSource.length === 0) {
        reply.status(404).send({
          success: false,
          error: "Source not found",
        });
        return;
      }

      return {
        success: true,
        data: updatedSource[0],
        message: "Source updated successfully",
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: "Failed to update source",
      });
    }
  });

  // Delete source
  fastify.delete("/sources/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const deletedSource = await db
        .delete(sources)
        .where(eq(sources.id, parseInt(id)))
        .returning();

      if (deletedSource.length === 0) {
        reply.status(404).send({
          success: false,
          error: "Source not found",
        });
        return;
      }

      return {
        success: true,
        message: "Source deleted successfully",
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: "Failed to delete source",
      });
    }
  });
}
