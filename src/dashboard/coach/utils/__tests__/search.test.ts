import {
    heightToInches,
    inchesToHeight,
    buildSearchQueryString,
    parseSearchParams,
} from '../search';
import { SearchCriteria } from '../../types';

describe('heightToInches', () => {
    it('should convert feet and inches format to total inches', () => {
        expect(heightToInches("5'10\"")).toBe(70);
        expect(heightToInches("6'2\"")).toBe(74);
        expect(heightToInches("5'0\"")).toBe(60);
        expect(heightToInches("7'11\"")).toBe(95);
    });

    it('should handle format without closing quote', () => {
        expect(heightToInches("5'10")).toBe(70);
        expect(heightToInches("6'2")).toBe(74);
    });

    it('should handle numeric string (already in inches)', () => {
        expect(heightToInches("70")).toBe(70);
        expect(heightToInches("74")).toBe(74);
        expect(heightToInches("60")).toBe(60);
    });

    it('should return null for invalid formats', () => {
        expect(heightToInches("")).toBe(null);
        expect(heightToInches("abc")).toBe(null);
        expect(heightToInches("5'")).toBe(null);
        expect(heightToInches("'10\"")).toBe(null);
        expect(heightToInches("5-10")).toBe(null);
    });

    it('should return null for invalid inch values (>= 12)', () => {
        expect(heightToInches("5'12\"")).toBe(null);
        expect(heightToInches("5'15\"")).toBe(null);
    });

    it('should return null for negative inches', () => {
        expect(heightToInches("5'-1\"")).toBe(null);
    });

    it('should handle whitespace', () => {
        expect(heightToInches("  5'10\"  ")).toBe(70);
        expect(heightToInches("  70  ")).toBe(70);
    });

    it('should return null for non-string input', () => {
        expect(heightToInches(null as any)).toBe(null);
        expect(heightToInches(undefined as any)).toBe(null);
        expect(heightToInches(70 as any)).toBe(null);
    });
});

describe('inchesToHeight', () => {
    it('should convert inches to feet and inches format', () => {
        expect(inchesToHeight(70)).toBe("5'10\"");
        expect(inchesToHeight(74)).toBe("6'2\"");
        expect(inchesToHeight(60)).toBe("5'0\"");
        expect(inchesToHeight(95)).toBe("7'11\"");
    });

    it('should handle zero inches', () => {
        expect(inchesToHeight(0)).toBe("0'0\"");
    });

    it('should handle inches less than 12', () => {
        expect(inchesToHeight(11)).toBe("0'11\"");
        expect(inchesToHeight(5)).toBe("0'5\"");
    });

    it('should return null for invalid input', () => {
        expect(inchesToHeight(NaN)).toBe(null);
        expect(inchesToHeight(-5)).toBe(null);
        expect(inchesToHeight(null as any)).toBe(null);
        expect(inchesToHeight(undefined as any)).toBe(null);
        expect(inchesToHeight("70" as any)).toBe(null);
    });
});

