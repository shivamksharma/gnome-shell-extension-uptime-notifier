const { Gtk, Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

function init() {
    ExtensionUtils.initTranslations('uptime-notifier');
}

function buildPrefsWidget() {
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.uptime-notifier');

    // Create a main box
    const frame = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 20,
        margin_top: 20,
        margin_bottom: 20,
        margin_start: 20,
        margin_end: 20
    });

    // 1. Format
    const formatBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
    const formatLabel = new Gtk.Label({ label: 'Display Format', xalign: 0, hexpand: true });

    const formatCombo = new Gtk.ComboBoxText();
    formatCombo.append('human', 'Human-readable');
    formatCombo.append('compact', 'Compact');

    formatCombo.set_active_id(settings.get_string('format') || 'human');

    formatCombo.connect('changed', (w) => {
        settings.set_string('format', w.get_active_id());
    });

    formatBox.append(formatLabel);
    formatBox.append(formatCombo);
    frame.append(formatBox);

    // 2. Interval
    const intervalBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
    const intervalLabel = new Gtk.Label({ label: 'Update Interval', xalign: 0, hexpand: true });

    const intervalCombo = new Gtk.ComboBoxText();
    intervalCombo.append('30', '30 Seconds');
    intervalCombo.append('60', '60 Seconds');
    intervalCombo.append('300', '5 Minutes');

    let currentInterval = settings.get_int('update-interval').toString();
    if (!['30', '60', '300'].includes(currentInterval)) currentInterval = '60';
    intervalCombo.set_active_id(currentInterval);

    intervalCombo.connect('changed', (w) => {
        settings.set_int('update-interval', parseInt(w.get_active_id()));
    });

    intervalBox.append(intervalLabel);
    intervalBox.append(intervalCombo);
    frame.append(intervalBox);

    // 3. Icon
    const iconBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
    const iconLabel = new Gtk.Label({ label: 'Show Icon', xalign: 0, hexpand: true });

    const iconSwitch = new Gtk.Switch();
    iconSwitch.set_active(settings.get_boolean('show-icon'));

    iconSwitch.connect('notify::active', (w) => {
        settings.set_boolean('show-icon', w.get_active());
    });

    iconBox.append(iconLabel);
    iconBox.append(iconSwitch);
    frame.append(iconBox);

    return frame;
}
