/* exported init enable disable */
'use strict';

const { GLib, St, Clutter, GObject } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const ExtensionUtils = imports.misc.extensionUtils;

// ByteArray for GNOME 42/43 compatibility (TextDecoder not always available)
const ByteArray = imports.byteArray;

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
                icon_name: 'preferences-system-time-symbolic',
                style_class: 'system-status-icon',
            });

            // Label
            this._label = new St.Label({
                text: 'Initializing...',
                y_align: Clutter.ActorAlign.CENTER,
            });
            this._box.add_child(this._label);

            this._timerId = null;

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
                let [success, stdout] = GLib.spawn_command_line_sync('uptime -p');

                if (!success) {
                    return 'Err';
                }

                // Handle different GJS versions: stdout can be Uint8Array, ByteArray, or String
                let rawOutput;
                if (stdout instanceof Uint8Array) {
                    // GNOME 42/43: use ByteArray.toString(), GNOME 44+: TextDecoder available
                    if (typeof TextDecoder !== 'undefined') {
                        rawOutput = new TextDecoder().decode(stdout).trim();
                    } else {
                        rawOutput = ByteArray.toString(stdout).trim();
                    }
                } else {
                    rawOutput = stdout.toString().trim();
                }

                return this._formatOutput(rawOutput);
            } catch (e) {
                logError(e, 'Uptime Notifier Error');
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
            if (this._timerId) {
                GLib.source_remove(this._timerId);
                this._timerId = null;
            }

            let interval = this._settings.get_int('update-interval');
            if (interval < 1) interval = 60;

            this._timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, interval, () => {
                if (!this._timerId) return GLib.SOURCE_REMOVE; // Safety check
                this._updateUI();
                return GLib.SOURCE_CONTINUE;
            });
        }

        destroy() {
            // Disconnect settings FIRST to prevent callbacks during cleanup
            if (this._settingsChangedId) {
                this._settings.disconnect(this._settingsChangedId);
                this._settingsChangedId = null;
            }

            if (this._timerId) {
                GLib.source_remove(this._timerId);
                this._timerId = null;
            }

            // Nullify settings to release reference
            this._settings = null;

            super.destroy();
        }
    });

let _indicator = null;

/**
 * Called once when extension is loaded (not enabled).
 * Avoid heavy initialization here.
 */
function init() {
    // No translations to initialize (no locale/ directory)
}

/**
 * Called when extension is enabled.
 */
function enable() {
    _indicator = new UptimeIndicator();
    Main.panel.addToStatusArea('uptime-notifier', _indicator);
}

/**
 * Called when extension is disabled or GNOME Shell exits.
 * Must clean up all resources.
 */
function disable() {
    if (_indicator) {
        _indicator.destroy();
        _indicator = null;
    }
}
