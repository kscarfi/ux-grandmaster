#!/bin/bash
set -euo pipefail
F="$(cd "$(dirname "$0")" && pwd)/../fixtures"
cp "$F/interviews/interviews.md" ./interviews.md
