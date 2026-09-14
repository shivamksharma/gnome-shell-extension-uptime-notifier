// Uptime Notifier - GNOME Shell 45-49 entry point.

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {UptimeIndicator} from './indicator.js';

export default class UptimeNotifierExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._indicator = new UptimeIndicator(this._settings, () => this.openPreferences());
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
        this._settings = null;
    }
}
