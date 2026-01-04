/**
 * Mock API response helpers for testing
 */

export const mockApiResponse = <T>(data: T, status = 200) => {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => data,
        text: async () => JSON.stringify(data),
    } as Response
}

export const mockApiError = (message: string, status = 500) => {
    return {
        ok: false,
        status,
        json: async () => ({ error: message }),
        text: async () => JSON.stringify({ error: message }),
    } as Response
}

/**
 * Mock fetch for testing API calls
 */
export const mockFetch = (response: Response) => {
    global.fetch = jest.fn(() => Promise.resolve(response))
}

/**
 * Reset fetch mock
 */
export const resetFetchMock = () => {
    if (global.fetch && typeof global.fetch === 'function') {
        (global.fetch as jest.Mock).mockReset()
    }
}
