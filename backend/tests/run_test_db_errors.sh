#!/usr/bin/env bash
set -euo pipefail

# Activate the project's virtualenv then run the DB errors test
# Usage: ./backend/tests/run_test_db_errors.sh

if [ -f "venv/bin/activate" ]; then
  # shellcheck disable=SC1091
  . "venv/bin/activate"
else
  echo "Virtualenv not found at venv/bin/activate. Please create/activate your venv first." >&2
  exit 2
fi

PYTHONPATH=backend python3 backend/tests/test_db_errors.py
