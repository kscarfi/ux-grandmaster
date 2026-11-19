#!/bin/bash
# Copy the seeded transfer screen into the empty eval workspace.
set -euo pipefail
cp "$(cd "$(dirname "$0")" && pwd)/../fixtures/transfer-screen/index.html" ./index.html
