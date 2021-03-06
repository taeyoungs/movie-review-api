import { intArg, nonNull, objectType, stringArg } from 'nexus';
import api from '../api';

const Query = objectType({
    name: 'Query',
    definition(t) {
        t.crud.user();
        t.crud.review();
        t.crud.reviews();
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
                const movieList = await api.get(`movie/popular?page=${page}`).then((res) => res.data.results);
                return movieList;
            },
        });
        t.nonNull.field('movie', {
            type: 'MovieFetch',
            args: {
                id: nonNull(intArg()),
            },
            resolve: async (_, args, ctx) => {
                console.log(ctx.user);
                const id = args.id;
                const movie = await api.get(`movie/${id}?append_to_response=videos`).then((res) => {
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
                const showList = await api.get(`tv/popular?page=${page}`).then((res) => res.data.results);
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
                const show = await api.get(`tv/${id}?append_to_response=videos`).then((res) => res.data);
                const videos = show.videos.results;
                show.videos = videos;
                return show;
            },
        });
        // Search
        t.nonNull.list.nonNull.field('searchMovie', {
            type: 'MovieFetch',
            args: {
                term: nonNull(stringArg()),
                page: nonNull(intArg()),
            },
            resolve: async (_, args, ctx) => {
                const { term, page } = args;
                const searchResults = await api
                    .get(`search/movie?query=${term}&page=${page}`)
                    .then((res) => res.data.results);
                return searchResults;
            },
        });
        t.nonNull.list.nonNull.field('searchShow', {
            type: 'ShowFetch',
            args: {
                term: nonNull(stringArg()),
                page: nonNull(intArg()),
            },
            resolve: async (_, args, ctx) => {
                const { term, page } = args;
                const searchResults = await api
                    .get(`search/tv?query=${term}&page=${page}`)
                    .then((res) => res.data.results);
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
                    const cnt = ctx.prisma.alert.count({
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
    },
});

export default Query;
