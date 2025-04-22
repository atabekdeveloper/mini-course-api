import request from 'supertest';
import { app } from '../../app';
import { HTTP_STATUSES } from '../../utils';

describe('/course', () => {
    beforeAll(async () => {
        await request(app).delete('/__test__/data'); // Clear all data before tests
    });

    let createdCourse: { id: number; title: string };

    it('should return 200 and an empty array', async () => {
        const response = await request(app).get('/courses');
        expect(response.status).toBe(HTTP_STATUSES.OK_200);
    });

    it('should return 400 when trying to create a course without title', async () => {
        await request(app)
            .post('/courses')
            .send({})
            .expect(HTTP_STATUSES.BAD_REQUEST_400);
    });

    it('should create a course with correct title', async () => {
        const response = await request(app)
            .post('/courses')
            .send({ title: 'React Basics' })
            .expect(HTTP_STATUSES.CREATED_201);

        expect(response.body).toMatchObject({
            id: expect.any(Number),
            title: 'React Basics',
        });

        createdCourse = response.body;
    });

    it('should return 200 and the created course by ID', async () => {
        const response = await request(app)
            .get(`/courses/${createdCourse.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual(createdCourse);
    });

    it('should return 404 for a non-existing course', async () => {
        await request(app).get('/courses/999999').expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('should update the course with valid data', async () => {
        await request(app)
            .put(`/courses/${createdCourse.id}`)
            .send({ title: 'Updated React Course' })
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const updated = await request(app).get(`/courses/${createdCourse.id}`);
        expect(updated.body.title).toBe('Updated React Course');
    });

    it('should return 400 when updating with invalid data', async () => {
        await request(app)
            .put(`/courses/${createdCourse.id}`)
            .send({}) // missing title
            .expect(HTTP_STATUSES.BAD_REQUEST_400);
    });

    it('should return 404 when updating a non-existing course', async () => {
        await request(app)
            .put('/courses/999999')
            .send({ title: 'Some title' })
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('should delete the course by ID', async () => {
        await request(app)
            .delete(`/courses/${createdCourse.id}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request(app).get(`/courses/${createdCourse.id}`).expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('should return 404 when deleting a non-existing course', async () => {
        await request(app).delete('/courses/999999').expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('should filter courses by title', async () => {
        await request(app).post('/courses').send({ title: 'JavaScript' });
        await request(app).post('/courses').send({ title: 'TypeScript' });
        await request(app).post('/courses').send({ title: 'Node.js' });

        const response = await request(app).get('/courses?title=Script');
        expect(response.status).toBe(HTTP_STATUSES.OK_200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].title).toContain('Script');
        expect(response.body[1].title).toContain('Script');
    });
});