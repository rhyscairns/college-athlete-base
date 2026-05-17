import { SearchCriteria } from '../types';

/**
 * Converts height in "feet'inches"" format to total inches
 * @param height - Height string in format "5'10"" or just "70"
 * @returns Total height in inches, or null if invalid
 * @example
 * heightToInches("5'10\"") // returns 70
 * heightToInches("6'2\"") // returns 74
 * heightToInches("70") // returns 70
 */
export function heightToInches(height: string): number | null {
    if (!height || typeof height !== 'string') {
        return null;
    }

    const trimmed = height.trim();

    // Check if it's already in inches (just a number)
    const numericMatch = trimmed.match(/^(\d+)$/);
    if (numericMatch) {
        const inches = parseInt(numericMatch[1], 10);
        return isNaN(inches) ? null : inches;
    }

    // Parse feet'inches" format
    const feetInchesMatch = trimmed.match(/^(\d+)'(\d+)"?$/);
    if (feetInchesMatch) {
        const feet = parseInt(feetInchesMatch[1], 10);
        const inches = parseInt(feetInchesMatch[2], 10);

        if (isNaN(feet) || isNaN(inches) || inches >= 12 || inches < 0) {
            return null;
        }

        return feet * 12 + inches;
    }

    return null;
}

/**
 * Converts height in inches to "feet'inches"" format
 * @param inches - Total height in inches
 * @returns Height string in format "5'10""
 * @example
 * inchesToHeight(70) // returns "5'10\""
 * inchesToHeight(74) // returns "6'2\""
 */
export function inchesToHeight(inches: number): string | null {
    if (typeof inches !== 'number' || isNaN(inches) || inches < 0) {
        return null;
    }

    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;

    return `${feet}'${remainingInches}"`;
}

/**
 * Builds a URL query string from SearchCriteria object
 * @param criteria - Search criteria object
 * @returns URL query string (without leading '?')
 * @example
 * buildSearchQueryString({ sport: 'Basketball', gpaMin: 3.0 })
 * // returns "sport=Basketball&gpaMin=3.0"
 */
export function buildSearchQueryString(criteria: SearchCriteria): string {
    const params = new URLSearchParams();

    if (criteria.sport) {
        params.append('sport', criteria.sport);
    }

    if (criteria.position) {
        params.append('position', criteria.position);
    }

    if (criteria.desiredDivision) {
        params.append('desiredDivision', criteria.desiredDivision);
    }

    if (criteria.gpaMin !== undefined && criteria.gpaMin !== null) {
        params.append('gpaMin', criteria.gpaMin.toString());
    }

    if (criteria.gpaMax !== undefined && criteria.gpaMax !== null) {
        params.append('gpaMax', criteria.gpaMax.toString());
    }

    if (criteria.affordableAmount !== undefined && criteria.affordableAmount !== null) {
        params.append('affordableAmount', criteria.affordableAmount.toString());
    }

    if (criteria.heightMin) {
        const heightInInches = heightToInches(criteria.heightMin);
        if (heightInInches !== null) {
            params.append('heightMin', heightInInches.toString());
        }
    }

    if (criteria.heightMax) {
        const heightInInches = heightToInches(criteria.heightMax);
        if (heightInInches !== null) {
            params.append('heightMax', heightInInches.toString());
        }
    }

    if (criteria.weightMin !== undefined && criteria.weightMin !== null) {
        params.append('weightMin', criteria.weightMin.toString());
    }

    if (criteria.weightMax !== undefined && criteria.weightMax !== null) {
        params.append('weightMax', criteria.weightMax.toString());
    }

    if (criteria.country) {
        params.append('country', criteria.country);
    }

    if (criteria.state) {
        params.append('state', criteria.state);
    }

    return params.toString();
}

/**
 * Parses URL search parameters into SearchCriteria object
 * @param searchParams - URLSearchParams or object with string values
 * @returns SearchCriteria object
 * @example
 * parseSearchParams(new URLSearchParams("sport=Basketball&gpaMin=3.0"))
 * // returns { sport: 'Basketball', gpaMin: 3.0 }
 */
export function parseSearchParams(
    searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): SearchCriteria {
    const criteria: SearchCriteria = {};

    // Helper to get a single string value
    const getValue = (key: string): string | undefined => {
        if (searchParams instanceof URLSearchParams) {
            return searchParams.get(key) || undefined;
        }
        const value = searchParams[key];
        return Array.isArray(value) ? value[0] : value;
    };

    const sport = getValue('sport');
    if (sport) {
        criteria.sport = sport;
    }

    const position = getValue('position');
    if (position) {
        criteria.position = position;
    }

    const desiredDivision = getValue('desiredDivision');
    if (desiredDivision) {
        criteria.desiredDivision = desiredDivision;
    }

    const gpaMin = getValue('gpaMin');
    if (gpaMin) {
        const parsed = parseFloat(gpaMin);
        if (!isNaN(parsed)) {
            criteria.gpaMin = parsed;
        }
    }

    const gpaMax = getValue('gpaMax');
    if (gpaMax) {
        const parsed = parseFloat(gpaMax);
        if (!isNaN(parsed)) {
            criteria.gpaMax = parsed;
        }
    }

    const affordableAmount = getValue('affordableAmount');
    if (affordableAmount) {
        const parsed = parseFloat(affordableAmount);
        if (!isNaN(parsed)) {
            criteria.affordableAmount = parsed;
        }
    }

    const heightMin = getValue('heightMin');
    if (heightMin) {
        const parsed = parseInt(heightMin, 10);
        if (!isNaN(parsed)) {
            const heightStr = inchesToHeight(parsed);
            if (heightStr) {
                criteria.heightMin = heightStr;
            }
        }
    }

    const heightMax = getValue('heightMax');
    if (heightMax) {
        const parsed = parseInt(heightMax, 10);
        if (!isNaN(parsed)) {
            const heightStr = inchesToHeight(parsed);
            if (heightStr) {
                criteria.heightMax = heightStr;
            }
        }
    }

    const weightMin = getValue('weightMin');
    if (weightMin) {
        const parsed = parseFloat(weightMin);
        if (!isNaN(parsed)) {
            criteria.weightMin = parsed;
        }
    }

    const weightMax = getValue('weightMax');
    if (weightMax) {
        const parsed = parseFloat(weightMax);
        if (!isNaN(parsed)) {
            criteria.weightMax = parsed;
        }
    }

    const country = getValue('country');
    if (country) criteria.country = country;

    const state = getValue('state');
    if (state) criteria.state = state;

    return criteria;
}
