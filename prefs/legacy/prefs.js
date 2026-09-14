'use strict';

// Uptime Notifier preferences for GNOME Shell 42-44.

const {Adw, Gio, Gtk} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

const FORMATS = ['human', 'compact'];
const INTERVALS = [30, 60, 300];
const INTERVAL_LABELS = ['30 seconds', '60 seconds', '5 minutes'];

// Required by the GNOME 42-44 preferences loader. No one-time setup is needed.
function init() {
}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings();

    const page = new Adw.PreferencesPage({
        title: 'Uptime',
        icon_name: 'preferences-system-time-symbolic',
    });
    window.add(page);

    const displayGroup = new Adw.PreferencesGroup({
        title: 'Display',
    });
    page.add(displayGroup);

    const formatModel = new Gtk.StringList();
    FORMATS.forEach(format => formatModel.append(format));

    const formatRow = new Adw.ComboRow({
        title: 'Display Format',
        subtitle: 'How uptime is shown in the panel',
        model: formatModel,
    });
    const formatIndex = FORMATS.indexOf(settings.get_string('format'));
    formatRow.selected = formatIndex < 0 ? 0 : formatIndex;
    formatRow.connect('notify::selected', () => {
        settings.set_string('format', FORMATS[formatRow.selected]);
    });
    displayGroup.add(formatRow);

    // Adw.SwitchRow only exists in libadwaita 1.4 (GNOME 45+), so build the
    // row from an Adw.ActionRow and a plain Gtk.Switch for GNOME 42-44.
    const iconRow = new Adw.ActionRow({
        title: 'Show Icon',
        subtitle: 'Display a clock icon next to the uptime',
    });
    const iconSwitch = new Gtk.Switch({
        valign: Gtk.Align.CENTER,
    });
    iconRow.add_suffix(iconSwitch);
    iconRow.activatable_widget = iconSwitch;
    settings.bind('show-icon', iconSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
    displayGroup.add(iconRow);

    const updateGroup = new Adw.PreferencesGroup({
        title: 'Updates',
    });
    page.add(updateGroup);

    const intervalModel = new Gtk.StringList();
    INTERVAL_LABELS.forEach(label => intervalModel.append(label));

    const intervalRow = new Adw.ComboRow({
        title: 'Update Interval',
        subtitle: 'How often the uptime is refreshed',
        model: intervalModel,
    });
    const intervalIndex = INTERVALS.indexOf(settings.get_int('update-interval'));
    intervalRow.selected = intervalIndex < 0 ? 1 : intervalIndex;
    intervalRow.connect('notify::selected', () => {
        settings.set_int('update-interval', INTERVALS[intervalRow.selected]);
    });
    updateGroup.add(intervalRow);
}
