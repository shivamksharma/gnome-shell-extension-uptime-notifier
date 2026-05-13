# Uptime Notifier - GNOME Shell Extension

⏱️ Real-time system uptime indicator for your GNOME Shell top panel

[![GNOME 42-49](https://img.shields.io/badge/GNOME-42--49-4A86CF?style=flat-square&logo=gnome&logoColor=white)](https://wiki.gnome.org/Projects/GNOME)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0.en.html)
[![Version](https://img.shields.io/badge/Version-2.0.0-green?style=flat-square)](https://github.com/shivamksharma/uptime-notifier/releases)

---

## ✨ Features

- **⏱️ System Uptime Display** — Shows how long your system has been running
- **🔍 Customizable Format** — Choose between Human-readable and Compact display
- **⚙️ Adjustable Update Interval** — Set refresh rate to 10s, 30s, 60s, or 5 minutes
- **🎯 Lightweight & Efficient** — Minimal resource usage with optimized timers
- **📱 Modern Preferences** — Clean interface with Adwaita for GNOME 45+, GTK fallback for older versions
- **🔄 Optional Icon** — Toggle a small clock icon in the panel
- **🚫 Smart Display** — Uses native `uptime -p` command for accurate info
- **♻️ Proper Cleanup** — No memory leaks or timers left behind

---

## 📸 Preview

| Human-readable Format | Compact Format |
|----------------------|----------------|
| ![Human-readable](https://via.placeholder.com/300x30/4A86CF/FFFFFF?text=up+3+hours,+14+minutes) | ![Compact](https://via.placeholder.com/300x30/4A86CF/FFFFFF?text=up+3h14m) |
| `up 3 hours, 14 minutes` | `up 3h14m` |

---

## 🔧 Compatibility

| GNOME Shell Version | Legacy (42-44) | Modern (45-49) |
|---------------------|----------------|----------------|
| 42                  | ✅ Supported   | ❌ Not Supported |
| 43                  | ✅ Supported   | ❌ Not Supported |
| 44                  | ✅ Supported   | ❌ Not Supported |
| 45                  | ❌ Not Supported | ✅ Supported |
| 46                  | ❌ Not Supported | ✅ Supported |
| 47                  | ❌ Not Supported | ✅ Supported |
| 48                  | ❌ Not Supported | ✅ Supported |
| 49                  | ❌ Not Supported | ✅ Supported |

> **Note**: Use the appropriate version for your GNOME Shell:
> - **GNOME 42, 43, 44**: Install `uptime-notifier@sam.shell-extension-legacy.zip`
> - **GNOME 45, 46, 47, 48, 49**: Install `uptime-notifier@sam.shell-extension-modern.zip`

---

## 📥 Installation

### From Source (Recommended for Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/shivamksharma/uptime-notifier.git
   cd uptime-notifier
   ```

2. **Build the extension packages**
   ```bash
   ./scripts/build.sh
   ```

3. **Install the appropriate version**

   For GNOME 42-44:
   ```bash
   VERSION=2.0.0
   EXT_NAME="uptime-notifier@sam.shell-extension"
   rm -rf ~/.local/share/gnome-shell/extensions/${EXT_NAME}
   unzip build/${EXT_NAME}-legacy-${VERSION}.zip -d ~/.local/share/gnome-shell/extensions/${EXT_NAME}
   ```

   For GNOME 45-49:
   ```bash
   VERSION=2.0.0
   EXT_NAME="uptime-notifier@sam.shell-extension"
   rm -rf ~/.local/share/gnome-shell/extensions/${EXT_NAME}
   unzip build/${EXT_NAME}-modern-${VERSION}.zip -d ~/.local/share/gnome-shell/extensions/${EXT_NAME}
   ```

4. **Compile schemas** (done automatically by build script, but can be run manually)
   ```bash
   glib-compile-schemas ~/.local/share/gnome-shell/extensions/${EXT_NAME}/schemas/
   ```

5. **Restart GNOME Shell**
   - Press `Alt + F2`, type `r`, and press Enter
   - Or log out and log back in

6. **Enable the extension**
   - Use GNOME Extensions app
   - Or use command line: `gnome-extensions enable uptime-notifier@sam.shell-extension`

### From Releases

Download the appropriate `.zip` file from the [Releases page](https://github.com/shivamksharma/uptime-notifier/releases) and install via:
1. `gnome-extensions install <downloaded-file>.zip`
2. `gnome-extensions enable uptime-notifier@sam.shell-extension`

---

## ⚙️ Configuration

Access preferences through:
- GNOME Extensions → Uptime Notifier → Settings
- Or right-click the indicator in the panel → Settings

### Display Settings
- **Display Format** — Choose Human-readable (`up 3 hours, 14 minutes`) or Compact (`up 3h14m`)
- **Show Icon** — Toggle clock icon display in the panel

### Update Settings
- **Update Interval** — Set refresh rate:
  - 10 Seconds (for real-time monitoring)
  - 30 Seconds (recommended balance)
  - 60 Seconds (default, minimal resource usage)
  - 5 Minutes (for minimal impact)

---

## 🛠️ Technical Overview

### Architecture
- **Modern Version (GNOME 45-49)**: Uses ESModules with `import`/`export` syntax
- **Legacy Version (GNOME 42-44)**: Uses traditional `imports` system
- **Separate Builds**: Clean separation avoids compatibility hacks

### Key Components
- **extension.js**: Main extension logic with panel indicator
- **prefs.js**: Preferences UI with GTK3/GTK4 and Adwaita support
- **schemas/**: GSettings schema for persistent configuration
- **scripts/**: Build automation for packaging and schema compilation

### Performance Optimizations
- Minimum update interval clamped to 10 seconds to prevent excessive CPU usage
- Proper timer cleanup on disable/destroy to prevent leaks
- Efficient string formatting with pre-compiled regex patterns
- Lazy loading of compatibility modules (ByteArray only when needed)

---

## 📁 File Structure

```
uptime-notifier@sam.shell-extension/
├── extension.js              # Main extension logic
├── prefs.js                  # Preferences UI
├── schemas/                  # GSettings schema
│   ├── org.gnome.shell.extensions.uptime-notifier.gschema.xml
│   └── gschemas.compiled     # Compiled schema
├── assets/                   # Extension assets (icons, etc.)
├── locale/                   # Translations (future)
├── README.md                 # This file
└── scripts/
    └── build.sh              # Build and packaging script
```

---

## 🔧 Development

### Prerequisites
- GNOME Shell 42+ (development) or 45+ (modern version)
- Node.js (for linting, optional)
- glib-compile-schemas (for schema compilation)
- zip (for packaging)

### Testing
```bash
# Build development packages
./scripts/build.sh

# Install to local extensions directory
VERSION=2.0.0-dev
EXT_NAME="uptime-notifier@sam.shell-extension"

# For GNOME 45-49 development
rm -rf ~/.local/share/gnome-shell/extensions/${EXT_NAME}
unzip build/${EXT_NAME}-modern-${VERSION}.zip -d ~/.local/share/gnome-shell/extensions/${EXT_NAME}

# Compile schemas
glib-compile-schemas ~/.local/share/gnome-shell/extensions/${EXT_NAME}/schemas/

# Restart Shell and enable extension
# Alt+F2, type 'r', Enter
# gnome-extensions enable uptime-notifier@sam.shell-extension
```

### Debugging
```bash
# Watch journal for extension logs
journalctl -f -o cat /usr/bin/gnome-shell | grep -i uptime

# Looking Glass (Alt+F2 → lg → Errors tab)
```

### Code Style
- Follows GNOME Shell JavaScript guidelines
- ES6+ features for modern version
- Backward compatibility patterns for legacy version
- Meaningful variable and function names
- Consistent error handling

---

## 📦 Packaging

The extension uses a dual-build approach:
1. **Legacy Build** (`*-legacy.zip`): For GNOME 42-44
2. **Modern Build** (`*-modern.zip`): For GNOME 45-49

Each build includes:
- Compiled schemas (`gschemas.compiled`)
- All necessary JavaScript files
- Metadata with correct shell-version array
- README and license information

### Manual Packaging
```bash
# For legacy version
cd legacy/
zip -r ../uptime-notifier@sam.shell-extension-legacy.zip .
glib-compile-schemas schemas/

# For modern version  
cd src/
zip -r ../uptime-notifier@sam.shell-extension-modern.zip .
cd ../prefs/
zip -r ../uptime-notifier@sam.shell-extension-modern.zip prefs.js
cd ..
zip -r uptime-notifier@sam.shell-extension-modern.zip metadata.json schemas/ -j
```

---

## 🐛 Known Issues & Limitations

### Current Limitations
- No tooltip on hover (could be added in future)
- Limited to `uptime -p` command output (system-dependent)
- Compact format uses simple abbreviations (y,w,d,h,m)

### Resolved Issues
- ✅ Fixed stdout encoding handling across GJS versions
- ✅ Proper timer cleanup prevents zombie sources
- ✅ Settings change handling prevents callback during destruction
- ✅ GTK3/GTK4 compatibility in preferences
- ✅ Validated update intervals (minimum 10 seconds)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Ensure build works** (`./scripts/build.sh`)
5. **Test on both legacy and modern targets** if possible
6. **Submit a Pull Request**

Please ensure your contributions:
- Maintain backward compatibility where specified
- Follow existing code style
- Include appropriate tests if adding functionality
- Update documentation as needed

---

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2023-present shivamksharma**

This extension is **not** affiliated with or endorsed by the GNOME Project. It is a community-maintained project.

---

## 🙏 Acknowledgments

- GNOME Shell extension documentation and community
- The authors of the `uptime` command
- All contributors and users who provide feedback
- Icons provided by the system icon theme (preferences-system-time-symbolic)

---

**Happy uptime tracking!** ⏱️