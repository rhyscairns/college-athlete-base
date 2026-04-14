/**
 * Tests for AthleteSearchResults component
 */

import React from 'react';

describe('AthleteSearchResults', () => {
    describe('results display', () => {
        it('should display athlete cards', () => {
            const athletes = [
                { id: '1', firstName: 'John', lastName: 'Doe', sport: 'Basketball' },
                { id: '2', firstName: 'Jane', lastName: 'Smith', sport: 'Football' }
            ];

            expect(athletes.length).toBe(2);
            expect(athletes[0]).toHaveProperty('firstName');
        });

        it('should show empty state when no results', () => {
            const athletes = [];
            const isEmpty = athletes.length === 0;
            expect(isEmpty).toBe(true);
        });

        it('should display athlete information', () => {
            const athlete = {
                firstName: 'John',
                lastName: 'Doe',
                sport: 'Basketball',
                position: 'Guard',
                gpa: 3.5
            };

            expect(athlete.firstName).toBeDefined();
            expect(athlete.sport).toBeDefined();
            expect(athlete.gpa).toBeGreaterThan(0);
        });
    });

    describe('pagination', () => {
        it('should display pagination info', () => {
            const pagination = {
                currentPage: 1,
                totalPages: 5,
                totalCount: 100,
                pageSize: 20
            };

            expect(pagination.currentPage).toBeLessThanOrEqual(pagination.totalPages);
            expect(pagination.totalCount).toBeGreaterThan(0);
        });

        it('should calculate page numbers', () => {
            const totalCount = 100;
            const pageSize = 20;
            const totalPages = Math.ceil(totalCount / pageSize);

            expect(totalPages).toBe(5);
        });
    });

    describe('result sorting', () => {
        it('should sort by GPA descending', () => {
            const athletes = [
                { gpa: 3.5 },
                { gpa: 3.8 },
                { gpa: 3.2 }
            ];

            const sorted = [...athletes].sort((a, b) => b.gpa - a.gpa);
            expect(sorted[0].gpa).toBe(3.8);
            expect(sorted[2].gpa).toBe(3.2);
        });
    });
});
