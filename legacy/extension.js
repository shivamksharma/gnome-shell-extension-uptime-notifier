'use strict';

// Uptime Notifier - GNOME Shell 42-44 entry point.

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;

const Me = ExtensionUtils.getCurrentExtension();
const Indicator = Me.imports.indicator;

let _indicator = null;
let _settings = null;

// The extension needs no one-time setup, so init() is intentionally empty.
function init() {
}

function enable() {
    _settings = ExtensionUtils.getSettings();
    _indicator = new Indicator.UptimeIndicator(
        _settings, () => ExtensionUtils.openPrefs());
    Main.panel.addToStatusArea(Me.uuid, _indicator);
}

function disable() {
    _indicator.destroy();
    _indicator = null;
    _settings = null;
}
