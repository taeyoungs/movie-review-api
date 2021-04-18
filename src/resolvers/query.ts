import { UserInputError } from 'apollo-server-errors';
import { intArg, nonNull, objectType, stringArg } from 'nexus';
import api from '../api';
import { ICreditProps, ISearchProps, ISimilarWorkProps } from '../types';

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.crud.user();
    t.crud.review();
    // t.crud.alert(); (deprecated)
    t.crud.alerts();
    t.crud.profile();
    t.crud.comments();

    // Movie
    t.nonNull.list.nonNull.field('movies', {
      type: 'MovieFetch',
      args: {
        page: nonNull(intArg()),
      },
      resolve: async (_, args, ctx) => {
        const page = args.page || 1;
        const movieList = await api
          .get(`movie/popular?page=${page}`)
          .then((res) => res.data.results);
        return movieList;
      },
    });
    t.nonNull.field('movie', {
      type: 'MovieFetch',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_, args, ctx) => {
        const id = args.id;
        const movie = await api
          .get(`movie/${id}?append_to_response=videos`)
          .then((res) => {
            return res.data;
          });
        const videos = movie.videos.results;
        movie.videos = videos;
        return movie;
      },
    });
    // TV Show
    t.nonNull.list.nonNull.field('shows', {
      type: 'ShowFetch',
      args: {
        page: nonNull(intArg()),
      },
      resolve: async (_, args, ctx) => {
        const page = args.page;
        const showList = await api
          .get(`tv/popular?page=${page}`)
          .then((res) => res.data.results);
        return showList;
      },
    });
    t.nonNull.field('show', {
      type: 'ShowFetch',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, args, ctx) => {
        const id = args.id;
        const show = await api
          .get(`tv/${id}?append_to_response=videos`)
          .then((res) => res.data);
        const videos = show.videos.results;
        show.videos = videos;
        return show;
      },
    });

    // Trending
    t.nonNull.list.nonNull.field('trendingMovies', {
      type: 'MovieFetch',
      args: {
        timeWindow: nonNull(stringArg()),
      },
      resolve: async (_, args, ctx) => {
        const timeWindow = args.timeWindow;
        const trendingMovieList = await api
          .get(`trending/movie/${timeWindow}`)
          .then((res) => res.data.results);
        return trendingMovieList;
      },
    });

    t.nonNull.list.nonNull.field('trendingShows', {
      type: 'ShowFetch',
      args: {
        timeWindow: nonNull(stringArg()),
      },
      resolve: async (_, args, ctx) => {
        const timeWindow = args.timeWindow;
        const trendingShowList = await api
          .get(`trending/tv/${timeWindow}`)
          .then((res) => res.data.results);
        return trendingShowList;
      },
    });

    t.nonNull.field('detail', {
      type: 'DetailFetch',
      args: {
        media_type: nonNull(stringArg()),
        id: nonNull(stringArg()),
      },
      resolve: async (_, { media_type, id }, ctx) => {
        const detail = await api
          .get(`${media_type}/${id}?append_to_response=videos`)
          .then((res) => {
            if (media_type === 'tv') {
              return {
                ...res.data,
                title: res.data.name,
                runtime: res.data.episode_run_time[0],
                release_date: res.data.first_air_date,
                videos: res.data.videos.results,
              };
            } else {
              return {
                ...res.data,
                videos: res.data.videos.results,
              };
            }
          });
        return detail;
      },
    });

    t.nonNull.list.nonNull.field('casts', {
      type: 'CastFetch',
      args: {
        media_type: nonNull(stringArg()),
        id: nonNull(stringArg()),
      },
      resolve: async (_, { media_type, id }, ctx) => {
        const casts = await api
          .get(`${media_type}/${id}/credits`)
          .then((res) => {
            if (res.data.cast.length > 15) {
              return res.data.cast.slice(0, 15);
            } else {
              return res.data.cast;
            }
          });
        return casts;
      },
    });

    t.nonNull.list.nonNull.field('similarWorks', {
      type: 'SimilarWorksFetch',
      args: {
        media_type: nonNull(stringArg()),
        id: nonNull(stringArg()),
      },
      resolve: async (_, { media_type, id }) => {
        const works = await api
          .get(`${media_type}/${id}/similar`)
          .then((res) => {
            if (res.data.results.length > 12) {
              return res.data.results.slice(0, 12);
            } else {
              return res.data.results;
            }
          });
        let formatWorks = [];
        if (media_type === 'tv') {
          formatWorks = works.map((work: ISimilarWorkProps) => {
            return {
              id: work.id,
              title: work.name,
              vote_average: work.vote_average,
              poster_path: work.poster_path,
            };
          });
        } else {
          formatWorks = works;
        }
        return formatWorks;
      },
    });

    // Search
    t.nonNull.list.nonNull.field('multiSearch', {
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

    // Alert
    // 1. check false -> true (V)
    t.nonNull.list.nonNull.field('check', {
      type: 'Alert',
      resolve: async (_, args, ctx) => {
        const user = ctx.user;
        const alerts = await ctx.prisma.alert.findMany({
          where: {
            userId: user?.id,
            check: false,
          },
        });
        await ctx.prisma.alert.updateMany({
          data: {
            check: true,
          },
          where: {
            userId: user?.id,
            check: false,
          },
        });
        return alerts;
      },
    });

    // 2. unchecked alerts (V)
    // subscribe로 갱신 (Client 쪽에서 작업)
    t.nonNull.int('uncheckedAlertsCount', {
      resolve: async (_, args, ctx) => {
        const user = ctx.user;
        if (user) {
          const cnt = await ctx.prisma.alert.count({
            where: {
              userId: user.id,
              check: false,
            },
          });
          return cnt;
        } else {
          return 0;
        }
      },
    });

    t.nonNull.list.nonNull.field('reviews', {
      type: 'Review',
      args: {
        id: nonNull(stringArg()),
        size: nonNull(intArg()),
        skip: nonNull(intArg()),
      },
      resolve: async (_, { id, size, skip }, ctx) => {
        const reviews = await ctx.prisma.review.findMany({
          where: {
            movieId: id,
            NOT: {
              content: '',
            },
          },
          skip,
          take: size,
          orderBy: {
            createdAt: 'desc',
          },
        });
        return reviews;
      },
    });

    // 해당 작품에 존재하는 사용자 리뷰 반환
    t.field('getUserReview', {
      type: 'Review',
      args: {
        movieId: nonNull(stringArg()),
      },
      resolve: async (_, { movieId }, ctx) => {
        const user = ctx.user;
        if (user) {
          const review = await ctx.prisma.review.findMany({
            where: {
              movieId,
              writerId: user.id,
            },
          });

          if (review.length === 0) return null;
          else return review[0];
        } else {
          return null;
        }
      },
    });

    // 리뷰 아이디에 해당하는 사용자 리뷰 반환
    t.field('getReview', {
      type: 'Review',
      args: {
        reviewId: nonNull(stringArg()),
      },
      resolve: async (_, { reviewId }, ctx) => {
        const review = await ctx.prisma.review.findUnique({
          where: {
            id: +reviewId,
          },
        });

        return review;
      },
    });

    t.field('getPerson', {
      type: 'PersonFetch',
      args: {
        personId: nonNull(stringArg()),
      },
      resolve: async (_, { personId }, ctx) => {
        const person = await api
          .get(`/person/${personId}`)
          .then((res) => res.data);

        return person;
      },
    });

    t.nonNull.list.nonNull.field('getPersonCredits', {
      type: 'MovieFetch',
      args: {
        personId: nonNull(stringArg()),
        page: nonNull(intArg()),
      },
      resolve: async (_, { personId, page }, ctx) => {
        // size: 9
        const credits = await api
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

        const sortedCredits = credits.sort(
          (a: ICreditProps, b: ICreditProps) => {
            // const aYear = a.release_date ? +a.release_date.split('-')[0] : 0;
            // const bYear = b.release_date ? +b.release_date.split('-')[0] : 0;
            // return bYear - aYear;
            const aDate = new Date(a.release_date).getTime();
            const bDate = new Date(b.release_date).getTime();
            return bDate - aDate;
          }
        );

        return sortedCredits.slice(0, 9 * page);
      },
    });
  },
});

export default Query;
