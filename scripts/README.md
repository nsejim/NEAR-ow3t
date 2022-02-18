# Introduction

Below is an example of a typical workflow to create a tree, register nodes, update outcome achievements of each node and generating a report for a given node

# Step-by-step process

The following process can be explored at [https://explorer.testnet.near.org/accounts/dev-1645171287689-40057017143222](https://explorer.testnet.near.org/accounts/dev-1645171287689-40057017143222)

## Deploy dev contract
./scripts/1.dev-deploy.sh 
## Create a tree
./scripts/1.build-tree.sh "Hello Tree" 100 

## List trees
./scripts/3.list-trees.sh  

```
[
  {
    ownerAccountId: 'nsejim.testnet',
    id: 'TREE-3707919279',
    name: 'Hello Tree',
    objective: '',
    outcome: 100
  }
]
```
## Register child nodes

### node 1
./scripts/4.register-node.sh "nsejim.testnet" 'TREE-3707919279'  "node1.nsejim.testnet"  30  "node1"

### node 2
./scripts/4.register-node.sh "nsejim.testnet" 'TREE-3707919279'  "node2.nsejim.testnet"  50  "node2"


## Each node update its completed outcome

./scripts/5.update-completed-outcome.sh "nsejim.testnet"  "TREE-3707919279" 5
./scripts/5.update-completed-outcome.sh "node2.nsejim.testnet"  "TREE-3707919279" 20
./scripts/5.update-completed-outcome.sh "node1.nsejim.testnet"  "TREE-3707919279" 10 

## Get report

./scripts/6.get-report.sh "TREE-3707919279"  "nsejim.testnet"
```
{
  node: {
    accountId: 'nsejim.testnet',
    assignedOutcome: 100,
    completedOutcome: 35,
    openOutcome: 10,
    depth: 0
  },
  children: [
    {
      accountId: 'node1.nsejim.testnet',
      assignedOutcome: 30,
      completedOutcome: 10,
      openOutcome: 20,
      depth: 1
    },
    {
      accountId: 'node2.nsejim.testnet',
      assignedOutcome: 50,
      completedOutcome: 20,
      openOutcome: 30,
      depth: 1
    },
    {
      accountId: 'node3.nsejim.testnet',
      assignedOutcome: 5,
      completedOutcome: 0,
      openOutcome: 5,
      depth: 1
    }
  ]
}
```