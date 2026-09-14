// Pure uptime parsing and formatting logic.
//
// This module is deliberately free of GNOME Shell, St, Gtk and Adw imports so
// it can run in any GJS environment. The GNOME 42-44 implementation keeps an
// equivalent copy in legacy/uptime.js because the two targets use incompatible
// module systems (legacy imports vs. ES modules).

export const FORMAT_HUMAN = 'human';
export const FORMAT_COMPACT = 'compact';

export const DEFAULT_UPDATE_INTERVAL = 60;
export const MIN_UPDATE_INTERVAL = 30;
export const MAX_UPDATE_INTERVAL = 300;

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const YEAR = 365 * DAY;

const UNITS = [
    {seconds: YEAR, name: 'year', suffix: 'y'},
    {seconds: WEEK, name: 'week', suffix: 'w'},
    {seconds: DAY, name: 'day', suffix: 'd'},
    {seconds: HOUR, name: 'hour', suffix: 'h'},
    {seconds: MINUTE, name: 'minute', suffix: 'm'},
];

/**
 * @param {string} format A value read from GSettings.
 * @returns {string} A supported format, defaulting to "human".
 */
export function normalizeFormat(format) {
    return format === FORMAT_COMPACT ? FORMAT_COMPACT : FORMAT_HUMAN;
}

/**
 * @param {number} value A value read from GSettings.
 * @returns {number} A sane update interval in seconds.
 */
export function normalizeInterval(value) {
    if (!Number.isInteger(value) ||
        value < MIN_UPDATE_INTERVAL ||
        value > MAX_UPDATE_INTERVAL)
        return DEFAULT_UPDATE_INTERVAL;

    return value;
}

/**
 * Parse the first field of /proc/uptime (seconds since boot).
 *
 * @param {string} contents Raw contents of /proc/uptime.
 * @returns {number|null} Whole seconds, or null when the data is unusable.
 */
export function parseUptimeSeconds(contents) {
    if (typeof contents !== 'string')
        return null;

    const [uptimeField] = contents.trim().split(/\s+/);
    if (!uptimeField)
        return null;

    const seconds = Number(uptimeField);
    if (!Number.isFinite(seconds) || seconds < 0)
        return null;

    return Math.floor(seconds);
}

/**
 * Render an uptime value.
 *
 * @param {number} seconds Seconds since boot.
 * @param {string} format "human" or "compact".
 * @returns {string|null} The formatted value, or null for invalid input.
 */
export function formatUptime(seconds, format) {
    if (!Number.isFinite(seconds) || seconds < 0)
        return null;

    const compact = normalizeFormat(format) === FORMAT_COMPACT;
    let remaining = Math.floor(seconds);
    const parts = [];
    for (const unit of UNITS) {
        const value = Math.floor(remaining / unit.seconds);
        remaining %= unit.seconds;
        if (value > 0)
            parts.push({value, unit});
    }

    if (parts.length === 0)
        return compact ? '0m' : 'up 0 minutes';

    if (compact)
        return parts.map(({value, unit}) => `${value}${unit.suffix}`).join(' ');

    const text = parts
        .map(({value, unit}) => `${value} ${unit.name}${value === 1 ? '' : 's'}`)
        .join(', ');
    return `up ${text}`;
}
