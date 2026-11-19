#!/bin/bash
# Copy fixtures into the empty eval workspace.
set -euo pipefail
F="$(cd "$(dirname "$0")" && pwd)/../fixtures"
mkdir -p leeward && cp "$F/leeward/DESIGN.md" "$F/leeward/leeward.light.css" leeward/
