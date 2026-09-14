#!/usr/bin/env bash
set -euo pipefail

# Build Uptime Notifier packages for GNOME 42-44 (legacy) and GNOME 45-49 (modern).

EXTENSION_UUID="uptime-notifier@shivamksharma.github.io"
VERSION="3.0.0"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="${ROOT_DIR}/build"
SCHEMA_XML="schemas/org.gnome.shell.extensions.uptime-notifier.gschema.xml"
REPRODUCIBLE_TIMESTAMP="202001010000"

cd "${ROOT_DIR}"

log() {
    printf '%s\n' "$*"
}

require() {
    command -v "$1" >/dev/null 2>&1 || {
        log "Missing required command: $1" >&2
        exit 1
    }
}

require glib-compile-schemas
require zip

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

stage_common() {
    local staging="$1"
    mkdir -p "${staging}/schemas"
    cp "${SCHEMA_XML}" "${staging}/schemas/"
    cp "LICENSE" "${staging}/"
}

make_zip() {
    local staging="$1"
    local output="$2"
    # Normalise timestamps so the archive is byte-for-byte reproducible.
    find "${staging}" -exec touch -t "${REPRODUCIBLE_TIMESTAMP}" {} +
    (cd "${staging}" && zip -X -q -r "${output}" .)
}

build_legacy() {
    local staging="${BUILD_DIR}/staging-legacy"
    local output="${BUILD_DIR}/${EXTENSION_UUID}-legacy-${VERSION}.zip"

    rm -rf "${staging}"
    mkdir -p "${staging}"

    cp legacy/extension.js legacy/indicator.js legacy/uptime.js "${staging}/"
    cp prefs/legacy/prefs.js "${staging}/prefs.js"
    cp metadata-legacy.json "${staging}/metadata.json"
    stage_common "${staging}"

    # GNOME 42-44 load the compiled schema from the extension directory.
    glib-compile-schemas --strict "${staging}/schemas/"

    make_zip "${staging}" "${output}"
    rm -rf "${staging}"
    log "Legacy package: ${output}"
}

build_modern() {
    local staging="${BUILD_DIR}/staging-modern"
    local output="${BUILD_DIR}/${EXTENSION_UUID}-modern-${VERSION}.zip"

    rm -rf "${staging}"
    mkdir -p "${staging}/shared"

    cp src/extension.js src/indicator.js "${staging}/"
    cp src/shared/uptime.js "${staging}/shared/"
    cp prefs/prefs.js "${staging}/prefs.js"
    cp metadata.json "${staging}/metadata.json"
    stage_common "${staging}"

    # Compile only to validate the schema. GNOME 45+ and `gnome-extensions
    # install` compile extension schemas themselves, so the binary is omitted.
    glib-compile-schemas --strict "${staging}/schemas/"
    rm -f "${staging}/schemas/gschemas.compiled"

    make_zip "${staging}" "${output}"
    rm -rf "${staging}"
    log "Modern package: ${output}"
}

build_legacy
build_modern

log "Build completed. Packages in ${BUILD_DIR}:"
ls -1 "${BUILD_DIR}"
