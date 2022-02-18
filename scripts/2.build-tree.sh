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
[ -z "$TREEOWNER" ] && echo "Missing \$TREEOWNER environment variable" && exit 1
[ -z "$TREEOWNER" ] || echo "Found it! \$TREEOWNER is set to [ $TREEOWNER ]"

echo
echo
echo ---------------------------------------------------------
echo "Step 1: create a tree"
echo
echo "(run this script again to see changes made by this file)"
echo ---------------------------------------------------------
echo

[ -z "$1" ] && echo "Missing first argument as tree name. Should be a string" && exit 1
[ -z "$2" ] && echo "Missing second argument as tree outcome. SHould be a number" && exit 1

echo \$1 is [ $1 ] 
echo \$2 is [ $2 ]

near call $CONTRACT "createTree"  '{"name": "'"$1"'", "outcome": '$2'}' --accountId $TREEOWNER

