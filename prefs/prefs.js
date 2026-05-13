// Uptime Notifier Preferences - GNOME Shell Extension
// Modern ESModules version for GNOME 45-49

import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw';
import { ExtensionPreferences } from 'resource:///org/gnome/shell/extensions/prefs.js';
import { getSettings } from 'resource:///org/gnome/shell/misc/extensionUtils.js';

export default class UptimeNotifierPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = getSettings('org.gnome.shell.extensions.uptime-notifier');

        // Main page
        const page = new Adw.PreferencesPage();
        window.add(page);

        // Format group
        const formatGroup = new Adw.PreferencesGroup();
        formatGroup.set_title('Display Settings');
        page.add(formatGroup);

        // Format setting
        const formatRow = new Adw.ComboRow({
            title: 'Display Format',
            subtitle: 'Choose how uptime is displayed',
        });
        formatGroup.add(formatRow);

        const formatModel = new Gtk.StringList();
        formatModel.append('human');
        formatModel.append('compact');
        formatRow.set_model(formatModel);
        formatRow.set_selected(settings.get_string('format') === 'human' ? 0 : 1);
        formatRow.connect('notify::selected', () => {
            const selected = formatModel.get_string(formatRow.get_selected());
            settings.set_string('format', selected);
        });

        // Update interval group
        const intervalGroup = new Adw.PreferencesGroup();
        intervalGroup.set_title('Update Settings');
        page.add(intervalGroup);

        // Update interval setting
        const intervalRow = new Adw.ComboRow({
            title: 'Update Interval',
            subtitle: 'How often to refresh the uptime display',
        });
        intervalGroup.add(intervalRow);

        const intervalModel = new Gtk.StringList();
        intervalModel.append('30');
        intervalModel.append('60');
        intervalModel.append('300');
        intervalRow.set_model(intervalModel);

        const currentInterval = settings.get_int('update-interval').toString();
        let intervalIndex = 1; // Default to 60 seconds
        if (currentInterval === '30') intervalIndex = 0;
        else if (currentInterval === '300') intervalIndex = 2;
        intervalRow.set_selected(intervalIndex);
        intervalRow.connect('notify::selected', () => {
            const selected = intervalModel.get_string(intervalRow.get_selected());
            settings.set_int('update-interval', parseInt(selected, 10));
        });

        // Show icon group
        const iconGroup = new Adw.PreferencesGroup();
        iconGroup.set_title('Icon Settings');
        page.add(iconGroup);

        // Show icon setting
        const iconRow = new Adw.SwitchRow({
            title: 'Show Icon',
            subtitle: 'Display a clock icon in the panel',
        });
        iconGroup.add(iconRow);
        iconRow.set_active(settings.get_boolean('show-icon'));
        iconRow.connect('notify::active', () => {
            settings.set_boolean('show-icon', iconRow.get_active());
        });
    }
}