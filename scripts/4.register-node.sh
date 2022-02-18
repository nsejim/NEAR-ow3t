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
echo "Step 1: create a tree"
echo
echo "(run this script again to see changes made by this file)"
echo ---------------------------------------------------------
echo

[ -z "$1" ] && echo "Missing 1st argument as senderId. Should be a string" && exit 1
[ -z "$2" ] && echo "Missing 2nd argument as treeId. Should be a string. Run list trees to get existing Ids" && exit 1
[ -z "$3" ] && echo "Missing 3rd argument as node accountId. Should be a string" && exit 1
[ -z "$4" ] && echo "Missing 4th argument as node assigned outcome. Should be a number" && exit 1
[ -z "$5" ] && echo "Missing 5th argument as node description. Should be a string" && exit 1

echo \$1 is [ $1 ] 
echo \$2 is [ $2 ]
echo \$3 is [ $3 ] 
echo \$4 is [ $4 ]
echo \$5 is [ $5 ] 

near call $CONTRACT "registerNode" '{"treeId": "'"$2"'", "newNodeAccountId": "'"$3"'", "assignedOutcome": '$4', "description": "'"$5"'" }' --accountId $1
