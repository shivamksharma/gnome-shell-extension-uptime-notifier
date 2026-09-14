// Uptime Notifier preferences for GNOME Shell 45-49.

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

import {ExtensionPreferences} from 'resource:///org/gnome/shell/extensions/prefs.js';

const FORMATS = ['human', 'compact'];
const INTERVALS = [30, 60, 300];
const INTERVAL_LABELS = ['30 seconds', '60 seconds', '5 minutes'];

export default class UptimeNotifierPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

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
        for (const format of FORMATS)
            formatModel.append(format);

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

        const iconRow = new Adw.SwitchRow({
            title: 'Show Icon',
            subtitle: 'Display a clock icon next to the uptime',
        });
        settings.bind('show-icon', iconRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        displayGroup.add(iconRow);

        const updateGroup = new Adw.PreferencesGroup({
            title: 'Updates',
        });
        page.add(updateGroup);

        const intervalModel = new Gtk.StringList();
        for (const label of INTERVAL_LABELS)
            intervalModel.append(label);

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
}
