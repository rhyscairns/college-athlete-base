/**
 * Mock implementation of database client for testing
 */

export const query = jest.fn();
export const getClient = jest.fn();
export const getPool = jest.fn();
export const checkHealth = jest.fn();
export const closePool = jest.fn();
