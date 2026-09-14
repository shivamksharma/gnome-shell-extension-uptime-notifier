// Preferences-window smoke test for GNOME 45+ (ESM) prefs.js.
//
// Builds the extension's real preferences UI with every Adw/Gtk widget and
// settings binding, so constructor/property mistakes surface as a failure.
// The only substitution is the shell-internal ExtensionPreferences base class,
// which is not available outside the shell/Extensions process.
//
// Outputs "RESULT: PASSED" or "RESULT: FAILED" and exits non-zero on failure.
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw';

const EXT_DIR = GLib.getenv('EXT_DIR');
const SCHEMA_ID = GLib.getenv('EXT_SCHEMA') || 'org.gnome.shell.extensions.uptime-notifier';

function fail(message) {
    print('RESULT: FAILED');
    print(message);
    imports.system.exit(1);
}

try {
    Gtk.init();

    const schemaDir = GLib.build_filenamev([EXT_DIR, 'schemas']);
    const source = Gio.SettingsSchemaSource.new_from_directory(
        schemaDir, Gio.SettingsSchemaSource.get_default(), false);
    const schema = source.lookup(SCHEMA_ID, true);
    if (!schema)
        fail(`schema not found: ${SCHEMA_ID}`);

    const settings = new Gio.Settings({settings_schema: schema});

    const tmpDir = GLib.build_filenamev([GLib.get_tmp_dir(), 'prefs-smoke']);
    GLib.mkdir_with_parents(tmpDir, 0o700);

    GLib.file_set_contents(GLib.build_filenamev([tmpDir, 'prefs-stub.js']),
        'export class ExtensionPreferences {\n' +
        '    constructor(metadata) { this.metadata = metadata; }\n' +
        '    getSettings() { return globalThis.__settings; }\n' +
        '}\n');
    globalThis.__settings = settings;

    const [, raw] = GLib.file_get_contents(GLib.build_filenamev([EXT_DIR, 'prefs.js']));
    const original = new TextDecoder().decode(raw);
    const patched = original.replace(
        'resource:///org/gnome/shell/extensions/prefs.js',
        './prefs-stub.js');
    if (patched === original)
        fail('could not locate the ExtensionPreferences import in prefs.js');
    GLib.file_set_contents(GLib.build_filenamev([tmpDir, 'prefs.js']), patched);

    const mod = await import(`file://${tmpDir}/prefs.js`);
    const Preferences = mod.default;
    if (typeof Preferences !== 'function')
        fail('prefs.js does not export a default class');

    const window = new Adw.PreferencesWindow();
    const instance = new Preferences({'settings-schema': SCHEMA_ID});
    instance.fillPreferencesWindow(window);
    print('RESULT: PASSED');
} catch (e) {
    fail(`exception: ${e.message ?? e}`);
}
