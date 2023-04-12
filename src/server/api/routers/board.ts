import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  authProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const boardRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const board = await ctx.prisma.board.findUnique({
        where: {
          id: input.boardId,
        },
        include: {
          ideas: {
            select: {
              content: true,
              boardId: true,
              id: true,
            },
          },
        },
      });

      if (!board) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return board;
    }),

  create: authProcedure
    .input(
      z.object({
        name: z.string().min(1).max(125),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, description } = input;
      const board = await ctx.prisma.board.create({
        data: {
          name,
          description,
          creatorId: ctx.currentUser,
        },
      });
      return { boardId: board.id };
    }),
});
