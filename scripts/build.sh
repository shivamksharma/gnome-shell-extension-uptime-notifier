#!/bin/bash

set -e

# Build script for Uptime Notifier GNOME Shell extension
# Creates separate packages for legacy (GNOME 42-44) and modern (GNOME 45-49) versions

EXTENSION_UUID="uptime-notifier@sam.shell-extension"
LEGACY_VERSION="2.0.0"
MODERN_VERSION="3.0.0"

# Directories
LEGACY_SRC_DIR="legacy"
MODERN_SRC_DIR="src"
PREFS_LEGACY_DIR="prefs/legacy"
PREFS_MODERN_DIR="prefs"
SCHEMAS_DIR="schemas"
ASSETS_DIR="assets"
LOCALE_DIR="locale"
BUILD_DIR="$(pwd)/build"

# Clean previous builds
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

echo "Building legacy version (GNOME 42-44)..."

# Create staging directory
STAGING_DIR="${BUILD_DIR}/staging-legacy"
rm -rf "${STAGING_DIR}"
mkdir -p "${STAGING_DIR}"

# Copy legacy extension files directly to staging root
cp "${LEGACY_SRC_DIR}/extension.js" "${STAGING_DIR}/"
cp "${PREFS_LEGACY_DIR}/prefs.js" "${STAGING_DIR}/"
cp "metadata-legacy.json" "${STAGING_DIR}/metadata.json"
cp -r "${SCHEMAS_DIR}" "${STAGING_DIR}/"
cp -r "${ASSETS_DIR}" "${STAGING_DIR}/" 2>/dev/null || true
cp -r "${LOCALE_DIR}" "${STAGING_DIR}/" 2>/dev/null || true
cp "README.md" "${STAGING_DIR}/"
cp "LICENSE" "${STAGING_DIR}/" 2>/dev/null || true

# Compile schemas for legacy
if [ -d "${STAGING_DIR}/schemas" ]; then
    echo "Compiling schemas for legacy version..."
    glib-compile-schemas "${STAGING_DIR}/schemas/"
fi

# Create legacy zip package (files at root)
cd "${STAGING_DIR}"
zip -r "${BUILD_DIR}/${EXTENSION_UUID}-${LEGACY_VERSION}.zip" ./
cd - > /dev/null

echo "Legacy package created: ${BUILD_DIR}/${EXTENSION_UUID}-${LEGACY_VERSION}.zip"

# Cleanup staging
rm -rf "${STAGING_DIR}"

echo "Building modern version (GNOME 45-49)..."

# Create staging directory
STAGING_DIR="${BUILD_DIR}/staging-modern"
rm -rf "${STAGING_DIR}"
mkdir -p "${STAGING_DIR}"

# Copy modern extension files directly to staging root
cp "${MODERN_SRC_DIR}/extension.js" "${STAGING_DIR}/"
cp "${PREFS_MODERN_DIR}/prefs.js" "${STAGING_DIR}/"
cp "metadata.json" "${STAGING_DIR}/metadata.json"
cp -r "${SCHEMAS_DIR}" "${STAGING_DIR}/"
cp -r "${ASSETS_DIR}" "${STAGING_DIR}/" 2>/dev/null || true
cp -r "${LOCALE_DIR}" "${STAGING_DIR}/" 2>/dev/null || true
cp "README.md" "${STAGING_DIR}/"
cp "LICENSE" "${STAGING_DIR}/" 2>/dev/null || true

# Compile schemas for modern
if [ -d "${STAGING_DIR}/schemas" ]; then
    echo "Compiling schemas for modern version..."
    glib-compile-schemas "${STAGING_DIR}/schemas/"
    # Remove compiled schema for GNOME 45+ (not needed, see EGO-P-006)
    rm -f "${STAGING_DIR}/schemas/gschemas.compiled"
fi

# Create modern zip package (files at root)
cd "${STAGING_DIR}"
zip -r "${BUILD_DIR}/${EXTENSION_UUID}-${MODERN_VERSION}.zip" ./
cd - > /dev/null

echo "Modern package created: ${BUILD_DIR}/${EXTENSION_UUID}-${MODERN_VERSION}.zip"

# Cleanup staging
rm -rf "${STAGING_DIR}"

echo "Build completed successfully!"
echo "Packages available in ${BUILD_DIR}/:"
ls -la "${BUILD_DIR}/"
