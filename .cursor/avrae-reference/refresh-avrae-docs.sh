#!/usr/bin/env bash
# Re-download official Avrae Read the Docs RST sources (see .cursor/reference-cache.json).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "${HERE}/../scripts/refresh_upstream_reference_cache.py" avrae-rst
