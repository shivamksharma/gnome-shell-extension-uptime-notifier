'use strict';

// Pure uptime parsing and formatting logic for GNOME 42-44.
//
// This is an intentional mirror of src/shared/uptime.js. The legacy and modern
// targets use incompatible module systems (legacy imports vs. ES modules), so
// the pure logic cannot be shared through a single file.

var FORMAT_HUMAN = 'human';
var FORMAT_COMPACT = 'compact';

var DEFAULT_UPDATE_INTERVAL = 60;
var MIN_UPDATE_INTERVAL = 30;
var MAX_UPDATE_INTERVAL = 300;

var MINUTE = 60;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;
var WEEK = 7 * DAY;
var YEAR = 365 * DAY;

var UNITS = [
    {seconds: YEAR, name: 'year', suffix: 'y'},
    {seconds: WEEK, name: 'week', suffix: 'w'},
    {seconds: DAY, name: 'day', suffix: 'd'},
    {seconds: HOUR, name: 'hour', suffix: 'h'},
    {seconds: MINUTE, name: 'minute', suffix: 'm'},
];

function normalizeFormat(format) {
    return format === FORMAT_COMPACT ? FORMAT_COMPACT : FORMAT_HUMAN;
}

function normalizeInterval(value) {
    if (!Number.isInteger(value) ||
        value < MIN_UPDATE_INTERVAL ||
        value > MAX_UPDATE_INTERVAL)
        return DEFAULT_UPDATE_INTERVAL;

    return value;
}

function parseUptimeSeconds(contents) {
    if (typeof contents !== 'string')
        return null;

    var uptimeField = contents.trim().split(/\s+/)[0];
    if (!uptimeField)
        return null;

    var seconds = Number(uptimeField);
    if (!Number.isFinite(seconds) || seconds < 0)
        return null;

    return Math.floor(seconds);
}

function formatUptime(seconds, format) {
    if (!Number.isFinite(seconds) || seconds < 0)
        return null;

    var compact = normalizeFormat(format) === FORMAT_COMPACT;
    var remaining = Math.floor(seconds);
    var parts = [];
    for (var i = 0; i < UNITS.length; i++) {
        var unit = UNITS[i];
        var value = Math.floor(remaining / unit.seconds);
        remaining %= unit.seconds;
        if (value > 0)
            parts.push({value: value, unit: unit});
    }

    if (parts.length === 0)
        return compact ? '0m' : 'up 0 minutes';

    var text;
    if (compact) {
        text = parts.map(function (part) {
            return part.value + part.unit.suffix;
        }).join(' ');
        return text;
    }

    text = parts.map(function (part) {
        return part.value + ' ' + part.unit.name + (part.value === 1 ? '' : 's');
    }).join(', ');
    return 'up ' + text;
}
