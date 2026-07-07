#!/bin/sh

# Launches EAS cloud builds. Configuration arrives through two channels:
#   - CI/CD variables forwarded via `docker run -e` (EXPO_TOKEN, EAS_PROJECT_ID, EAS_PROJECT_OWNER,
#     EXPO_PUBLIC_IOS_BUNDLE_ID, EXPO_PUBLIC_ANDROID_PACKAGE, PUBLISH_PLATFORM, *_FIRST_RELEASE).
#   - .env.publish, generated + committed by the platform, holding EXPO_PUBLIC_APP_SLUG / _APP_NAME /
#     _APP_SCHEME and the API/logger URLs. Expo does NOT auto-load this non-standard filename, so we
#     export it here before building. Doing so also overrides any empty value that was forwarded via
#     `-e` (a forwarded empty var would otherwise win, since dotenv never overrides a set env var).
set -e

cd /app/project

if [ -f .env.publish ]; then
  echo "Loading publish environment from .env.publish"
  # Parse KEY=VALUE without shell-evaluating VALUE, so unquoted spaces (app name) and special chars
  # (& / ? in URLs) are safe. Strip one layer of surrounding single/double quotes if present.
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in ''|'#'*) continue ;; esac
    key=${line%%=*}
    val=${line#*=}
    case "$val" in
      \"*\") val=${val#\"}; val=${val%\"} ;;
      \'*\') val=${val#\'}; val=${val%\'} ;;
    esac
    export "$key=$val"
  done < .env.publish
fi

echo "Mobile build: platform=${PUBLISH_PLATFORM:-both} androidFirst=${ANDROID_FIRST_RELEASE:-false} iosFirst=${IOS_FIRST_RELEASE:-false}"

# Kick off the build for a single platform on Expo's cloud (--no-wait; the backend polls status).
# Auto-submit only when it is NOT that platform's first release (first release = manual upload once).
build_platform() {
  platform="$1"
  first_release="$2"
  if [ "$first_release" = "true" ]; then
    echo "Building $platform (first release — manual upload, no auto-submit)"
    eas build --platform "$platform" --profile production --non-interactive --no-wait
  else
    echo "Building $platform (subsequent release — auto-submit)"
    eas build --platform "$platform" --profile production --non-interactive --no-wait --auto-submit
  fi
}

case "${PUBLISH_PLATFORM:-both}" in
  android) build_platform android "${ANDROID_FIRST_RELEASE:-false}" ;;
  ios) build_platform ios "${IOS_FIRST_RELEASE:-false}" ;;
  *) build_platform android "${ANDROID_FIRST_RELEASE:-false}"; build_platform ios "${IOS_FIRST_RELEASE:-false}" ;;
esac
