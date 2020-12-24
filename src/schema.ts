import { enumType, intArg, interfaceType, makeSchema, nonNull, objectType, stringArg } from 'nexus';
import { nexusPrisma } from 'nexus-plugin-prisma';
import api, { getGithubToken, getGithubUser } from './api';

const Social = enumType({
    name: 'Social',
    members: ['GITHUB', 'GOOGLE'],
});

const AlertType = enumType({
    name: 'AlertType',
    members: ['LIKE', 'COMMENT'],
});

const User = objectType({
    name: 'User',
    definition(t) {
        t.model.id();
        t.model.name();
        t.model.token();
        t.model.avatar();
        t.model.login();
        t.model.social();
        t.model.reviews();
        t.model.profile();
        t.model.comments();
        t.model.alerts();
        t.model.taggedComment();
        t.model.likedReview();
    },
});

const Review = objectType({
    name: 'Review',
    definition(t) {
        t.model.id();
        t.model.title();
        t.model.content();
        t.model.writer();
        t.model.writerId();
        t.model.movieTitle();
        t.model.posterPath();
        t.model.rating();
        t.model.createdAt();
        t.model.updatedAt();
        t.model.likedUser();
    },
});

const Profile = objectType({
    name: 'Profile',
    definition(t) {
        t.model.id();
        t.model.email();
        t.model.bio();
        t.model.user();
        t.model.userId();
    },
});

const Genre = objectType({
    name: 'Genre',
    definition(t) {
        t.model.id();
        t.model.name();
    },
});

const Comment = objectType({
    name: 'Comment',
    definition(t) {
        t.model.id();
        t.model.content();
        t.model.review();
        t.model.reviewId();
        t.model.writer();
        t.model.writerId();
        t.model.taggedUser({
            pagination: false,
        });
        t.model.alerts({
            pagination: false,
        });
        t.model.createdAt();
        t.model.updatedAt();
    },
});

const Alert = objectType({
    name: 'Alert',
    definition(t) {
        t.model.id();
        t.model.type();
        t.model.message();
        t.model.check();
        t.model.user();
        t.model.userId();
        t.model.comment();
        t.model.commentId();
        t.model.createdAt();
    },
});

// DB에 없고 GraphQL로만 존재하는 Type들
const IFetch = interfaceType({
    name: 'IFetch',
    resolveType() {
        return null;
    },
    definition(t) {
        t.nonNull.int('id');
        t.string('poster_path');
        t.string('backdrop_path');
        t.nonNull.string('overview');
        t.list.nonNull.field('genres', { type: 'Genre' });
        t.nonNull.float('vote_average');
        t.nonNull.int('total_pages');
        t.nonNull.int('total_results');
    },
});

const Video = objectType({
    name: 'Video',
    definition(t) {
        t.nonNull.string('id');
        t.nonNull.string('key');
        t.nonNull.string('name');
    },
});

const Network = objectType({
    name: 'Network',
    definition(t) {
        t.nonNull.int('id');
        t.nonNull.string('name');
        t.string('logo_path');
    },
});

const MovieFetch = objectType({
    name: 'MovieFetch',
    definition(t) {
        t.implements('IFetch');
        t.nonNull.string('title');
        t.nonNull.string('release_date');
        t.list.nonNull.field('videos', {
            type: Video,
        });
    },
});

const ShowFetch = objectType({
    name: 'ShowFetch',
    definition(t) {
        t.implements('IFetch');
        t.nonNull.string('name');
        t.nonNull.string('first_air_date');
        t.list.nonNull.field('networks', { type: 'Network' });
        t.list.nonNull.field('videos', {
            type: Video,
        });
    },
});

const AuthPayload = objectType({
    name: 'AuthPayload',
    definition(t) {
        t.nonNull.string('token');
        t.nonNull.field('user', {
            type: User,
        });
    },
});

const Query = objectType({
    name: 'Query',
    definition(t) {
        t.crud.user();
        t.crud.review();
        t.crud.reviews();
        t.crud.alert();
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
    },
});

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
        t.crud.createOneComment();
        t.crud.deleteOneComment();
        t.crud.updateOneComment();

        // ToDo:
        // Query, Mutation 분리

        // User ToDo:
        // 1. github(V), google login (token)
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

        // 2. review like func, comment tag func
        /*
        t.field('likeReview', {
            type: 'Review',
            
        })
        */
        // 3. admin ?

        // Review ToDo:
        // 1. user like func
        // 2. create alert func

        // Comment ToDo:
        // 1. user tag func
        // 2. create alert func

        // Alert ToDo:
        // 1. toggleCheck
        // 2. create for like, comment
        // 3. check false count
    },
});

export const schema = makeSchema({
    types: [
        User,
        Profile,
        Review,
        Social,
        Genre,
        IFetch,
        Network,
        MovieFetch,
        ShowFetch,
        AlertType,
        Alert,
        Comment,
        Query,
        Mutation,
        AuthPayload,
    ],
    plugins: [nexusPrisma({ experimentalCRUD: true })],
    outputs: {
        schema: __dirname + '/../schema.graphql',
        typegen: __dirname + '/generated/nexus.ts',
    },
    contextType: {
        module: require.resolve('./context'),
        export: 'Context',
    },
    sourceTypes: {
        modules: [
            {
                module: '@prisma/client',
                alias: 'prisma',
            },
        ],
    },
});
