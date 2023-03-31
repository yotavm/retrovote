import { z } from "zod";
import {
  authProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const pollRouter = createTRPCRouter({
  getById: publicProcedure.query(async ({ ctx, input }) => {
    const poll = await ctx.prisma.poll.findUnique({
      where: {
        id: input,
      },
    });
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
      return poll.id;
    }),
});
