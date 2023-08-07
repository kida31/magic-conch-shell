/**
 * General use types for music
 */

// RepeatMode
export type RepeatMode = 'off' | '1' | 'all' | 'auto';

export function isRepeatMode(text: string): text is RepeatMode {
    return text === 'off' || text === '1' || text === 'all' || text === 'auto';
}


