import { makeSchema, objectType } from 'nexus';
import { nexusPrisma } from 'nexus-plugin-prisma';

const User = objectType({
    name: 'User',
    definition(t) {
        t.model.id();
        t.model.name();
        t.model.token();
        t.model.login();
    },
});

export const schema = makeSchema({
    types: [],
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
