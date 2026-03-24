import type { SportConstants } from './types';
import { baseball } from './baseball';
import { basketball } from './basketball';
import { cheerleading } from './cheerleading';
import { crossCountry } from './crossCountry';
import { danceTeam } from './danceTeam';
import { fencing } from './fencing';
import { fieldHockey } from './fieldHockey';
import { football } from './football';
import { golf } from './golf';
import { lacrosse } from './lacrosse';
import { marchingBand } from './marchingBand';
import { rowing } from './rowing';
import { soccer } from './soccer';
import { softball } from './softball';
import { swimming } from './swimming';
import { swimmingAndDiving } from './swimmingAndDiving';
import { tennis } from './tennis';
import { trackAndField } from './trackAndField';
import { volleyball } from './volleyball';
import { wrestling } from './wrestling';

export * from './types';

// Export individual sports
export {
    baseball,
    basketball,
    cheerleading,
    crossCountry,
    danceTeam,
    fencing,
    fieldHockey,
    football,
    golf,
    lacrosse,
    marchingBand,
    rowing,
    soccer,
    softball,
    swimming,
    swimmingAndDiving,
    tennis,
    trackAndField,
    volleyball,
    wrestling,
};

// All sports in an array for easy iteration (alphabetically sorted)
export const allSports: SportConstants[] = [
    baseball,
    basketball,
    cheerleading,
    crossCountry,
    danceTeam,
    fencing,
    fieldHockey,
    football,
    golf,
    lacrosse,
    marchingBand,
    rowing,
    soccer,
    softball,
    swimming,
    swimmingAndDiving,
    tennis,
    trackAndField,
    volleyball,
    wrestling,
];

// Map of sport names to their constants for quick lookup
export const sportsMap: Record<string, SportConstants> = {
    Baseball: baseball,
    Basketball: basketball,
    Cheerleading: cheerleading,
    'Cross Country': crossCountry,
    'Dance Team': danceTeam,
    Fencing: fencing,
    'Field Hockey': fieldHockey,
    Football: football,
    Golf: golf,
    Lacrosse: lacrosse,
    'Marching Band': marchingBand,
    Rowing: rowing,
    Soccer: soccer,
    Softball: softball,
    Swimming: swimming,
    'Swimming & Diving': swimmingAndDiving,
    Tennis: tennis,
    'Track & Field': trackAndField,
    Volleyball: volleyball,
    Wrestling: wrestling,
};

// Utility functions
export const getSportByName = (sportName: string): SportConstants | undefined => {
    return sportsMap[sportName];
};

export const getPositionsForSport = (sportName: string): string[] => {
    const sport = getSportByName(sportName);
    return sport?.positions || [];
};

export const getEventsForSport = (sportName: string): string[] => {
    const sport = getSportByName(sportName);
    return sport?.events || [];
};

export const getAllSportNames = (): string[] => {
    return allSports.map((sport) => sport.sportName);
};

export const hasSportPositions = (sportName: string): boolean => {
    const sport = getSportByName(sportName);
    return (sport?.positions.length || 0) > 0;
};

export const hasSportEvents = (sportName: string): boolean => {
    const sport = getSportByName(sportName);
    return (sport?.events.length || 0) > 0;
};
