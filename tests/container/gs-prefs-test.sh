#!/usr/bin/env bash
# Runs inside the container/private dbus session: starts a headless GNOME Shell
# to provide a Wayland display, then builds the extension's preferences window.
set -uo pipefail

UUID="${EXT_UUID:?EXT_UUID must be set}"
export EXT_DIR="$XDG_DATA_HOME/gnome-shell/extensions/$UUID"
LOG="${SHELL_LOG:-/tmp/shell.log}"
BUS=(gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell)

if ! command -v gjs >/dev/null 2>&1; then
    echo "RESULT: GJS_MISSING"
    echo "Install it in the container: apt-get install -y --no-install-recommends gjs"
    exit 1
fi

gnome-shell --headless --no-x11 --virtual-monitor 1024x768 >"$LOG" 2>&1 &
PID=$!
cleanup() { kill "$PID" 2>/dev/null || true; wait "$PID" 2>/dev/null || true; }
trap cleanup EXIT

ready=0
for _ in $(seq 1 80); do
    if "${BUS[@]}" --method org.gnome.Shell.Extensions.ListExtensions >/dev/null 2>&1; then
        ready=1
        break
    fi
    sleep 0.5
done
echo "shell ready: $ready"
if [ "$ready" != "1" ]; then
    echo "RESULT: SHELL_NOT_READY"
    exit 1
fi

export WAYLAND_DISPLAY=wayland-0
export GDK_BACKEND=wayland
export GSK_RENDERER=cairo
export GTK_A11Y=none

gjs -m /root/prefs-smoke.mjs
echo "SMOKE_EXIT=$?"
