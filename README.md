# Uptime Notifier

A lightweight, non-intrusive GNOME Shell extension that displays the system uptime in the top panel.

## Features

- **System Uptime Display**: Shows how long your system has been running.
- **Customizable Format**: Choose between "Human-readable" (e.g., `up 3 hours, 14 minutes`) and "Compact" (e.g., `3h 14m`).
- **Adjustable Update Interval**: Set the refresh rate to 30s, 60s, or 5 minutes (default: 60s) to save resources.
- **Optional Icon**: Toggle a small clock icon in the panel.
- **Efficient**: Uses native GNOME APIs and optimized timer handling.

## Installation

### From Source

1.  Clone or download this repository.
2.  Copy the folder to your extensions directory:
    ```bash
    mkdir -p ~/.local/share/gnome-shell/extensions/uptime-notifier@antigravity.dev
    cp -r * ~/.local/share/gnome-shell/extensions/uptime-notifier@antigravity.dev/
    ```
3.  Install the GSettings schema:
    ```bash
    cd ~/.local/share/gnome-shell/extensions/uptime-notifier@antigravity.dev
    glib-compile-schemas schemas/
    ```
4.  Restart GNOME Shell (Log out and back in, or assume Wayland restart required).
5.  Enable the extension using **Extensions Manager** or `gnome-extensions enable uptime-notifier@antigravity.dev`.

## Compatibility

-   **GNOME Shell**: 42 - 49 (single codebase, GTK3/GTK4 auto-detection)
-   **Display Server**: Wayland & X11

## Architecture

-   **Uptime Source**: Uses `uptime -p` for accurate, formatted output.
-   **Preferences**: Auto-detects GTK version (GTK3 for GNOME 42, GTK4 for GNOME 43+).
