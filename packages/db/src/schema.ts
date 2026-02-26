import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

function createId() {
    return crypto.randomUUID();
}

export const workouts = sqliteTable("workouts", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    startTime: integer("start_time", { mode: "timestamp" }).notNull(),
    endTime: integer("end_time", { mode: "timestamp" }),
    durationSeconds: integer("duration_seconds").default(0),
    avgPower: real("avg_power").default(0),
    maxPower: real("max_power").default(0),
    avgCadence: real("avg_cadence").default(0),
    totalDistance: real("total_distance").default(0),
    notes: text("notes"),
});

export const workoutPoints = sqliteTable("workout_points", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    workoutId: text("workout_id").references(() => workouts.id, { onDelete: 'cascade' }),
    timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
    speed: real("speed"),
    cadence: integer("cadence"),
    power: integer("power"),
});