describe('buildSearchQueryString', () => {
    it('should build query string with all criteria', () => {
        const criteria: SearchCriteria = {
            sport: 'Basketball',
            position: 'Point Guard',
            desiredDivision: 'NCAA D1',
            gpaMin: 3.0,
            gpaMax: 4.0,
            affordableAmount: 10000,
            heightMin: "5'10\"",
            heightMax: "6'5\"",
            weightMin: 170,
            weightMax: 220,
        };

        const queryString = buildSearchQueryString(criteria);
        const params = new URLSearchParams(queryString);

        expect(params.get('sport')).toBe('Basketball');
        expect(params.get('position')).toBe('Point Guard');
        expect(params.get('desiredDivision')).toBe('NCAA D1');
        expect(params.get('gpaMin')).toBe('3');
        expect(params.get('gpaMax')).toBe('4');
        expect(params.get('affordableAmount')).toBe('10000');
        expect(params.get('heightMin')).toBe('70');
        expect(params.get('heightMax')).toBe('77');
        expect(params.get('weightMin')).toBe('170');
        expect(params.get('weightMax')).toBe('220');
    });

    it('should build query string with partial criteria', () => {
        const criteria: SearchCriteria = {
            sport: 'Basketball',
            gpaMin: 3.0,
        };

        const queryString = buildSearchQueryString(criteria);
        const params = new URLSearchParams(queryString);

        expect(params.get('sport')).toBe('Basketball');
        expect(params.get('gpaMin')).toBe('3');
        expect(params.get('position')).toBe(null);
        expect(params.get('gpaMax')).toBe(null);
    });

    it('should handle empty criteria', () => {
        const criteria: SearchCriteria = {};
        const queryString = buildSearchQueryString(criteria);
        expect(queryString).toBe('');
    });

    it('should convert height formats to inches in query string', () => {
        const criteria: SearchCriteria = {
            heightMin: "5'10\"",
            heightMax: "6'2\"",
        };

        const queryString = buildSearchQueryString(criteria);
        const params = new URLSearchParams(queryString);

        expect(params.get('heightMin')).toBe('70');
        expect(params.get('heightMax')).toBe('74');
    });

    it('should handle numeric height values', () => {
        const criteria: SearchCriteria = {
            heightMin: "70",
            heightMax: "74",
        };

        const queryString = buildSearchQueryString(criteria);
        const params = new URLSearchParams(queryString);

        expect(params.get('heightMin')).toBe('70');
        expect(params.get('heightMax')).toBe('74');
    });

    it('should skip invalid height values', () => {
        const criteria: SearchCriteria = {
            heightMin: "invalid",
            heightMax: "also-invalid",
        };

        const queryString = buildSearchQueryString(criteria);
        const params = new URLSearchParams(queryString);

        expect(params.get('heightMin')).toBe(null);
        expect(params.get('heightMax')).toBe(null);
    });

    it('should handle zero values', () => {
        const criteria: SearchCriteria = {
            gpaMin: 0,
            weightMin: 0,
        };

        const queryString = buildSearchQueryString(criteria);
        const params = new URLSearchParams(queryString);

        expect(params.get('gpaMin')).toBe('0');
        expect(params.get('weightMin')).toBe('0');
    });

    it('should properly encode special characters', () => {
        const criteria: SearchCriteria = {
            sport: 'Track & Field',
            position: 'Long Jump/Triple Jump',
        };

        const queryString = buildSearchQueryString(criteria);
        const params = new URLSearchParams(queryString);

        expect(params.get('sport')).toBe('Track & Field');
        expect(params.get('position')).toBe('Long Jump/Triple Jump');
    });
});

