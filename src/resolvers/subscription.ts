import { Alert, Review } from '@prisma/client';
import { subscriptionType } from 'nexus';

export const ALERT_ADDED = 'newAlert';
export const REVIEW_ADDED = 'newReview';

type Event<T> = {
    data: T;
};

const Subscription = subscriptionType({
    definition(t) {
        t.nonNull.field(ALERT_ADDED, {
            type: 'Alert',
            subscribe: (_, args, ctx) => ctx.pubsub.asyncIterator(ALERT_ADDED),
            async resolve(eventPromise: Promise<Event<Alert>>) {
                const event = await eventPromise;
                return event.data;
            },
        });
        t.nonNull.field(REVIEW_ADDED, {
            type: 'Review',
            subscribe: (_, args, ctx) => {
                return ctx.pubsub.asyncIterator(REVIEW_ADDED);
            },
            async resolve(eventPromise: Promise<Event<Review>>) {
                const event = await eventPromise;
                return event.data;
            },
        });
    },
});

export default Subscription;
