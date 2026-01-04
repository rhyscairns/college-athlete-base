/**
 * Example test file demonstrating best practices for API route testing
 * This file serves as a template for writing new API route tests
 */

/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server'

// Example API route handlers (would be imported from actual route file)
async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json(
            { error: 'ID is required' },
            { status: 400 }
        )
    }

    return NextResponse.json(
        { id, data: 'example data' },
        { status: 200 }
    )
}

async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        if (!body.name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { id: '123', name: body.name },
            { status: 201 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid JSON' },
            { status: 400 }
        )
    }
}

describe('Example API Route', () => {
    describe('GET', () => {
        // Test 1: Successful request
        it('returns data when ID is provided', async () => {
            const request = new NextRequest('http://localhost:3000/api/example?id=123')
            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toEqual({ id: '123', data: 'example data' })
        })

        // Test 2: Error handling
        it('returns 400 when ID is missing', async () => {
            const request = new NextRequest('http://localhost:3000/api/example')
            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data).toEqual({ error: 'ID is required' })
        })
    })

    describe('POST', () => {
        // Test 3: Successful creation
        it('creates resource with valid data', async () => {
            const request = new NextRequest('http://localhost:3000/api/example', {
                method: 'POST',
                body: JSON.stringify({ name: 'Test Name' }),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(201)
            expect(data).toHaveProperty('id')
            expect(data.name).toBe('Test Name')
        })

        // Test 4: Validation error
        it('returns 400 when name is missing', async () => {
            const request = new NextRequest('http://localhost:3000/api/example', {
                method: 'POST',
                body: JSON.stringify({}),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data).toEqual({ error: 'Name is required' })
        })

        // Test 5: Invalid JSON
        it('returns 400 for invalid JSON', async () => {
            const request = new NextRequest('http://localhost:3000/api/example', {
                method: 'POST',
                body: 'invalid json',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data).toEqual({ error: 'Invalid JSON' })
        })
    })

    // Test 6: Response headers
    it('sets correct content-type header', async () => {
        const request = new NextRequest('http://localhost:3000/api/example?id=123')
        const response = await GET(request)

        expect(response.headers.get('content-type')).toContain('application/json')
    })
})
