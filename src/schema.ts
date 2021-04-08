import {
  enumType,
  inputObjectType,
  interfaceType,
  makeSchema,
  objectType,
} from 'nexus';
import { nexusPrisma } from 'nexus-plugin-prisma';
import Mutation from './resolvers/mutation';
import Query from './resolvers/query';
import Subscription from './resolvers/subscription';

const Social = enumType({
  name: 'Social',
  members: ['GOOGLE', 'LOCAL'],
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
    t.model.avatar();
    t.model.login();
    t.model.social();
    t.model.reviews();
    t.model.profile();
    t.model.comments();
    t.model.alerts();
    t.model.likeReviews();
  },
});

const Writer = objectType({
  name: 'Writer',
  definition(t) {
    t.nonNull.string('name');
    t.string('avatar');
  },
});

const Review = objectType({
  name: 'Review',
  definition(t) {
    t.model.id();
    t.model.content();
    t.model.writer();
    t.model.writerId();
    t.model.movieId();
    t.model.movieTitle();
    t.model.rating();
    t.model.createdAt();
    t.model.updatedAt();
    t.nonNull.field('writer', {
      type: 'Writer',
      resolve: async (parent, args, ctx) => {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: parent.writerId,
          },
        });
        if (user) {
          return {
            name: user.name === 'default' ? user.login : user.name,
            avatar: user.avatar,
          };
        } else {
          return {
            name: 'default',
            avatar: null,
          };
        }
      },
    });
    t.nonNull.boolean('isLike', {
      resolve: async (parent, args, ctx) => {
        const user = ctx.user;
        if (user) {
          const review = await ctx.prisma.userLikeReview.findUnique({
            where: {
              userId_reviewId: {
                reviewId: parent.id,
                userId: user.id,
              },
            },
          });
          if (review) return true;
          else return false;
        } else {
          return false;
        }
      },
    });
    t.nonNull.int('likeCount', {
      resolve: async (parent, args, ctx) => {
        return await ctx.prisma.userLikeReview.count({
          where: {
            reviewId: parent.id,
          },
        });
      },
    });
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
    t.nonNull.int('id');
    t.nonNull.string('name');
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
    t.model.createdAt();
  },
});

const UserLikeReview = objectType({
  name: 'UserLikeReview',
  definition(t) {
    t.model.review();
    t.model.reviewId();
    t.model.user();
    t.model.userId();
  },
});

const UserLikeReviewUpdateManyMutationInput = inputObjectType({
  name: 'UserLikeReviewUpdateManyMutationInput',
  definition(t) {
    t.string('DUMMY_INPUT_FIELD_WORKAROUND');
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
    t.string('media_type');
    t.string('tagline');
    t.nonNull.string('overview');
    t.list.nonNull.field('genres', { type: 'Genre' });
    t.nonNull.float('vote_average');
    t.nonNull.int('vote_count');
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
    t.int('runtime');
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
    t.list.nonNull.int('episode_run_time');
    t.list.nonNull.field('networks', { type: 'Network' });
    t.list.nonNull.field('videos', {
      type: Video,
    });
  },
});

const MovieAndShow = objectType({
  name: 'MovieAndShow',
  definition(t) {
    t.nonNull.int('id');
    t.string('name');
    t.string('title');
    t.string('first_air_date');
    t.string('release_date');
    t.string('poster_path');
    t.string('backdrop_path');
  },
});

const PersonFetch = objectType({
  name: 'PersonFetch',
  definition(t) {
    t.nonNull.int('id');
    t.string('profile_path');
    t.nonNull.string('name');
  },
});

const CastFetch = objectType({
  name: 'CastFetch',
  definition(t) {
    t.nonNull.int('id');
    t.string('profile_path');
    t.nonNull.string('name');
    t.nonNull.string('character');
  },
});

const SimilarWorksFetch = objectType({
  name: 'SimilarWorksFetch',
  definition(t) {
    t.nonNull.int('id');
    t.string('poster_path');
    t.nonNull.string('title');
    t.nonNull.float('vote_average');
  },
});

const SearchFetch = objectType({
  name: 'SearchFetch',
  definition(t) {
    t.nonNull.int('id');
    t.string('poster_path');
    t.string('profile_path');
    t.string('media_type');
    t.string('title');
    t.string('name');
    t.float('vote_average');
    t.string('release_date');
    t.string('first_air_date');
  },
});

const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('avatar');
    t.string('login');
  },
});

export const schema = makeSchema({
  types: [
    User,
    Profile,
    Writer,
    Review,
    Social,
    Genre,
    IFetch,
    Network,
    MovieFetch,
    ShowFetch,
    MovieAndShow,
    PersonFetch,
    CastFetch,
    SimilarWorksFetch,
    SearchFetch,
    AlertType,
    Alert,
    Comment,
    Query,
    Mutation,
    Subscription,
    AuthPayload,
    UserLikeReview,
    UserLikeReviewUpdateManyMutationInput,
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
