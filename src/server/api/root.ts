import { createTRPCRouter } from "~/server/api/trpc";
import { boardRouter } from "~/server/api/routers/board";
import { ideaRouter } from "~/server/api/routers/idea";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  board: boardRouter,
  idea: ideaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
