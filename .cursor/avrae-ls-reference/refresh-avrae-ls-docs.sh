#!/usr/bin/env bash
# Re-download avrae-ls upstream markdown (see .cursor/reference-cache.json).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "${HERE}/../scripts/refresh_upstream_reference_cache.py" avrae-ls
