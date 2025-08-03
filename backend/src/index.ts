import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "dotenv";
import { postsRoutes } from "./routes/posts";

// Load environment variables
config();

const fastify = Fastify({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  },
});

// Register CORS plugin
fastify.register(cors, {
  origin: true, // Allow all origins for development
  credentials: true,
});

// Health check endpoint
fastify.get("/health", async () => {
  return {
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "b-random-server",
  };
});

// Register API routes
fastify.register(postsRoutes, { prefix: "/api" });

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  reply.status(error.statusCode || 500).send({
    success: false,
    error: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Start server
const start = async () => {
  try {
    const host = process.env.HOST || "0.0.0.0";
    const port = Number(process.env.PORT) || 3001;

    await fastify.listen({ host, port });
    fastify.log.info(`🚀 Server running at http://${host}:${port}`);
    fastify.log.info(
      `📊 Health check available at http://${host}:${port}/health`,
    );
    fastify.log.info(
      `📡 API endpoints available at http://${host}:${port}/api/posts`,
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
