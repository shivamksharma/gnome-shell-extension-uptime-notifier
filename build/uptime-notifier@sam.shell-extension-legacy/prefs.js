/* exported init buildPrefsWidget */
'use strict';

const { Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

// Detect GTK version at runtime
const GTK4 = Gtk.get_major_version() >= 4;

/**
 * Called once when preferences window is first opened.
 */
function init() {
    // No translations to initialize (no locale/ directory)
}

/**
 * Helper to add a child widget - handles GTK3/GTK4 API differences.
 * @param {Gtk.Widget} parent - The parent container
 * @param {Gtk.Widget} child - The child widget to add
 */
function addChild(parent, child) {
    if (GTK4) {
        parent.append(child);
    } else {
        // GTK3
        parent.pack_start(child, false, false, 0);
        child.show();
    }
}

/**
 * Create a Gtk.Box with proper margin properties for GTK3/GTK4.
 * @param {Object} props - Widget properties
 * @returns {Gtk.Box}
 */
function createBox(props) {
    const boxProps = {
        orientation: props.orientation || Gtk.Orientation.HORIZONTAL,
        spacing: props.spacing || 0,
    };

    if (GTK4) {
        // GTK4 margin properties
        if (props.margin !== undefined) {
            boxProps.margin_top = props.margin;
            boxProps.margin_bottom = props.margin;
            boxProps.margin_start = props.margin;
            boxProps.margin_end = props.margin;
        }
        if (props.margin_top !== undefined) boxProps.margin_top = props.margin_top;
        if (props.margin_bottom !== undefined) boxProps.margin_bottom = props.margin_bottom;
        if (props.margin_start !== undefined) boxProps.margin_start = props.margin_start;
        if (props.margin_end !== undefined) boxProps.margin_end = props.margin_end;
    } else {
        // GTK3 margin properties
        if (props.margin !== undefined) {
            boxProps.margin = props.margin;
        }
        if (props.margin_top !== undefined) boxProps.margin_top = props.margin_top;
        if (props.margin_bottom !== undefined) boxProps.margin_bottom = props.margin_bottom;
        // GTK3 uses margin_left/margin_right instead of margin_start/margin_end
        if (props.margin_start !== undefined) boxProps.margin_left = props.margin_start;
        if (props.margin_end !== undefined) boxProps.margin_right = props.margin_end;
    }

    return new Gtk.Box(boxProps);
}

/**
 * Create a Gtk.Label with proper alignment for GTK3/GTK4.
 * @param {string} text - Label text
 * @returns {Gtk.Label}
 */
function createLabel(text) {
    const label = new Gtk.Label({ label: text });
    if (GTK4) {
        label.set_xalign(0);
        label.set_hexpand(true);
    } else {
        // GTK3
        label.set_xalign(0);
        label.set_hexpand(true);
    }
    return label;
}

/**
 * Build and return the preferences widget.
 * @returns {Gtk.Widget}
 */
function buildPrefsWidget() {
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.uptime-notifier');

    // Main container
    const frame = createBox({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 20,
        margin_top: 20,
        margin_bottom: 20,
        margin_start: 20,
        margin_end: 20,
    });

    // === 1. Format Setting ===
    const formatBox = createBox({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 10,
    });

    const formatLabel = createLabel('Display Format');
    const formatCombo = new Gtk.ComboBoxText();
    formatCombo.append('human', 'Human-readable');
    formatCombo.append('compact', 'Compact');
    formatCombo.set_active_id(settings.get_string('format') || 'human');

    formatCombo.connect('changed', function(widget) {
        settings.set_string('format', widget.get_active_id());
    });

    addChild(formatBox, formatLabel);
    addChild(formatBox, formatCombo);
    addChild(frame, formatBox);

    // === 2. Update Interval Setting ===
    const intervalBox = createBox({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 10,
    });

    const intervalLabel = createLabel('Update Interval');
    const intervalCombo = new Gtk.ComboBoxText();
    intervalCombo.append('30', '30 Seconds');
    intervalCombo.append('60', '60 Seconds');
    intervalCombo.append('300', '5 Minutes');

    let currentInterval = settings.get_int('update-interval').toString();
    if (!['30', '60', '300'].includes(currentInterval)) {
        currentInterval = '60';
    }
    intervalCombo.set_active_id(currentInterval);

    intervalCombo.connect('changed', function(widget) {
        settings.set_int('update-interval', parseInt(widget.get_active_id(), 10));
    });

    addChild(intervalBox, intervalLabel);
    addChild(intervalBox, intervalCombo);
    addChild(frame, intervalBox);

    // === 3. Show Icon Setting ===
    const iconBox = createBox({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 10,
    });

    const iconLabel = createLabel('Show Icon');
    const iconSwitch = new Gtk.Switch();
    iconSwitch.set_active(settings.get_boolean('show-icon'));

    if (GTK4) {
        iconSwitch.set_valign(Gtk.Align.CENTER);
    }

    iconSwitch.connect('notify::active', function(widget) {
        settings.set_boolean('show-icon', widget.get_active());
    });

    addChild(iconBox, iconLabel);
    addChild(iconBox, iconSwitch);
    addChild(frame, iconBox);

    // GTK3 requires show_all(), GTK4 shows by default
    if (!GTK4) {
        frame.show_all();
    }

    return frame;
}
