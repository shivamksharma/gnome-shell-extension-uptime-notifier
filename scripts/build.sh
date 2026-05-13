#!/bin/bash

set -e

# Build script for Uptime Notifier GNOME Shell extension
# Creates separate packages for legacy (GNOME 42-44) and modern (GNOME 45-49) versions

EXTENSION_NAME="uptime-notifier@sam.shell-extension"
VERSION="2.0.0"

# Directories
LEGACY_DIR="legacy"
MODERN_DIR="src"
PREFS_LEGACY_DIR="prefs/legacy"
PREFS_MODERN_DIR="prefs"
SCHEMAS_DIR="schemas"
ASSETS_DIR="assets"
SCRIPTS_DIR="scripts"
LOCALE_DIR="locale"

# Build directory (absolute path)
BUILD_DIR="$(pwd)/build"
LEGACY_BUILD_DIR="${BUILD_DIR}/${EXTENSION_NAME}-legacy"
MODERN_BUILD_DIR="${BUILD_DIR}/${EXTENSION_NAME}-modern"

# Clean previous builds
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

echo "Building legacy version (GNOME 42-44)..."
mkdir -p "${LEGACY_BUILD_DIR}"

# Copy legacy extension files
cp "${LEGACY_DIR}/extension.js" "${LEGACY_BUILD_DIR}/extension.js"
cp "${PREFS_LEGACY_DIR}/prefs.js" "${LEGACY_BUILD_DIR}/prefs.js"
cp "metadata-legacy.json" "${LEGACY_BUILD_DIR}/metadata.json"
cp -r "${SCHEMAS_DIR}" "${LEGACY_BUILD_DIR}/"
cp -r "${ASSETS_DIR}" "${LEGACY_BUILD_DIR}/" 2>/dev/null || true
cp -r "${LOCALE_DIR}" "${LEGACY_BUILD_DIR}/" 2>/dev/null || true
cp "README.md" "${LEGACY_BUILD_DIR}/"

# Compile schemas for legacy
if [ -d "${LEGACY_BUILD_DIR}/schemas" ]; then
    echo "Compiling schemas for legacy version..."
    glib-compile-schemas "${LEGACY_BUILD_DIR}/schemas/"
fi

# Create legacy zip package
cd "${LEGACY_BUILD_DIR}"
zip -r "${BUILD_DIR}/${EXTENSION_NAME}-legacy-${VERSION}.zip" .
cd -

echo "Legacy package created: ${BUILD_DIR}/${EXTENSION_NAME}-legacy-${VERSION}.zip"

echo "Building modern version (GNOME 45-49)..."
mkdir -p "${MODERN_BUILD_DIR}"

# Copy modern extension files
cp "${MODERN_DIR}/extension.js" "${MODERN_BUILD_DIR}/extension.js"
cp "${PREFS_MODERN_DIR}/prefs.js" "${MODERN_BUILD_DIR}/prefs.js"
cp "metadata.json" "${MODERN_BUILD_DIR}/metadata.json"
cp -r "${SCHEMAS_DIR}" "${MODERN_BUILD_DIR}/"
cp -r "${ASSETS_DIR}" "${MODERN_BUILD_DIR}/" 2>/dev/null || true
cp -r "${LOCALE_DIR}" "${MODERN_BUILD_DIR}/" 2>/dev/null || true
cp "README.md" "${MODERN_BUILD_DIR}/"

# Compile schemas for modern
if [ -d "${MODERN_BUILD_DIR}/schemas" ]; then
    echo "Compiling schemas for modern version..."
    glib-compile-schemas "${MODERN_BUILD_DIR}/schemas/"
fi

# Create modern zip package
cd "${MODERN_BUILD_DIR}"
zip -r "${BUILD_DIR}/${EXTENSION_NAME}-modern-${VERSION}.zip" .
cd -

echo "Modern package created: ${BUILD_DIR}/${EXTENSION_NAME}-modern-${VERSION}.zip"

echo "Build completed successfully!"
echo "Packages available in ${BUILD_DIR}/:"
ls -la "${BUILD_DIR}/"