import { intArg, nonNull, objectType, stringArg } from 'nexus';
import { ALERT_ADDED, REVIEW_ADDED } from './subscription';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { Social } from '.prisma/client';

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    // User
    t.crud.createOneUser({ alias: 'signUp' });
    // Profile
    t.crud.updateOneProfile();
    // Review
    t.crud.createOneReview({
      resolve: async (root, args, ctx, info, originalResolve) => {
        const res = await originalResolve(root, args, ctx, info);
        await ctx.pubsub.publish(REVIEW_ADDED, { data: res });
        return res;
      },
    });
    t.crud.deleteOneReview();
    t.crud.updateOneReview();
    // Comment
    t.crud.createOneComment({
      resolve: async (root, args, ctx, info, originalResolve) => {
        const reviewId = args.data.review.connect?.id?.valueOf();
        const res = await originalResolve(root, args, ctx, info);
        // ToDo: comment # 위치
        // ToDo: create tag
        const review = await ctx.prisma.review.findUnique({
          where: {
            id: reviewId,
          },
          select: {
            writerId: true,
          },
        });
        const alert = await ctx.prisma.alert.create({
          data: {
            type: 'COMMENT',
            message: '회원님의 리뷰에 댓글이 달렸습니다.',
            comment: { connect: { id: parseInt(res.id.toString()) } },
            user: {
              connect: {
                id: review?.writerId,
              },
            },
          },
        });

        await ctx.pubsub.publish(ALERT_ADDED, { data: alert });
        return res;
      },
    });
    t.crud.deleteOneComment();
    t.crud.updateOneComment();

    t.crud.deleteManyAlert();

    // User ToDo:
    // 1. github (V), google login (token)
    t.nonNull.field('socialAuth', {
      type: 'AuthPayload',
      args: {
        token: nonNull(stringArg()),
      },
      resolve: async (_, { token }, ctx) => {
        try {
          const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

          const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
          });

          const payload = ticket.getPayload();

          if (payload) {
            const data = {
              name: payload.name || 'default',
              avatar: payload.picture,
              login: payload.email || 'default',
              social: Social.GOOGLE,
            };

            const user = await ctx.prisma.user.upsert({
              where: { login: payload.email },
              update: {
                avatar: payload.picture,
                name: payload.name || 'default',
              },
              create: data,
            });

            const secret = process.env.JWT_SECRET;
            const id = user.id;
            if (secret) {
              const encoded = jwt.sign({ id }, secret);
              ctx.res.cookie('jwt', encoded, { httpOnly: true });
              return {
                user: { avatar: user.avatar },
              };
            }
          }
        } catch (error) {
          throw new Error(error.message);
        }
      },
    });

    // 2. review like func (V), comment tag func
    t.field('toggleLikeReview', {
      type: 'Boolean',
      args: {
        userId: nonNull(intArg()),
        reviewId: nonNull(intArg()),
      },
      resolve: async (_, { userId, reviewId }, ctx) => {
        const result = await ctx.prisma.userLikeReview.findUnique({
          where: {
            userId_reviewId: {
              reviewId,
              userId,
            },
          },
        });
        if (result) {
          await ctx.prisma.userLikeReview.delete({
            where: {
              userId_reviewId: {
                reviewId,
                userId,
              },
            },
          });
        } else {
          await ctx.prisma.userLikeReview.create({
            data: {
              review: {
                connect: { id: reviewId },
              },
              user: { connect: { id: userId } },
            },
          });
          const alert = await ctx.prisma.alert.create({
            data: {
              message: '회원님의 리뷰에 좋아요가 눌렸습니다.',
              type: 'LIKE',
              user: {
                connect: {
                  id: userId,
                },
              },
            },
          });
          await ctx.pubsub.publish(ALERT_ADDED, { data: alert });
        }
        return true;
      },
    });

    // 3. admin ?
    // 4. session login (X) ?

    // Review ToDo:
    // 1. user like func (V)
    // 2. create alert func (V)

    // Comment ToDo:
    // 1. user tag func
    // 2. create alert func (V)

    // Alert ToDo:
    // 1. toggleCheck (V)
    // 2. create for like, comment (V)
    // 3. check false count (△) → Client 작업 남음
  },
});

export default Mutation;