describe('parseSearchParams', () => {
    it('should parse URLSearchParams with all criteria', () => {
        const params = new URLSearchParams({
            sport: 'Basketball',
            position: 'Point Guard',
            desiredDivision: 'NCAA D1',
            gpaMin: '3.0',
            gpaMax: '4.0',
            affordableAmount: '10000',
            heightMin: '70',
            heightMax: '77',
            weightMin: '170',
            weightMax: '220',
        });

        const criteria = parseSearchParams(params);

        expect(criteria.sport).toBe('Basketball');
        expect(criteria.position).toBe('Point Guard');
        expect(criteria.desiredDivision).toBe('NCAA D1');
        expect(criteria.gpaMin).toBe(3.0);
        expect(criteria.gpaMax).toBe(4.0);
        expect(criteria.affordableAmount).toBe(10000);
        expect(criteria.heightMin).toBe("5'10\"");
        expect(criteria.heightMax).toBe("6'5\"");
        expect(criteria.weightMin).toBe(170);
        expect(criteria.weightMax).toBe(220);
    });

    it('should parse object with string values', () => {
        const params = {
            sport: 'Basketball',
            gpaMin: '3.0',
            heightMin: '70',
        };

        const criteria = parseSearchParams(params);

        expect(criteria.sport).toBe('Basketball');
        expect(criteria.gpaMin).toBe(3.0);
        expect(criteria.heightMin).toBe("5'10\"");
    });

    it('should handle partial parameters', () => {
        const params = new URLSearchParams({
            sport: 'Basketball',
            gpaMin: '3.0',
        });

        const criteria = parseSearchParams(params);

        expect(criteria.sport).toBe('Basketball');
        expect(criteria.gpaMin).toBe(3.0);
        expect(criteria.position).toBeUndefined();
        expect(criteria.gpaMax).toBeUndefined();
    });

    it('should handle empty parameters', () => {
        const params = new URLSearchParams();
        const criteria = parseSearchParams(params);

        expect(Object.keys(criteria).length).toBe(0);
    });

    it('should skip invalid numeric values', () => {
        const params = new URLSearchParams({
            gpaMin: 'invalid',
            weightMin: 'not-a-number',
            heightMin: 'abc',
        });

        const criteria = parseSearchParams(params);

        expect(criteria.gpaMin).toBeUndefined();
        expect(criteria.weightMin).toBeUndefined();
        expect(criteria.heightMin).toBeUndefined();
    });

    it('should convert height from inches to feet/inches format', () => {
        const params = new URLSearchParams({
            heightMin: '70',
            heightMax: '74',
        });

        const criteria = parseSearchParams(params);

        expect(criteria.heightMin).toBe("5'10\"");
        expect(criteria.heightMax).toBe("6'2\"");
    });

    it('should handle array values in object (take first value)', () => {
        const params = {
            sport: ['Basketball', 'Football'],
            gpaMin: ['3.0', '2.5'],
        };

        const criteria = parseSearchParams(params);

        expect(criteria.sport).toBe('Basketball');
        expect(criteria.gpaMin).toBe(3.0);
    });

    it('should handle decimal GPA values', () => {
        const params = new URLSearchParams({
            gpaMin: '3.5',
            gpaMax: '3.75',
        });

        const criteria = parseSearchParams(params);

        expect(criteria.gpaMin).toBe(3.5);
        expect(criteria.gpaMax).toBe(3.75);
    });

    it('should properly decode special characters', () => {
        const params = new URLSearchParams('sport=Track%20%26%20Field&position=Long%20Jump%2FTriple%20Jump');

        const criteria = parseSearchParams(params);

        expect(criteria.sport).toBe('Track & Field');
        expect(criteria.position).toBe('Long Jump/Triple Jump');
    });
});

describe('round-trip conversion', () => {
    it('should maintain data integrity through build and parse cycle', () => {
        const original: SearchCriteria = {
            sport: 'Basketball',
            position: 'Point Guard',
            desiredDivision: 'NCAA D1',
            gpaMin: 3.0,
            gpaMax: 4.0,
            affordableAmount: 10000,
            heightMin: "5'10\"",
            heightMax: "6'5\"",
            weightMin: 170,
            weightMax: 220,
        };

        const queryString = buildSearchQueryString(original);
        const params = new URLSearchParams(queryString);
        const parsed = parseSearchParams(params);

        expect(parsed.sport).toBe(original.sport);
        expect(parsed.position).toBe(original.position);
        expect(parsed.desiredDivision).toBe(original.desiredDivision);
        expect(parsed.gpaMin).toBe(original.gpaMin);
        expect(parsed.gpaMax).toBe(original.gpaMax);
        expect(parsed.affordableAmount).toBe(original.affordableAmount);
        expect(parsed.heightMin).toBe(original.heightMin);
        expect(parsed.heightMax).toBe(original.heightMax);
        expect(parsed.weightMin).toBe(original.weightMin);
        expect(parsed.weightMax).toBe(original.weightMax);
    });
});
