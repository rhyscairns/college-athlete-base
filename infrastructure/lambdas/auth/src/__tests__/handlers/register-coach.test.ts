import { handleRegisterCoach } from '../../handlers/register-coach';
import * as dbClient from '../../db/client';
import * as passwordUtils from '../../utils/password';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

jest.mock('../../db/client');
jest.mock('../../utils/password');

const mockQuery = dbClient.query as jest.MockedFunction<typeof dbClient.query>;
const mockHashPassword = passwordUtils.hashPassword as jest.MockedFunction<typeof passwordUtils.hashPassword>;

function makeEvent(body: unknown): APIGatewayProxyEventV2 {
    return {
        body: JSON.stringify(body),
        rawPath: '/auth/register/coach',
        requestContext: { http: { method: 'POST' } },
    } as unknown as APIGatewayProxyEventV2;
}

const validBody = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@university.edu',
    password: 'Password1!',
    coachingCategory: 'collegiate',
    sports: ['Soccer'],
    university: 'State University',
};

describe('handleRegisterCoach', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 400 on invalid JSON', async () => {
        const event = { body: 'bad', rawPath: '/auth/register/coach', requestContext: { http: { method: 'POST' } } } as unknown as APIGatewayProxyEventV2;
        const res = await handleRegisterCoach(event) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(400);
    });

    it('returns 400 when required fields are missing', async () => {
        const res = await handleRegisterCoach(makeEvent({})) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(400);
        const body = JSON.parse(res.body as string);
        expect(body.errors.length).toBeGreaterThan(0);
    });

    it('returns 400 when sports array is empty', async () => {
        const res = await handleRegisterCoach(makeEvent({ ...validBody, sports: [] })) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(400);
    });

    it('returns 409 when email already exists', async () => {
        mockQuery.mockResolvedValueOnce([{ exists: true }]);
        const res = await handleRegisterCoach(makeEvent(validBody)) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(409);
    });

    it('returns 201 on successful registration', async () => {
        mockQuery.mockResolvedValueOnce([{ exists: false }]);
        mockHashPassword.mockResolvedValueOnce('hashed-pw');
        mockQuery.mockResolvedValueOnce([{ id: 'new-coach-id' }]);

        const res = await handleRegisterCoach(makeEvent(validBody)) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(201);
        const body = JSON.parse(res.body as string);
        expect(body.success).toBe(true);
        expect(body.coachId).toBe('new-coach-id');
    });

    it('returns 500 when DB throws on email check', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));
        const res = await handleRegisterCoach(makeEvent(validBody)) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(500);
    });

    it('returns 500 when DB throws on INSERT', async () => {
        mockQuery.mockResolvedValueOnce([{ exists: false }]);
        mockHashPassword.mockResolvedValueOnce('hashed-pw');
        mockQuery.mockRejectedValueOnce(new Error('DB error'));
        const res = await handleRegisterCoach(makeEvent(validBody)) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(500);
    });
});
