'use strict';

const { GLib, St, Clutter, GObject } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const ExtensionUtils = imports.misc.extensionUtils;

// Constants
const UPDATE_INTERVAL_MIN = 10; // Minimum update interval in seconds
const DEFAULT_UPDATE_INTERVAL = 60; // Default update interval in seconds
const ICON_NAME = 'preferences-system-time-symbolic';
const COMMAND = 'uptime -p';

// Utility functions
function safeDecodeStdout(stdout) {
    // Handle different GJS versions: stdout can be Uint8Array, ByteArray, or String
    if (stdout instanceof Uint8Array) {
        // Use TextDecoder (available in GNOME 42+)
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
            this._settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.uptime-notifier');

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
                let [success, stdout] = GLib.spawn_command_line_sync(COMMAND);

                if (!success) {
                    return 'Err';
                }

                // Handle different GJS versions: stdout can be Uint8Array, ByteArray, or String
                let rawOutput = safeDecodeStdout(stdout);

                return this._formatOutput(rawOutput);
            } catch (e) {
                // Use global logError if available
                if (typeof logError === 'function') {
                    logError(e.message, 'Uptime Notifier');
                }
                return 'Error';
            }
        }

        _formatOutput(rawText) {
            const format = this._settings.get_string('format');

            if (format === 'compact') {
                let text = rawText.replace(/^up\s+/, '');
                text = text
                    .replace(/ years?,?/g, 'y')
                    .replace(/ weeks?,?/g, 'w')
                    .replace(/ days?,?/g, 'd')
                    .replace(/ hours?,?/g, 'h')
                    .replace(/ minutes?/g, 'm');
                return text;
            } else {
                return rawText;
            }
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
            this._timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, interval, () => {
                // Safety check: if timer was cleared, remove source
                if (this._timerId === 0) {
                    return GLib.SOURCE_REMOVE;
                }
                this._updateUI();
                return GLib.SOURCE_CONTINUE;
            });
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

let _indicator = null;

function init() {
    // No translations to initialize (no locale/ directory)
}

function enable() {
    _indicator = new UptimeIndicator();
    Main.panel.addToStatusArea('uptime-notifier', _indicator);
}

function disable() {
    if (_indicator) {
        _indicator.destroy();
        _indicator = null;
    }
}