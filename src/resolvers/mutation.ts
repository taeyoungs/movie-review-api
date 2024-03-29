import { floatArg, intArg, nonNull, objectType, stringArg } from 'nexus';
import { ALERT_ADDED, REVIEW_ADDED } from './subscription';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { Social } from '.prisma/client';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import api from '../api';
import { ICreditProps, IMovieProps, ISearchProps } from '../types';

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    // User
    t.crud.createOneUser({ alias: 'signUp' });
    // Profile
    t.crud.updateOneProfile();
    // Review
    t.crud.deleteOneReview();

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
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        if (!token) {
          throw new UserInputError('Invalid token');
        }

        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
          throw new AuthenticationError('Invalid token');
        }

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
          let encoded = '';
          if (secret) {
            encoded = jwt.sign({ id }, secret);
          } else {
            throw new Error();
          }

          ctx.res.cookie('jwt', encoded, { httpOnly: true });
          return {
            avatar: user.avatar,
          };
        }
        return null;
      },
    });

    // local login
    t.field('localLogin', {
      type: 'AuthPayload',
      args: {
        login: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_, { login, password }, ctx) => {
        if (login === '' || password === '') {
          throw new UserInputError('아이디와 비밀번호는 필수 항목입니다.');
        }

        const user = await ctx.prisma.user.findUnique({
          where: {
            login,
          },
        });

        if (!user) {
          throw new UserInputError('가입 정보가 존재하지 않습니다.');
        }

        let match = false;
        if (user.password) {
          match = await bcrypt.compare(password, user.password);
        }

        if (!match) {
          throw new AuthenticationError(
            '아이디와 비밀번호가 일치하지 않습니다.'
          );
        }

        const secret = process.env.JWT_SECRET;
        const id = user.id;
        let encoded = '';
        if (secret) {
          encoded = jwt.sign({ id }, secret);
        } else {
          throw new Error();
        }

        ctx.res.cookie('jwt', encoded, { httpOnly: true });
        return {
          avatar: user.avatar || null,
          login,
        };
      },
    });

    // local SignUp
    t.field('localSignUp', {
      type: 'AuthPayload',
      args: {
        login: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_, { login, password }, ctx) => {
        if (login === '' || password === '') {
          throw new UserInputError('아이디와 비밀번호는 필수 항목입니다.');
        }

        const existedUser = await ctx.prisma.user.findUnique({
          where: {
            login,
          },
        });

        if (existedUser) {
          throw new UserInputError('이미 존재하는 아이디입니다.');
        }

        const hashed = await bcrypt.hash(password, 10);

        const data = {
          name: 'default',
          login,
          password: hashed,
          social: Social.LOCAL,
        };

        const user = await ctx.prisma.user.create({
          data,
        });

        const secret = process.env.JWT_SECRET;
        const id = user.id;
        let encoded = '';
        if (secret) {
          encoded = jwt.sign({ id }, secret);
        } else {
          throw new Error();
        }

        ctx.res.cookie('jwt', encoded, { httpOnly: true });
        return {
          avatar: null,
          login,
        };
      },
    });

    t.field('logout', {
      type: 'Boolean',
      resolve: (_, args, ctx) => {
        ctx.res.cookie('jwt', 'loggedOut', { httpOnly: true });
        return true;
      },
    });

    t.nonNull.field('createReview', {
      type: 'Review',
      args: {
        movieId: nonNull(stringArg()),
        movieTitle: nonNull(stringArg()),
        rating: nonNull(floatArg()),
      },
      resolve: async (_, { movieId, movieTitle, rating }, ctx) => {
        const user = ctx.user;
        if (!user) {
          throw new AuthenticationError('로그인이 필요한 작업입니다.');
        }

        const review = await ctx.prisma.review.create({
          data: {
            content: '',
            rating,
            movieId,
            movieTitle,
            writer: {
              connect: {
                id: user.id,
              },
            },
          },
        });

        return review;
      },
    });

    t.field('updateReview', {
      type: 'Review',
      args: {
        content: stringArg(),
        rating: floatArg(),
        reviewId: nonNull(intArg()),
      },
      resolve: async (_, { content, rating, reviewId }, ctx) => {
        const user = ctx.user;
        if (!user) {
          throw new AuthenticationError('로그인이 필요한 작업입니다.');
        }

        if (content === '') {
          const review = await ctx.prisma.review.update({
            where: {
              id: reviewId,
            },
            data: {
              content,
            },
          });
          return review;
        }

        const review = await ctx.prisma.review.update({
          where: {
            id: reviewId,
          },
          data: {
            ...(content && { content }),
            ...(rating && { rating }),
          },
        });
        return review;
      },
    });

    t.field('toggleLikeReview', {
      type: 'Review',
      args: {
        reviewId: nonNull(intArg()),
      },
      resolve: async (_, { reviewId }, ctx) => {
        const user = ctx.user;
        if (!user) {
          throw new UserInputError('로그인이 필요한 작업입니다.');
        }

        const result = await ctx.prisma.userLikeReview.findUnique({
          where: {
            userId_reviewId: {
              reviewId,
              userId: user.id,
            },
          },
        });
        if (result) {
          await ctx.prisma.userLikeReview.delete({
            where: {
              userId_reviewId: {
                reviewId,
                userId: user.id,
              },
            },
          });
        } else {
          await ctx.prisma.userLikeReview.create({
            data: {
              review: {
                connect: { id: reviewId },
              },
              user: { connect: { id: user.id } },
            },
          });
          const alert = await ctx.prisma.alert.create({
            data: {
              message: '회원님의 리뷰에 좋아요가 눌렸습니다.',
              type: 'LIKE',
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
          await ctx.pubsub.publish(ALERT_ADDED, { data: alert });
        }
        const review = await ctx.prisma.review.findUnique({
          where: {
            id: reviewId,
          },
        });
        return review;
      },
    });

    t.nonNull.list.nonNull.field('getMoreCredits', {
      type: 'Credits',
      args: {
        personId: nonNull(stringArg()),
        page: nonNull(intArg()),
      },
      resolve: async (_, { personId, page }, ctx) => {
        // size: 9
        const results = await api
          .get(`/person/${personId}/combined_credits`)
          .then((res) => {
            return res.data.cast.map((work: ISearchProps) => {
              return {
                id: work.id,
                ...(work.media_type && { media_type: work.media_type }),
                ...(work.name && { title: work.name }),
                ...(work.title && { title: work.title }),
                ...(work.poster_path && { poster_path: work.poster_path }),
                ...(work.release_date && {
                  release_date: work.release_date,
                }),
                ...(work.first_air_date && {
                  release_date: work.first_air_date,
                }),
                ...(work.vote_average && { vote_average: work.vote_average }),
              };
            });
          });

        const sortedCredits = results.sort(
          (a: ICreditProps, b: ICreditProps) => {
            // const aYear = a.release_date ? +a.release_date.split('-')[0] : 0;
            // const bYear = b.release_date ? +b.release_date.split('-')[0] : 0;
            // return bYear - aYear;
            const aDate = new Date(a.release_date).getTime();
            const bDate = new Date(b.release_date).getTime();
            return bDate - aDate;
          }
        );

        return sortedCredits.slice(9 * page, 9 * page + 9);
      },
    });

    t.nonNull.list.nonNull.field('getMoreWorks', {
      type: 'WorkFetch',
      args: {
        page: nonNull(intArg()),
        contentType: nonNull(stringArg()),
        mediaType: nonNull(stringArg()),
      },
      resolve: async (_, { page, contentType, mediaType }, ctx) => {
        // size: 9
        const workList = await api
          .get(`${mediaType}/${contentType}?page=${page}`)
          .then((res) => {
            return res.data.results.map((work: IMovieProps) => {
              return {
                id: work.id,
                overview: work.overview,
                ...(work.name && { title: work.name }),
                ...(work.title && { title: work.title }),
                ...(work.poster_path && { poster_path: work.poster_path }),
                ...(work.backdrop_path && {
                  backdrop_path: work.backdrop_path,
                }),
                ...(work.release_date && {
                  release_date: work.release_date,
                }),
                ...(work.first_air_date && {
                  release_date: work.first_air_date,
                }),
                ...(work.vote_average && {
                  vote_average: work.vote_average,
                }),
              };
            });
          });
        return workList;
      },
    });

    t.nonNull.list.nonNull.field('getMoreSearchData', {
      type: 'SearchFetch',
      args: {
        term: nonNull(stringArg()),
        page: nonNull(intArg()),
        searchType: nonNull(stringArg()),
      },
      resolve: async (_, args, ctx) => {
        // id, media_type, title, poster_path, vote_average, release_date
        const { term, page, searchType } = args;

        if (
          !(
            searchType === 'multi' ||
            searchType === 'movie' ||
            searchType === 'tv' ||
            searchType === 'person'
          )
        ) {
          throw new UserInputError('존재하지 않는 검색 카테고리입니다.');
        }

        const searchResults = await api
          .get(
            `search/${searchType}?query=${encodeURIComponent(
              term
            )}&page=${page}`
          )
          .then((res) => {
            if (searchType === 'multi') {
              return res.data.results.map((work: ISearchProps) => {
                return {
                  id: work.id,
                  ...(work.media_type && { media_type: work.media_type }),
                  ...(work.name && { title: work.name }),
                  ...(work.title && { title: work.title }),
                  ...(work.poster_path && { poster_path: work.poster_path }),
                  ...(work.profile_path && { poster_path: work.profile_path }),
                  ...(work.release_date && {
                    release_date: work.release_date,
                  }),
                  ...(work.first_air_date && {
                    release_date: work.first_air_date,
                  }),
                  ...(work.vote_average && { vote_average: work.vote_average }),
                };
              });
            } else if (searchType === 'movie') {
              return res.data.results.map((work: ISearchProps) => {
                return {
                  id: work.id,
                  media_type: searchType,
                  ...(work.title && { title: work.title }),
                  ...(work.poster_path && { poster_path: work.poster_path }),
                  ...(work.release_date && {
                    release_date: work.release_date,
                  }),
                  ...(work.vote_average && { vote_average: work.vote_average }),
                };
              });
            } else if (searchType === 'tv') {
              return res.data.results.map((work: ISearchProps) => {
                return {
                  id: work.id,
                  media_type: searchType,
                  ...(work.name && { title: work.name }),
                  ...(work.poster_path && { poster_path: work.poster_path }),
                  ...(work.first_air_date && {
                    release_date: work.first_air_date,
                  }),
                  ...(work.vote_average && { vote_average: work.vote_average }),
                };
              });
            } else if (searchType === 'person') {
              return res.data.results.map((work: ISearchProps) => {
                return {
                  id: work.id,
                  media_type: searchType,
                  ...(work.name && { title: work.name }),
                  ...(work.profile_path && { poster_path: work.profile_path }),
                };
              });
            } else {
              throw new UserInputError('존재하지 않는 검색 카테고리입니다.');
            }
          });
        return searchResults;
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
