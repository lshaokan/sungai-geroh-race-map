#!/usr/bin/env bash
# Builds tests/emu/firestore.rules for the local test database from the template in firebase/,
# filling in the codes from environment variables (the real codes are never stored in the repo).
#   ADMIN_CODE=... LEAD_CODE=... ./make-rules.sh
set -euo pipefail
cd "$(dirname "$0")"
: "${ADMIN_CODE:?set ADMIN_CODE}"; : "${LEAD_CODE:?set LEAD_CODE}"
sed -e "s/__ADMIN_CODE__/${ADMIN_CODE}/" -e "s/__LEAD_CODE__/${LEAD_CODE}/" ../../firebase/firestore.rules > firestore.rules
echo "wrote tests/emu/firestore.rules"
