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
              creatorId: true,
              vote: true,
            },
          },
        },
      });

      if (!board) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (board.creatorId === ctx.currentUser) {
        return board;
      }

      console.log("board", board);

      if (!board.showIdeas) {
        const userIdeas = board.ideas.filter((idea) => {
          return idea.creatorId === ctx.anyanomesUser;
        });

        if (board.privateVoteing) {
          userIdeas.forEach((idea) => {
            idea.vote = idea.vote.filter((vote) => {
              return vote.creatorId === ctx.anyanomesUser;
            });
          });
        }

        return {
          ...board,
          ideas: userIdeas,
        };
      } else {
        return board;
      }
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
  update: authProcedure
    .input(
      z.object({
        boardId: z.string(),
        settingName: z.enum([
          "showIdeas",
          "voteLimit",
          "openForVoting",
          "privateVoteing",
        ]),
        value: z.union([z.boolean(), z.number()]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { settingName, value } = input;
      const board = await ctx.prisma.board.update({
        where: {
          creatorId_id: {
            creatorId: ctx.currentUser,
            id: input.boardId,
          },
        },
        data: {
          [settingName]: value,
        },
      });
      return board;
    }),
});
