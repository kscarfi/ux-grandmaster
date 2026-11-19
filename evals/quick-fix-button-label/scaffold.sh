#!/bin/bash
# Copy fixtures into the empty eval workspace.
set -euo pipefail
F="$(cd "$(dirname "$0")" && pwd)/../fixtures"
cp "$F/quick-fix/form.html" ./form.html
