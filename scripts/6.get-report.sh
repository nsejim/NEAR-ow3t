#!/usr/bin/env bash

# exit on first error after this point to avoid redeploying with successful build
set -e

echo
echo ---------------------------------------------------------
echo "Step 0: Check for environment variables"
echo ---------------------------------------------------------
echo

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$CONTRACT" ] || echo "Found it! \$CONTRACT is set to [ $CONTRACT ]"

echo
echo
echo ---------------------------------------------------------
echo "Step 1: list trees"
echo
echo "(run this script again to see changes made by this file)"
echo ---------------------------------------------------------
echo

[ -z "$1" ] && echo "Missing 1st argument as treeId. Should be a string. Run list trees to get existing Ids" && exit 1
[ -z "$2" ] && echo "Missing 2nd argument as node accountId. Should be a string" && exit 1

near view $CONTRACT "getReport"  '{"treeId": "'"$1"'", "accountId": "'"$2"'"}'
