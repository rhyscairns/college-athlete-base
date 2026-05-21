import { handleLogin } from '../../handlers/login';
import * as dbClient from '../../db/client';
import * as passwordUtils from '../../utils/password';
import * as jwtUtils from '../../utils/jwt';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

jest.mock('../../db/client');
jest.mock('../../utils/password');
jest.mock('../../utils/jwt');

const mockQuery = dbClient.query as jest.MockedFunction<typeof dbClient.query>;
const mockVerifyPassword = passwordUtils.verifyPassword as jest.MockedFunction<typeof passwordUtils.verifyPassword>;
const mockGenerateToken = jwtUtils.generateToken as jest.MockedFunction<typeof jwtUtils.generateToken>;

function makeEvent(body: unknown): APIGatewayProxyEventV2 {
    return {
        body: JSON.stringify(body),
        rawPath: '/auth/login/player',
        requestContext: { http: { method: 'POST' } },
    } as unknown as APIGatewayProxyEventV2;
}

describe('handleLogin', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 400 when email is missing', async () => {
        const res = await handleLogin(makeEvent({ password: 'Password1!' }), 'player') as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(400);
        const body = JSON.parse(res.body as string);
        expect(body.success).toBe(false);
        expect(body.errors.some((e: { field: string }) => e.field === 'email')).toBe(true);
    });

    it('returns 400 when password is too short', async () => {
        const res = await handleLogin(makeEvent({ email: 'test@example.com', password: 'short' }), 'player') as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(400);
    });

    it('returns 400 on invalid JSON body', async () => {
        const event = { body: 'not-json', rawPath: '/auth/login/player', requestContext: { http: { method: 'POST' } } } as unknown as APIGatewayProxyEventV2;
        const res = await handleLogin(event, 'player') as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(400);
    });

    it('returns 401 when user not found', async () => {
        mockQuery.mockResolvedValueOnce([]);
        const res = await handleLogin(makeEvent({ email: 'nobody@example.com', password: 'Password1!' }), 'player') as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(401);
    });

    it('returns 401 when password is wrong', async () => {
        mockQuery.mockResolvedValueOnce([{ id: 'uuid-1', email: 'test@example.com', password_hash: 'hash' }]);
        mockVerifyPassword.mockResolvedValueOnce(false);
        const res = await handleLogin(makeEvent({ email: 'test@example.com', password: 'WrongPass1!' }), 'player') as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(401);
    });

    it('returns 200 with token on successful player login', async () => {
        mockQuery.mockResolvedValueOnce([{ id: 'uuid-1', email: 'test@example.com', password_hash: 'hash' }]);
        mockVerifyPassword.mockResolvedValueOnce(true);
        mockGenerateToken.mockResolvedValueOnce('jwt-token');

        const res = await handleLogin(makeEvent({ email: 'test@example.com', password: 'Password1!' }), 'player') as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body as string);
        expect(body.success).toBe(true);
        expect(body.token).toBe('jwt-token');
        expect(body.playerId).toBe('uuid-1');
    });

    it('returns 200 with coachId on successful coach login', async () => {
        mockQuery.mockResolvedValueOnce([{ id: 'coach-1', email: 'coach@example.com', password_hash: 'hash' }]);
        mockVerifyPassword.mockResolvedValueOnce(true);
        mockGenerateToken.mockResolvedValueOnce('coach-token');

        const res = await handleLogin(makeEvent({ email: 'coach@example.com', password: 'Password1!' }), 'coach') as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body as string);
        expect(body.coachId).toBe('coach-1');
    });

    it('returns 500 when DB throws', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB down'));
        const res = await handleLogin(makeEvent({ email: 'test@example.com', password: 'Password1!' }), 'player') as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(500);
    });

    it('returns 500 when token generation fails', async () => {
        mockQuery.mockResolvedValueOnce([{ id: 'uuid-1', email: 'test@example.com', password_hash: 'hash' }]);
        mockVerifyPassword.mockResolvedValueOnce(true);
        mockGenerateToken.mockRejectedValueOnce(new Error('JWT error'));
        const res = await handleLogin(makeEvent({ email: 'test@example.com', password: 'Password1!' }), 'player') as APIGatewayProxyStructuredResultV2;
        expect(res.statusCode).toBe(500);
    });
});
