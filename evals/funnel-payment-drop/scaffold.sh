#!/bin/bash
# Copy the generated checkout event log into the empty eval workspace.
set -euo pipefail
cp "$(cd "$(dirname "$0")" && pwd)/../fixtures/checkout-funnel/checkout-events.csv" ./checkout-events.csv
