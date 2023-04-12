import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const ideaRouter = createTRPCRouter({
  getByBoardId: publicProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const ideas = await ctx.prisma.idea.findMany({
        where: {
          boardId: input.boardId,
        },
      });

      if (!ideas) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ideas;
    }),

  create: publicProcedure
    .input(
      z.object({
        content: z.string(),
        boardId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { content, boardId } = input;
      const board = await ctx.prisma.idea.create({
        data: {
          content,
          boardId,
          creatorId: "1",
        },
      });
      return { boardId: board.id };
    }),
});
