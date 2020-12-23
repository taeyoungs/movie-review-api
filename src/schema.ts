import { enumType, interfaceType, makeSchema, objectType, unionType } from 'nexus';
import { nexusPrisma } from 'nexus-plugin-prisma';

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
        t.model.taggedUser();
        t.model.alerts();
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
        t.nonNull.string('poster_path');
        t.nonNull.string('backdrop_path');
        t.nonNull.string('overview');
        t.list.nonNull.field('genres', { type: 'Genre' });
        t.nonNull.float('vote_average');
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
    },
});

const ShowFetch = objectType({
    name: 'ShowFetch',
    definition(t) {
        t.implements('IFetch');
        t.nonNull.string('name');
        t.nonNull.string('first_air_date');
        t.list.nonNull.field('networks', { type: 'Network' });
    },
});

export const schema = makeSchema({
    types: [User, Profile, Review, Social, Genre, IFetch, Network, MovieFetch, ShowFetch, AlertType, Alert, Comment],
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
