// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Load test environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
import { TextEncoder, TextDecoder } from 'util'

// Load .env.test file for integration tests
config({ path: resolve(process.cwd(), '.env.test') })

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Request and Response for Next.js API routes
if (typeof Request === 'undefined') {
    global.Request = class Request {
        constructor(url, init) {
            this.url = url
            this.method = init?.method || 'GET'
            this.headers = new Map(Object.entries(init?.headers || {}))
            this._body = init?.body
        }

        async json() {
            return JSON.parse(this._body)
        }

        async text() {
            return this._body
        }
    }
}

if (typeof Response === 'undefined') {
    global.Response = class Response {
        constructor(body, init) {
            this.body = body
            this.status = init?.status || 200
            this.headers = new Map(Object.entries(init?.headers || {}))
        }

        async json() {
            if (typeof this.body === 'string') {
                return JSON.parse(this.body)
            }
            return this.body
        }

        async text() {
            if (typeof this.body === 'string') {
                return this.body
            }
            return JSON.stringify(this.body)
        }

        static json(data, init) {
            return new Response(JSON.stringify(data), {
                ...init,
                headers: {
                    'Content-Type': 'application/json',
                    ...(init?.headers || {}),
                },
            })
        }
    }
}
