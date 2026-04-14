/**
 * @jest-environment node
 * 
 * Tests for /api/dashboard/athletes/search endpoint
 */

import { GET } from '@/app/api/dashboard/athletes/search/route';
import { searchAthletes } from '@/lib/db/queries/athletes';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/db/queries/athletes');
jest.mock('@/lib/logger');

const mockSearchAthletes = searchAthletes as jest.MockedFunction<typeof searchAthletes>;

describe('GET /api/dashboard/athletes/search', () => {
    const createRequest = (url: string) => {
        return new NextRequest(url, {
            method: 'GET',
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('successful searches', () => {
        it('should return athletes with no filters', async () => {
            mockSearchAthletes.mockResolvedValueOnce({
                athletes: [
                    {
                        id: '123',
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john@example.com',
                        sport: 'Basketball',
                        position: 'Guard',
                        gpa: 3.5,
                        heightInches: 74,
                        weightLbs: 180,
                        desiredDivision: 'NCAA D1',
                        affordableAmount: 50000,
                        profileImageUrl: 'https://example.com/image.jpg',
                        videoUrl: 'https://youtube.com/watch?v=123',
                    },
                ],
                totalCount: 1,
            });

            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.athletes).toHaveLength(1);
            expect(data.data.athletes[0]).toMatchObject({
                id: '123',
                firstName: 'John',
                lastName: 'Doe',
                sport: 'Basketball',
                position: 'Guard',
                gpa: 3.5,
            });
            expect(data.data.pagination).toMatchObject({
                currentPage: 1,
                totalPages: 1,
                totalCount: 1,
                pageSize: 20,
            });
        });

        it('should filter by sport', async () => {
            mockSearchAthletes.mockResolvedValueOnce({
                athletes: [],
                totalCount: 0,
            });

            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?sport=Football');
            await GET(request);

            expect(mockSearchAthletes).toHaveBeenCalledWith(
                expect.objectContaining({ sport: 'Football' }),
                expect.any(Object)
            );
        });

        it('should filter by position', async () => {
            mockSearchAthletes.mockResolvedValueOnce({
                athletes: [],
                totalCount: 0,
            });

            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?position=Quarterback');
            await GET(request);

            expect(mockSearchAthletes).toHaveBeenCalledWith(
                expect.objectContaining({ position: 'Quarterback' }),
                expect.any(Object)
            );
        });

        it('should filter by desired division', async () => {
            mockSearchAthletes.mockResolvedValueOnce({
                athletes: [],
                totalCount: 0,
            });

            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?desiredDivision=NCAA%20D1');
            await GET(request);

            expect(mockSearchAthletes).toHaveBeenCalledWith(
                expect.objectContaining({ desiredDivision: 'NCAA D1' }),
                expect.any(Object)
            );
        });

        it('should filter by GPA range', async () => {
            mockSearchAthletes.mockResolvedValueOnce({
                athletes: [],
                totalCount: 0,
            });

            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?gpaMin=3.0&gpaMax=4.0');
            await GET(request);

            expect(mockSearchAthletes).toHaveBeenCalledWith(
                expect.objectContaining({ gpaMin: 3.0, gpaMax: 4.0 }),
                expect.any(Object)
            );
        });

        it('should filter by affordable amount', async () => {
            mockSearchAthletes.mockResolvedValueOnce({
                athletes: [],
                totalCount: 0,
            });

            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?affordableAmount=25000');
            await GET(request);

            expect(mockSearchAthletes).toHaveBeenCalledWith(
                expect.objectContaining({ affordableAmount: 25000 }),
                expect.any(Object)
            );
        });

        it('should filter by height range', async () => {
            mockSearchAthletes.mockResolvedValueOnce({
                athletes: [],
                totalCount: 0,
            });

            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?heightMin=70&heightMax=80');
            await GET(request);

            expect(mockSearchAthletes).toHaveBeenCalledWith(
                expect.objectContaining({ heightMin: '70', heightMax: '80' }),
                expect.any(Object)
            );
        });

        it('should filter by weight range', async () => {
            mockSearchAthletes.mockResolvedValueOnce({
                athletes: [],
                totalCount: 0,
            });

            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?weightMin=150&weightMax=200');
            await GET(request);

            expect(mockSearchAthletes).toHaveBeenCalledWith(
                expect.objectContaining({ weightMin: 150, weightMax: 200 }),
                expect.any(Object)
            );
        });

        it('should handle pagination', async () => {
            mockSearchAthletes.mockResolvedValueOnce({
                athletes: [],
                totalCount: 50,
            });

            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?page=2&pageSize=10');
            const response = await GET(request);
            const data = await response.json();

            expect(mockSearchAthletes).toHaveBeenCalledWith(
                expect.any(Object),
                { page: 2, pageSize: 10 }
            );
            expect(data.data.pagination).toMatchObject({
                currentPage: 2,
                totalPages: 5,
                totalCount: 50,
                pageSize: 10,
            });
        });

        it('should apply multiple filters together', async () => {
            mockSearchAthletes.mockResolvedValueOnce({
                athletes: [],
                totalCount: 0,
            });

            const request = createRequest(
                'http://localhost:3000/api/dashboard/athletes/search?sport=Basketball&gpaMin=3.5&affordableAmount=30000'
            );
            await GET(request);

            expect(mockSearchAthletes).toHaveBeenCalledWith(
                expect.objectContaining({
                    sport: 'Basketball',
                    gpaMin: 3.5,
                    affordableAmount: 30000,
                }),
                expect.any(Object)
            );
        });
    });

    describe('validation errors', () => {
        it('should reject invalid page number', async () => {
            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?page=0');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'page' })
            );
        });

        it('should reject invalid page size', async () => {
            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?pageSize=-1');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'pageSize' })
            );
        });

        it('should reject page size exceeding maximum', async () => {
            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?pageSize=150');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'pageSize', message: expect.stringContaining('100') })
            );
        });

        it('should reject invalid desired division', async () => {
            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?desiredDivision=Invalid');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'desiredDivision' })
            );
        });

        it('should reject GPA min out of range', async () => {
            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?gpaMin=5.0');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'gpaMin' })
            );
        });

        it('should reject GPA max out of range', async () => {
            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?gpaMax=-1.0');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'gpaMax' })
            );
        });

        it('should reject GPA min greater than GPA max', async () => {
            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?gpaMin=3.5&gpaMax=2.5');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'gpa' })
            );
        });

        it('should reject negative affordable amount', async () => {
            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?affordableAmount=-1000');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'affordableAmount' })
            );
        });

        it('should reject invalid weight min', async () => {
            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?weightMin=0');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'weightMin' })
            );
        });

        it('should reject weight min greater than weight max', async () => {
            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?weightMin=200&weightMax=150');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'weight' })
            );
        });
    });

    describe('error handling', () => {
        it('should handle database errors gracefully', async () => {
            mockSearchAthletes.mockRejectedValueOnce(new Error('Database connection failed'));

            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('An unexpected error occurred');
        });
    });

    describe('response format', () => {
        it('should include filters in response', async () => {
            mockSearchAthletes.mockResolvedValueOnce({
                athletes: [],
                totalCount: 0,
            });

            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search?sport=Soccer&gpaMin=3.0');
            const response = await GET(request);
            const data = await response.json();

            expect(data.data.filters).toMatchObject({
                sport: 'Soccer',
                gpaMin: 3.0,
            });
        });

        it('should set cache headers', async () => {
            mockSearchAthletes.mockResolvedValueOnce({
                athletes: [],
                totalCount: 0,
            });

            const request = createRequest('http://localhost:3000/api/dashboard/athletes/search');
            const response = await GET(request);

            expect(response.headers.get('Cache-Control')).toContain('s-maxage=60');
        });
    });
});
