import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { workoutRepository } from './repositories/workout.repository';

const app = new Elysia()
    .use(swagger({
        documentation: {
            info: {
                title: 'Gallant Bike API Documentation',
                version: '1.0.0'
            }
        }
    }))
    .use(cors({
        origin: 'localhost:5173'
    }))
    .get('/healthcheck', () => ({ status: 'ok', server: 'elysia' }))
    .group('/v1', (app) =>
        app.group('/workouts', (app) =>
            app
                .post('/', async ({ body }) => {
                    return await workoutRepository.create({
                        startTime: body.startTime,
                        notes: body.notes
                    });
                }, {
                    body: t.Object({
                        startTime: t.Date(),
                        notes: t.Optional(t.String())
                    }),
                    detail: { summary: 'Inicia uma nova sessão de treino' }
                })

                .post('/:id/finish', async ({ params: { id }, body }) => {
                    return await workoutRepository.finish(id, {
                        endTime: body.endTime,
                        avgPower: body.avgPower,
                        totalDistance: body.totalDistance
                    });
                }, {
                    body: t.Object({
                        endTime: t.Date(),
                        avgPower: t.Number(),
                        totalDistance: t.Number()
                    }),
                    detail: { summary: 'Finaliza e persiste os dados do treino' }
                })
        )
    )
    .listen(3000);

console.log(`🚀 Server running at ${app.server?.hostname}:${app.server?.port}`);
