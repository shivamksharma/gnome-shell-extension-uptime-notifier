// Uptime Notifier - GNOME Shell Extension
// Modern ESModules version for GNOME 45-49

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as St from 'resource:///org/gnome/st/js/st.js';
import * as GLib from 'resource:///org/gnome/gjs/libs/glib.js';
import * as GObject from 'resource:///org/gnome/gjs/libs/gobject.js';
import * as Clutter from 'resource:///org/gnome/gjs/libs/clutter.js';
import { getSettings } from 'resource:///org/gnome/shell/misc/extensionUtils.js';

// Constants
const UPDATE_INTERVAL_MIN = 10; // Minimum update interval in seconds
const DEFAULT_UPDATE_INTERVAL = 60; // Default update interval in seconds
const ICON_NAME = 'preferences-system-time-symbolic';
const COMMAND = 'uptime -p';

// Utility functions
function safeDecodeStdout(stdout) {
    // Handle different GJS versions: stdout can be Uint8Array, or String
    if (stdout instanceof Uint8Array) {
        // Use TextDecoder (available in GNOME 45+)
        return new TextDecoder().decode(stdout).trim();
    } else {
        return stdout.toString().trim();
    }
}

function formatCompact(rawText) {
    return rawText
        .replace(/^up\s+/, '')
        .replace(/ years?,?/g, 'y')
        .replace(/ weeks?,?/g, 'w')
        .replace(/ days?,?/g, 'd')
        .replace(/ hours?,?/g, 'h')
        .replace(/ minutes?/g, 'm');
}

const UptimeIndicator = GObject.registerClass(
class UptimeIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.5, 'Uptime Notifier');

        // Settings
        this._settings = getSettings('org.gnome.shell.extensions.uptime-notifier');

        // Container
        this._box = new St.BoxLayout({
            style_class: 'panel-status-menu-box',
            vertical: false,
            x_expand: true,
        });
        this.add_child(this._box);

        // Icon
        this._icon = new St.Icon({
            icon_name: ICON_NAME,
            style_class: 'system-status-icon',
        });

        // Label
        this._label = new St.Label({
            text: 'Initializing...',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._box.add_child(this._label);

        this._timerId = 0;

        // Connections
        this._settingsChangedId = this._settings.connect('changed', () => {
            this._updateVisibility();
            this._updateUI();
            this._resetTimer();
        });

        // Initialize
        this._updateVisibility();
        this._updateUI();
        this._resetTimer();
    }

    _updateVisibility() {
        const showIcon = this._settings.get_boolean('show-icon');

        if (showIcon) {
            if (!this._box.contains(this._icon)) {
                this._box.insert_child_at_index(this._icon, 0);
            }
        } else {
            if (this._box.contains(this._icon)) {
                this._box.remove_child(this._icon);
            }
        }
    }

    _updateUI() {
        const uptimeText = this._getUptimeText();
        this._label.set_text(uptimeText);
    }

    _getUptimeText() {
        try {
            const [success, stdout] = GLib.spawn_command_line_sync(COMMAND);

            if (!success) {
                return 'Err';
            }

            const rawOutput = safeDecodeStdout(stdout);
            return this._formatOutput(rawOutput);
        } catch (e) {
            // Use global log function if available, otherwise silently fail
            if (typeof logError === 'function') {
                logError(e.message, 'Uptime Notifier');
            }
            return 'Error';
        }
    }

    _formatOutput(rawText) {
        const format = this._settings.get_string('format');
        return format === 'compact' ? formatCompact(rawText) : rawText;
    }

    _resetTimer() {
        // Remove existing timer if any
        if (this._timerId > 0) {
            GLib.source_remove(this._timerId);
            this._timerId = 0;
        }

        // Get and validate update interval
        let interval = this._settings.get_int('update-interval');
        if (interval < UPDATE_INTERVAL_MIN) {
            interval = DEFAULT_UPDATE_INTERVAL;
        }

        // Create new timer
        this._timerId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            interval,
            () => {
                // Safety check: if timer was cleared, remove source
                if (this._timerId === 0) {
                    return GLib.SOURCE_REMOVE;
                }
                this._updateUI();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    destroy() {
        // Disconnect settings FIRST to prevent callbacks during cleanup
        if (this._settingsChangedId > 0) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = 0;
        }

        // Remove timer
        if (this._timerId > 0) {
            GLib.source_remove(this._timerId);
            this._timerId = 0;
        }

        // Nullify settings to release reference
        this._settings = null;

        super.destroy();
    }
});

export default class UptimeNotifierExtension extends Extension {
    constructor() {
        super();
        this._indicator = null;
    }

    enable() {
        this._indicator = new UptimeIndicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}