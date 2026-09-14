#!/usr/bin/env bash
#
# Run the extension preferences-window smoke test inside an existing container
# created by setup-container.sh. Requires the gjs CLI in the container:
#
#   docker exec <container> apt-get install -y --no-install-recommends gjs
#
# The test builds the extension's real prefs.js (GNOME 45+ ESM) against the
# headless Shell's Wayland display. The container is left untouched.
#
# Usage:
#   ./run-prefs-test.sh <container-name> <package.zip> <extension-uuid>
#
# Example:
#   ./run-prefs-test.sh gnome46 \
#       build/uptime-notifier@shivamksharma.github.io-modern-3.0.0.zip \
#       uptime-notifier@shivamksharma.github.io
#
set -euo pipefail

NAME="${1:?usage: run-prefs-test.sh <container> <package.zip> <uuid>}"
ZIP="${2:?usage: run-prefs-test.sh <container> <package.zip> <uuid>}"
UUID="${3:?usage: run-prefs-test.sh <container> <package.zip> <uuid>}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ZIP="$(cd "$(dirname "$ZIP")" && pwd)/$(basename "$ZIP")"

docker cp "$ZIP" "$NAME:/package.zip"
docker cp "$HERE/prefs-smoke.mjs" "$NAME:/root/prefs-smoke.mjs"
docker cp "$HERE/gs-prefs-test.sh" "$NAME:/root/gs-prefs-test.sh"

docker exec \
    -e XDG_CONFIG_HOME=/root/gnome-test/config \
    -e XDG_DATA_HOME=/root/gnome-test/data \
    -e XDG_CACHE_HOME=/root/gnome-test/cache \
    -e XDG_RUNTIME_DIR=/root/gnome-test/run \
    -e GSETTINGS_BACKEND=memory \
    -e LIBGL_ALWAYS_SOFTWARE=1 \
    -e GALLIUM_DRIVER=llvmpipe \
    -e GTK_A11Y=none \
    -e EXT_UUID="$UUID" \
    "$NAME" bash -c '
        mkdir -p /run/dbus
        [ -S /run/dbus/system_bus_socket ] || dbus-daemon --system --fork
        rm -rf /root/gnome-test /run/systemd
        mkdir -p "$XDG_CONFIG_HOME" "$XDG_DATA_HOME" "$XDG_CACHE_HOME" "$XDG_RUNTIME_DIR"
        chmod 700 "$XDG_RUNTIME_DIR"

        EXT="$XDG_DATA_HOME/gnome-shell/extensions/$EXT_UUID"
        mkdir -p "$EXT"
        unzip -q /package.zip -d "$EXT"
        glib-compile-schemas "$EXT/schemas"

        timeout 180 dbus-run-session -- bash /root/gs-prefs-test.sh
        echo "INNER_EXIT=$?"
    '
