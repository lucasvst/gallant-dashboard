import { db } from '@mono/db';
import { workouts, workoutPoints } from '@mono/db';
import { eq } from 'drizzle-orm';

export const workoutRepository = {
    async create(data: typeof workouts.$inferInsert) {
        return db.insert(workouts).values(data).returning().get();
    },

    async addPoints(points: (typeof workoutPoints.$inferInsert)[]) {
        return db.insert(workoutPoints).values(points);
    },

    async finish(id: string, data: Partial<typeof workouts.$inferInsert>) {
        return db.update(workouts).set(data).where(eq(workouts.id, id)).returning().get();
    }
};
