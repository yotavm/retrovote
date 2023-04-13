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
      const idea = await ctx.prisma.idea.create({
        data: {
          content,
          boardId,
          creatorId: ctx.currentUser || ctx.anyanomesUser,
        },
      });
      return idea;
    }),
  addVote: publicProcedure
    .input(
      z
        .object({
          ideaId: z.string(),
          boardId: z.string(),
        })
        .required()
    )
    .mutation(async ({ ctx, input }) => {
      const { ideaId, boardId } = input;
      const board = await ctx.prisma.board.findUnique({
        where: {
          id: boardId,
        },
      });

      if (board?.openForVoting === false) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Voting is not open for this board",
        });
      }

      const vote = await ctx.prisma.vote.create({
        data: {
          ideaId,
          creatorId: ctx.currentUser || ctx.anyanomesUser,
        },
      });

      if (!board || !vote) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not create vote",
        });
      }

      return vote;
    }),
});
