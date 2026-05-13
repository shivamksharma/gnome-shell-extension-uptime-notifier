<h1 align="center">⏱️ Uptime Notifier - GNOME Shell Extension</h1>

<p align="center">
  <strong>Real-time system uptime indicator for your GNOME Shell top panel</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/GNOME-42--49-4A86CF?style=flat-square&logo=gnome&logoColor=white" alt="GNOME 42-49">
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Version-2.0-green?style=flat-square" alt="Version">
</p>

---

## ✨ Features

- **⏱️ System Uptime Display** — Shows how long your system has been running
- **🔍 Customizable Format** — Choose between Human-readable and Compact display
- **⚙️ Adjustable Update Interval** — Set refresh rate to 30s, 60s, or 5 minutes
- **🎯 Lightweight & Efficient** — Minimal resource usage with optimized timers
- **📱 Modern Preferences** — Clean GTK4 settings interface
- **🔄 Optional Icon** — Toggle a small clock icon in the panel
- **🚫 Smart Display** — Uses native uptime command for accurate info

---

## 📸 Preview

```
┌─────────────────────────────────────────────────────────────┐
│  Activities     ⏱️ up 3 hours, 14 minutes              🔋 🔊 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Compatibility

| GNOME Shell Version |        Supported         |
| :-----------------: | :----------------------: |
|         42          |            ✅            |
|         43          |            ✅            |
|         44          |            ✅            |
|         45          |            ✅            |
|         46          |            ✅            |
|         47          |            ✅            |
|         48          |            ✅            |
|         49          |            ✅            |

---

## 📥 Installation

### From extensions.gnome.org (Recommended)

1. Visit [extensions.gnome.org](https://extensions.gnome.org)
2. Search for "Uptime Notifier"
3. Click the toggle to install and enable

### Manual Installation

1. Download from [GitHub](https://github.com/shivamksharma/uptime-notifier)
2. Extract to `~/.local/share/gnome-shell/extensions/uptime-notifier@sam.shell-extension/`
3. Restart GNOME Shell (`Alt+F2`, type `r`, press Enter)
4. Enable via GNOME Extensions or GNOME Tweaks

### From Source

```bash
git clone https://github.com/shivamksharma/uptime-notifier.git
cp -r uptime-notifier ~/.local/share/gnome-shell/extensions/uptime-notifier@sam.shell-extension/
```

---

## ⚙️ Configuration

Access preferences through GNOME Extensions → Uptime Notifier → Settings

### Display Settings
- **Display Format** — Choose Human-readable or Compact
- **Show Icon** — Toggle clock icon display

### Update Settings
- **Update Interval** — Set refresh rate: 30s, 60s, or 5 minutes

---

## 🔧 Technical Overview

Uses the standard `uptime -p` command to get accurate, formatted system uptime information. Automatically handles GTK3/GTK4 compatibility for preferences.

---

## 📁 File Structure

```
uptime-notifier@sam.shell-extension/
├── extension.js              # Main extension logic
├── metadata.json             # Extension metadata
├── prefs.js                  # Preferences UI
├── schemas/                  # GSettings schema
└── README.md                 # This file
```

---

## 🛠️ Development

### Prerequisites
- GNOME Shell 42+
- GJS and GTK4

### Testing
```bash
cp -r . ~/.local/share/gnome-shell/extensions/uptime-notifier@sam.shell-extension/
glib-compile-schemas schemas/
gnome-extensions enable uptime-notifier@sam.shell-extension
```

Debug with: `journalctl -f -o cat /usr/bin/gnome-shell`

---

## 🤝 Contributing

Contributions welcome! Please test on multiple GNOME versions and follow the GNOME Code of Conduct.

---

## 📄 License

**GNU General Public License v3.0**

*Not affiliated with or endorsed by the GNOME Project. Community maintained.*
