import { handleRegisterPlayer } from '../../handlers/register-player';
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
        rawPath: '/auth/register/player',
        requestContext: { http: { method: 'POST' } },
    } as unknown as APIGatewayProxyEventV2;
}

const validBody = {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2000-01-01',
    email: 'john@example.com',
    password: 'Password1!',
    sex: 'male',
    sport: 'Soccer',
    gpa: 3.5,
    country: 'UK',
    region: 'London',
};

describe('handleRegisterPlayer', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 400 on invalid JSON', async () => {
        const event = { body: 'bad', rawPath: '/auth/register/player', requestContext: { http: { method: 'POST' } } } as unknown as APIGatewayProxyEventV2;
        const res = await handleRegisterPlayer(event) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(400);
    });

    it('returns 400 when required fields are missing', async () => {
        const res = await handleRegisterPlayer(makeEvent({})) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(400);
        const body = JSON.parse(res.body as string);
        expect(body.errors.length).toBeGreaterThan(0);
    });

    it('returns 400 when email is invalid', async () => {
        const res = await handleRegisterPlayer(makeEvent({ ...validBody, email: 'not-an-email' })) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(400);
    });

    it('returns 400 when password is weak', async () => {
        const res = await handleRegisterPlayer(makeEvent({ ...validBody, password: 'weak' })) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(400);
    });

    it('returns 400 when GPA is out of range', async () => {
        const res = await handleRegisterPlayer(makeEvent({ ...validBody, gpa: 5.0 })) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(400);
    });

    it('returns 400 when USA player has no state', async () => {
        const res = await handleRegisterPlayer(makeEvent({ ...validBody, country: 'USA', state: '' })) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(400);
    });

    it('returns 409 when email already exists', async () => {
        mockQuery.mockResolvedValueOnce([{ exists: true }]);
        const res = await handleRegisterPlayer(makeEvent(validBody)) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(409);
    });

    it('returns 201 on successful registration', async () => {
        mockQuery.mockResolvedValueOnce([{ exists: false }]); // email check
        mockHashPassword.mockResolvedValueOnce('hashed-pw');
        mockQuery.mockResolvedValueOnce([{ id: 'new-player-id' }]); // INSERT

        const res = await handleRegisterPlayer(makeEvent(validBody)) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(201);
        const body = JSON.parse(res.body as string);
        expect(body.success).toBe(true);
        expect(body.playerId).toBe('new-player-id');
    });

    it('returns 500 when DB throws on email check', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));
        const res = await handleRegisterPlayer(makeEvent(validBody)) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(500);
    });

    it('returns 500 when DB throws on INSERT', async () => {
        mockQuery.mockResolvedValueOnce([{ exists: false }]);
        mockHashPassword.mockResolvedValueOnce('hashed-pw');
        mockQuery.mockRejectedValueOnce(new Error('DB error'));
        const res = await handleRegisterPlayer(makeEvent(validBody)) as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(500);
    });
});
