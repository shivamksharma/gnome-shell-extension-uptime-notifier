# Uptime Notifier

A lightweight GNOME Shell extension that shows how long the current system has
been running in the top panel.

The extension reads the system uptime directly from `/proc/uptime`. It does not
run external commands or make network requests.

## Features

- Live system uptime in the top panel
- Human-readable (`up 2 days, 4 hours`) or compact (`2d 4h`) formats
- Update interval presets of 30 seconds, 60 seconds or 5 minutes
- Optional clock icon next to the uptime
- Right-click the indicator to open the preferences
- Updates only when needed, with no synchronous subprocesses or blocking I/O

## Compatibility

The repository contains two purpose-built implementations:

| Implementation | GNOME Shell | Source directory | Preferences |
| -------------- | ----------- | ---------------- | ----------- |
| Legacy         | 42, 43, 44  | `legacy/`        | `prefs/legacy/prefs.js` |
| Modern         | 45, 46, 47, 48, 49 | `src/`    | `prefs/prefs.js` |

GNOME 50 and 51 have not been tested and are intentionally not declared. Use the
package that matches your GNOME Shell version; do not install the legacy package
on GNOME 45+ or the modern package on GNOME 42-44.

## Installation

### From a release

Download the ZIP that matches your GNOME Shell version and install it:

```sh
gnome-extensions install --force uptime-notifier@shivamksharma.github.io-modern-3.0.0.zip
gnome-extensions enable uptime-notifier@shivamksharma.github.io
```

Use the `-legacy-` package on GNOME 42-44 and the `-modern-` package on
GNOME 45-49.

### From source

Build both packages:

```sh
git clone https://github.com/shivamksharma/gnome-shell-extensions-uptime-notifier.git
cd gnome-shell-extensions-uptime-notifier
./scripts/build.sh
```

Then install the package for your shell version, for example:

```sh
gnome-extensions install --force build/uptime-notifier@shivamksharma.github.io-modern-3.0.0.zip
gnome-extensions enable uptime-notifier@shivamksharma.github.io
```

`gnome-extensions install` compiles the GSettings schema for you. If you install
by unpacking the ZIP manually, compile the schema yourself:

```sh
glib-compile-schemas ~/.local/share/gnome-shell/extensions/uptime-notifier@shivamksharma.github.io/schemas/
```

Restart GNOME Shell to load a newly installed extension. On X11 press `Alt+F2`,
type `r` and press Enter. On Wayland, log out and back in.

## Settings

Open the preferences from the Extensions application, or by right-clicking the
panel indicator.

- **Display Format** – `human` or `compact`.
- **Show Icon** – show or hide the clock icon.
- **Update Interval** – 30 seconds, 60 seconds or 5 minutes.

The schema ID is `org.gnome.shell.extensions.uptime-notifier`. The schema
constrains the update interval to 30-300 seconds and the format to the two
supported values; the extension also sanitizes out-of-range values at runtime.

## Architecture

```
src/                     Modern (GNOME 45-49) entry point + indicator
  extension.js           Extension class (enable/disable)
  indicator.js           PanelMenu button and async uptime refresh
  shared/uptime.js       Pure parsing/formatting logic (no GNOME UI imports)
legacy/                  Legacy (GNOME 42-44) entry point + indicator
  extension.js           init/enable/disable entry point
  indicator.js           PanelMenu button and async uptime refresh
  uptime.js              Pure parsing/formatting logic (legacy module system)
prefs/                   Modern preferences
prefs/legacy/            Legacy preferences
schemas/                 GSettings schema XML
scripts/build.sh         Builds both packages
```

The two implementations cannot share a single JavaScript module because GNOME
42-44 use GJS' legacy import system while GNOME 45+ use ES modules. The pure
uptime logic is therefore mirrored in `src/shared/uptime.js` and
`legacy/uptime.js`; it contains no UI or toolkit code.

### Why the uptime logic is custom

`uptime -p` is an external command and using it from shell code is prohibited by
the GNOME Extensions review guidelines. The extension instead reads and parses
`/proc/uptime` asynchronously and formats the value itself. The parser handles
missing or malformed data by showing `--` and recovers on the next update.

## Building

`scripts/build.sh` requires `bash`, `zip` and `glib-compile-schemas`.

The script produces two deterministic ZIPs in `build/`:

- `uptime-notifier@shivamksharma.github.io-legacy-3.0.0.zip` – schema XML plus a
  compiled `gschemas.compiled` (required by GNOME 42-44).
- `uptime-notifier@shivamksharma.github.io-modern-3.0.0.zip` – schema XML only.
  GNOME 45+ and `gnome-extensions install` compile the schema on install.

Build scripts and other development files are not packaged.

## Troubleshooting

- The panel shows `--`: `/proc/uptime` could not be read. The extension retries
  on the next update.
- The extension does not appear: confirm the UUID directory name is
  `uptime-notifier@shivamksharma.github.io` and that you installed the correct
  package for your GNOME Shell version.
- Inspect logs with
  `journalctl -f -o cat /usr/bin/gnome-shell | grep -i uptime`.
- The built-in Looking Glass (`Alt+F2`, then `lg`) shows extension errors.

## Contributing

1. Fork the repository and create a feature branch.
2. Keep the two implementations separate and matching the module system of
   their target GNOME Shell versions.
3. Run `./scripts/build.sh` and make sure both packages build.
4. Do not add synchronous subprocesses, network access or unrelated features.
5. Open a pull request describing your change.

## License

This project is licensed under the GNU General Public License v3.0 or later.
See [LICENSE](LICENSE) for the full text.

Uptime Notifier is a community project and is not affiliated with or endorsed
by the GNOME Project.
