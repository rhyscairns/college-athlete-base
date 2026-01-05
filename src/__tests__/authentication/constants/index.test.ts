import {
    SEX_OPTIONS,
    SPORTS_LIST,
    COUNTRIES_LIST,
    US_STATES_LIST,
} from '@/authentication/constants';

describe('Authentication Constants', () => {
    describe('SEX_OPTIONS', () => {
        it('should have male and female options', () => {
            expect(SEX_OPTIONS).toHaveLength(2);
            expect(SEX_OPTIONS.map((s) => s.value)).toEqual([
                'male',
                'female',
            ]);
        });

        it('should have proper structure with value and label', () => {
            SEX_OPTIONS.forEach((option) => {
                expect(option).toHaveProperty('value');
                expect(option).toHaveProperty('label');
                expect(typeof option.value).toBe('string');
                expect(typeof option.label).toBe('string');
            });
        });
    });

    describe('SPORTS_LIST', () => {
        it('should have multiple sports options', () => {
            expect(SPORTS_LIST.length).toBeGreaterThan(0);
        });

        it('should have proper structure with value and label', () => {
            SPORTS_LIST.forEach((option) => {
                expect(option).toHaveProperty('value');
                expect(option).toHaveProperty('label');
                expect(typeof option.value).toBe('string');
                expect(typeof option.label).toBe('string');
            });
        });

        it('should include common college sports', () => {
            const sportValues = SPORTS_LIST.map((s) => s.value);
            expect(sportValues).toContain('basketball');
            expect(sportValues).toContain('football');
            expect(sportValues).toContain('soccer');
            expect(sportValues).toContain('baseball');
        });
    });

    describe('COUNTRIES_LIST', () => {
        it('should have multiple country options', () => {
            expect(COUNTRIES_LIST.length).toBeGreaterThan(0);
        });

        it('should have proper structure with value and label', () => {
            COUNTRIES_LIST.forEach((option) => {
                expect(option).toHaveProperty('value');
                expect(option).toHaveProperty('label');
                expect(typeof option.value).toBe('string');
                expect(typeof option.label).toBe('string');
            });
        });

        it('should include USA as first option', () => {
            expect(COUNTRIES_LIST[0].value).toBe('USA');
            expect(COUNTRIES_LIST[0].label).toBe('United States');
        });

        it('should include common countries', () => {
            const countryValues = COUNTRIES_LIST.map((c) => c.value);
            expect(countryValues).toContain('USA');
            expect(countryValues).toContain('CAN');
            expect(countryValues).toContain('MEX');
            expect(countryValues).toContain('GBR');
        });
    });

    describe('US_STATES_LIST', () => {
        it('should have all 50 states plus DC', () => {
            expect(US_STATES_LIST).toHaveLength(51);
        });

        it('should have proper structure with value and label', () => {
            US_STATES_LIST.forEach((option) => {
                expect(option).toHaveProperty('value');
                expect(option).toHaveProperty('label');
                expect(typeof option.value).toBe('string');
                expect(typeof option.label).toBe('string');
            });
        });

        it('should use two-letter state codes as values', () => {
            US_STATES_LIST.forEach((state) => {
                expect(state.value).toHaveLength(2);
                expect(state.value).toMatch(/^[A-Z]{2}$/);
            });
        });

        it('should include common states', () => {
            const stateValues = US_STATES_LIST.map((s) => s.value);
            expect(stateValues).toContain('CA');
            expect(stateValues).toContain('NY');
            expect(stateValues).toContain('TX');
            expect(stateValues).toContain('FL');
            expect(stateValues).toContain('DC');
        });
    });
});
