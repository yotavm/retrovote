import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  authProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const pollRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ pollId: z.string() }))
    .query(async ({ ctx, input }) => {
      const poll = await ctx.prisma.poll.findUnique({
        where: {
          id: input.pollId,
        },
      });

      if (!poll) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return poll;
    }),

  create: authProcedure
    .input(
      z.object({
        title: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title } = input;
      const poll = await ctx.prisma.poll.create({
        data: {
          title,
          creatorId: ctx.currentUser,
        },
      });
      return { pollId: poll.id };
    }),
});
