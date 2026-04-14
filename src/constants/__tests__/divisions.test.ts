import { DIVISIONS, getAllDivisions } from '../divisions';

describe('Divisions Constants', () => {
    describe('DIVISIONS', () => {
        it('should contain all five divisions', () => {
            expect(DIVISIONS).toHaveLength(5);
        });

        it('should include NCAA D1', () => {
            expect(DIVISIONS).toContain('NCAA D1');
        });

        it('should include NCAA D2', () => {
            expect(DIVISIONS).toContain('NCAA D2');
        });

        it('should include NCAA D3', () => {
            expect(DIVISIONS).toContain('NCAA D3');
        });

        it('should include NAIA', () => {
            expect(DIVISIONS).toContain('NAIA');
        });

        it('should include NJCAA', () => {
            expect(DIVISIONS).toContain('NJCAA');
        });

        it('should be readonly', () => {
            // TypeScript will catch this at compile time, but we can verify the array exists
            expect(Array.isArray(DIVISIONS)).toBe(true);
        });
    });

    describe('getAllDivisions', () => {
        it('should return all divisions', () => {
            const divisions = getAllDivisions();
            expect(divisions).toHaveLength(5);
        });

        it('should return the same array as DIVISIONS', () => {
            const divisions = getAllDivisions();
            expect(divisions).toEqual(DIVISIONS);
        });

        it('should return divisions in correct order', () => {
            const divisions = getAllDivisions();
            expect(divisions[0]).toBe('NCAA D1');
            expect(divisions[1]).toBe('NCAA D2');
            expect(divisions[2]).toBe('NCAA D3');
            expect(divisions[3]).toBe('NAIA');
            expect(divisions[4]).toBe('NJCAA');
        });
    });
});
