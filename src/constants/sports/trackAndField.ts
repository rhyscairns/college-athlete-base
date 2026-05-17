import type { SportConstants } from './types';

export const trackAndField: SportConstants = {
    sportName: 'Track & Field',
    positions: [],
    events: [
        // Sprints
        '100m',
        '200m',
        '400m',
        // Middle Distance
        '800m',
        '1500m',
        '1 Mile',
        // Long Distance
        '3000m',
        '5000m',
        '10000m',
        // Hurdles
        '100m Hurdles',
        '110m Hurdles',
        '400m Hurdles',
        // Relays
        '4x100m Relay',
        '4x400m Relay',
        // Jumps
        'High Jump',
        'Long Jump',
        'Triple Jump',
        'Pole Vault',
        // Throws
        'Shot Put',
        'Discus',
        'Javelin',
        'Hammer Throw',
        // Combined Events
        'Decathlon',
        'Heptathlon',
        'Pentathlon',
        'Other',
    ],
};
