# Testing

The automated tests run the extension inside Docker containers with real,
headless GNOME Shell sessions. They are intentionally lightweight and reusable:
each container is created once and left running.

## What the harness covers

| Test | Script | Checks |
| ---- | ------ | ------ |
| Lifecycle | `tests/container/run-extension-test.sh` | Three enable/disable cycles; shell state goes `1` (enabled) then `2` (disabled); empty `error` field; no `JS ERROR`/`Gjs-CRITICAL` |
| Preferences | `tests/container/run-prefs-test.sh` | Builds the real GNOME 45+ `prefs.js` UI (Adw/Gtk widgets and settings bindings) against the headless Shell's Wayland display |

Neither test covers visual appearance, update timing, or the `/proc/uptime`
failure path; do those interactively (see below).

## Container matrix

| Container | Image | GNOME | Generation |
| --------- | ----- | ----- | ---------- |
| `gnome43` | `debian:12` | 43 | legacy |
| `gnome44` | `ubuntu:23.04` | 44 | legacy |
| `gnome46` | `ubuntu:24.04` | 46 | modern |
| `gnome48` | `debian:13` | 48 | modern |
| `gnome50` | `ubuntu:26.04` | 50 | modern |

## Setup

Create a container (safe to re-run; existing containers are reused), then build
the packages:

```sh
./scripts/build.sh
./tests/container/setup-container.sh debian:12    gnome43
./tests/container/setup-container.sh ubuntu:23.04 gnome44
./tests/container/setup-container.sh ubuntu:24.04 gnome46
./tests/container/setup-container.sh debian:13    gnome48
./tests/container/setup-container.sh ubuntu:26.04 gnome50
```

The preferences test additionally needs the `gjs` CLI inside the container:

```sh
docker exec gnome46 apt-get install -y --no-install-recommends gjs
```

## Running the tests

```sh
UUID=uptime-notifier@shivamksharma.github.io
LEGACY=build/$UUID-legacy-3.0.0.zip
MODERN=build/$UUID-modern-3.0.0.zip

./tests/container/run-extension-test.sh gnome43 "$LEGACY" "$UUID"
./tests/container/run-extension-test.sh gnome44 "$LEGACY" "$UUID"
./tests/container/run-extension-test.sh gnome46 "$MODERN" "$UUID"
./tests/container/run-extension-test.sh gnome48 "$MODERN" "$UUID"
./tests/container/run-extension-test.sh gnome50 "$MODERN" "$UUID"

./tests/container/run-prefs-test.sh gnome46 "$MODERN" "$UUID"
./tests/container/run-prefs-test.sh gnome48 "$MODERN" "$UUID"
./tests/container/run-prefs-test.sh gnome50 "$MODERN" "$UUID"
```

A run is a pass when the output contains `RESULT: PASSED` (and, for the runtime
test, `state=1`/`state=2` with an empty error field). `RESULT: FAILED`,
`SHELL_NOT_READY`, `GJS_MISSING`, or any `JS ERROR`/`Gjs-CRITICAL`/`TypeError`
line is a failure.

## Manual interactive checks

The harness cannot verify these; run them in a real session (for example a
GNOME OS VM or a nested `gnome-shell --nested`):

- The panel actually shows a live uptime that advances.
- `human` vs `compact` formatting and the optional clock icon.
- Changing the update interval restarts the timer without duplicates.
- Right-clicking the indicator opens the preferences window.
- Settings persist across disable/enable and shell restart.
- Behaviour when `/proc/uptime` is unreadable (shows `--` and recovers).
- No `uptime -p`/subprocess is spawned (verify by code review and, e.g.,
  `bpftrace`/`strace` if desired).

## Notes

- Containers use `GSETTINGS_BACKEND=memory`, so settings are not persisted.
- GNOME 42 cannot be installed from these distro images by default; the legacy
  code path is exercised on GNOME 43/44, and was additionally verified on a real
  GNOME 42.9 session during development.
- `ubuntu:23.04` is end-of-life; `setup-container.sh` falls back to
  `old-releases.ubuntu.com`.
- If `apt` fails with a DNS/`Temporary failure resolving` error, force IPv4:
  `apt-get -o Acquire::ForceIPv4=true install ...`.
