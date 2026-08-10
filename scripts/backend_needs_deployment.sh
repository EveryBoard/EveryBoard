#!/bin/sh
# Get the curent version of the backend from the source code (in the form of let version_number : string = "1.0.0" for example)
CURRENT_VERSION=$(cd backend && make version)
# Get the deployed version number, where the server is provided as an argument to the script
DEPLOYED_VERSION=$(curl -s "$1"/version)

printf 'Backend version check: source=%s, deployed=%s\n' \
    "$CURRENT_VERSION" "$DEPLOYED_VERSION"

# If versions differ, we need to redeploy
if [ "$CURRENT_VERSION" = "$DEPLOYED_VERSION" ]; then
    echo "Backend versions match; skipping deployment."
    exit 1
fi

echo "Backend versions differ; deployment required."
exit 0
