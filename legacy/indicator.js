'use strict';

// Panel indicator for GNOME Shell 42-44.

const {Clutter, Gio, GLib, GObject, St} = imports.gi;
const PanelMenu = imports.ui.panelMenu;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const Uptime = Me.imports.uptime;

const ICON_NAME = 'preferences-system-time-symbolic';
const UPTIME_FILE = '/proc/uptime';

var UptimeIndicator = GObject.registerClass(
class UptimeIndicator extends PanelMenu.Button {
    _init(settings, openPreferences) {
        super._init(0.5, 'Uptime Notifier', true);

        this._settings = settings;
        this._openPreferences = openPreferences;
        this._uptimeFile = Gio.File.new_for_path(UPTIME_FILE);
        this._cancellable = new Gio.Cancellable();
        this._timerId = 0;
        this._lastSeconds = null;

        this._box = new St.BoxLayout({
            style_class: 'panel-status-menu-box',
            x_expand: true,
        });
        this.add_child(this._box);

        this._icon = new St.Icon({
            icon_name: ICON_NAME,
            style_class: 'system-status-icon',
        });

        this._label = new St.Label({
            text: '--',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._box.add_child(this._label);

        this._settingsChangedId = this._settings.connect(
            'changed', this._onSettingsChanged.bind(this));

        this._syncIcon();
        this._refresh();
        this._resetTimer();
    }

    vfunc_event(event) {
        var isClick = event.type() === Clutter.EventType.BUTTON_PRESS &&
            event.get_button() === Clutter.BUTTON_SECONDARY;
        var isTouch = event.type() === Clutter.EventType.TOUCH_BEGIN;

        if (isClick || isTouch) {
            this._openPreferences();
            return Clutter.EVENT_STOP;
        }

        return super.vfunc_event(event);
    }

    _onSettingsChanged(_settings, key) {
        if (key === 'update-interval') {
            this._resetTimer();
            this._refresh();
        } else if (key === 'format') {
            this._render();
        } else if (key === 'show-icon') {
            this._syncIcon();
        }
    }

    _syncIcon() {
        var showIcon = this._settings.get_boolean('show-icon');
        var hasIcon = this._box.contains(this._icon);

        if (showIcon && !hasIcon)
            this._box.insert_child_at_index(this._icon, 0);
        else if (!showIcon && hasIcon)
            this._box.remove_child(this._icon);
    }

    _refresh() {
        var cancellable = this._cancellable;
        this._uptimeFile.load_contents_async(cancellable, (file, result) => {
            if (cancellable.is_cancelled())
                return;

            var contents;
            try {
                [, contents] = file.load_contents_finish(result);
            } catch (e) {
                if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
                    return;

                this._lastSeconds = null;
                this._render();
                return;
            }

            this._lastSeconds = Uptime.parseUptimeSeconds(new TextDecoder().decode(contents));
            this._render();
        });
    }

    _render() {
        var format = Uptime.normalizeFormat(this._settings.get_string('format'));
        var text = this._lastSeconds === null
            ? '--'
            : Uptime.formatUptime(this._lastSeconds, format);

        if (this._label.text !== text)
            this._label.set_text(text);
    }

    _resetTimer() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = 0;
        }

        var interval = Uptime.normalizeInterval(this._settings.get_int('update-interval'));
        this._timerId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            interval,
            () => {
                this._refresh();
                return GLib.SOURCE_CONTINUE;
            });
    }

    destroy() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = 0;
        }

        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = 0;
        }

        this._cancellable.cancel();

        this._uptimeFile = null;
        this._cancellable = null;
        this._openPreferences = null;
        this._settings = null;

        super.destroy();
    }
});
