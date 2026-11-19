#!/bin/bash
# Copy the fixture project into the empty eval workspace.
set -euo pipefail
cp -R "$(cd "$(dirname "$0")" && pwd)/../fixtures/vibe-app/." ./
