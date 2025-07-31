#!/bin/bash

# Set the GitHub token environment variable
export GH_TOKEN="${GITHUB_TOKEN}"

# Print environment info for debugging
echo "GH_TOKEN is set: $([ -n "$GH_TOKEN" ] && echo "yes" || echo "no")"
echo "GITHUB_TOKEN is set: $([ -n "$GITHUB_TOKEN" ] && echo "yes" || echo "no")"

# Run the electron build
npm run electron:dist:ci -- "$@"
