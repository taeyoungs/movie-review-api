import { intArg, nonNull, objectType, stringArg } from 'nexus';
import { getGithubToken, getGithubUser } from '../api';

const Mutation = objectType({
    name: 'Mutation',
    definition(t) {
        // User
        t.crud.createOneUser({ alias: 'signUp' });
        // Profile
        t.crud.updateOneProfile();
        // Review
        t.crud.createOneReview();
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

                ctx.prisma.alert.create({
                    data: {
                        type: 'COMMENT',
                        message: '회원님의 리뷰에 댓글이 달렸습니다.',
                        user: {
                            connect: {
                                id: review?.writerId,
                            },
                        },
                    },
                });
                return res;
            },
        });
        t.crud.deleteOneComment();
        t.crud.updateOneComment();

        // User ToDo:
        // 1. github (V), google login (token)
        t.field('githutAuth', {
            type: 'AuthPayload',
            args: {
                code: nonNull(stringArg()),
                social: nonNull('Social'),
            },
            resolve: async (_, { code, social }, ctx) => {
                const { access_token } = await getGithubToken(code);
                const { login, avatar_url, name } = await getGithubUser(access_token);
                const data = {
                    name,
                    avatar: avatar_url,
                    token: access_token,
                    login,
                    social,
                };
                const user = await ctx.prisma.user.upsert({
                    where: { login },
                    update: data,
                    create: data,
                });
                return { user, token: access_token };
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
                const result = ctx.prisma.userLikeReview.findUnique({
                    where: {
                        userId_reviewId: {
                            reviewId,
                            userId,
                        },
                    },
                });
                if (result) {
                    ctx.prisma.userLikeReview.delete({
                        where: {
                            userId_reviewId: {
                                reviewId,
                                userId,
                            },
                        },
                    });
                } else {
                    ctx.prisma.userLikeReview.create({
                        data: {
                            review: {
                                connect: { id: reviewId },
                            },
                            user: { connect: { id: userId } },
                        },
                    });
                    ctx.prisma.alert.create({
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
                }
                return true;
            },
        });

        // 3. admin ?
        // 4. session login ?

        // Review ToDo:
        // 1. user like func (V)
        // 2. create alert func (V)

        // Comment ToDo:
        // 1. user tag func 
        // 2. create alert func (V)

        // Alert ToDo:
        // 1. toggleCheck
        // 2. create for like, comment
        // 3. check false count
    },
});

export default Mutation;
