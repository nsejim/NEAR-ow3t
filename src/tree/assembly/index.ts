
import { AccountId, Node, Tree, TreeId, Edge, NodeReport, NodeCompleteReport } from './model';
import { context, logging } from 'near-sdk-as';
import { nodes, trees, edges } from './storage';
import { generateUniqueId } from '../../utils';



/**
 * A public method to create a tree with the provided information input
 *
 * @method
 * @param {string} name - the name of the tree
 * @param {i32} outcome - the numerical value representing the total targeted outcome
 * @param {string} [objective=''] - optional specific objective around the tree setup
 * @returns {string} - the id of the newly created tree
 */
export function createTree(name: string, outcome: i32, objective: string = ''): string {
  assert(outcome > 0, "Outcome quantity should be greater than 0");
  const treeId = generateUniqueId("TREE", _existingTreeIds());
  const newTree = new Tree(treeId, name, objective, outcome);
  trees.push(newTree);
  nodes.set(newTree.id, new Map<AccountId, Node>());
  edges.set(newTree.id, new Map<AccountId, Edge>());

  registerNode(newTree.id, context.sender, objective , outcome); // register root node
  logging.log(`Tree ${name} has been successfully created`)
  return newTree.id;
}

/**
 * A public method to register a node in a given tree with provided information
 * 
 * @param {TreeId} treeId - The id of the tree
 * @param {AccountId} newNodeAccountId - The NEAR accountId linked to the new node
 * @param {string} description - The description/specific objective of the node
 * @param {i32} assignedOutcome - The expected outcome
 */
export function registerNode(treeId: TreeId, newNodeAccountId: AccountId, description: string, assignedOutcome: i32): void{  
  assert(_findTreeIndex(treeId) > -1, "Tree not found!");
  assert(nodes.contains(treeId), "Tree nodes map not initiated!");
  assert(edges.contains(treeId), "Tree edges map not initiated!");

  const treeNodesMap = nodes.getSome(treeId);
  assert(!treeNodesMap.has(newNodeAccountId), "A node accountId can be registered only once !")

  if (context.sender != newNodeAccountId) {  // We don't have to make the below validation when creating the root node
    const todoOutcome = getTodoOutcomeToDelegate(treeId, context.sender);
    assert(assignedOutcome <= todoOutcome, "Cannot delegate more than " + todoOutcome.toString() + "allowed!")
  }

  const treeEdges = edges.getSome(treeId);
  treeEdges.set(newNodeAccountId, new Edge(context.sender, []))

  const parentEdge = treeEdges.get(context.sender);
  let depth = 0;
  if (context.sender != newNodeAccountId) { // Only register child if parent is different from child
    parentEdge.childAccountIds.push(newNodeAccountId);
    treeEdges.set(context.sender, parentEdge);
    depth = treeNodesMap.get(context.sender).depth + 1;
  } 
  edges.set(treeId, treeEdges);

  treeNodesMap.set(newNodeAccountId, new Node(description, assignedOutcome, depth))
  nodes.set(treeId, treeNodesMap);
  
}

/**
 * A public method to update completed outcome for the node related to the sender
 * 
 * @param {string} treeId - The id of the tree
 * @param {i32} outcome - The newly generated outcome
 */
export function updateCompletedOutcome(treeId: string, outcome: i32): void {
  assert(_findTreeIndex(treeId) > -1, "Tree not found!");
  const treeNodesMap = nodes.getSome(treeId);
  assert(treeNodesMap.has(context.sender), "The requested node has not been found !")

  const senderNode = treeNodesMap.get(context.sender);
  const todoOutcome = getTodoOutcomeToDelegate(treeId, context.sender);
  senderNode.updateCompletedOutcome(outcome, todoOutcome);
  treeNodesMap.set(context.sender, senderNode)
  nodes.set(treeId, treeNodesMap);
}

/**
 * A public method to get list of trees
 * 
 * @param {boolean} [affiliatedOnly=true] - A boolean to return either all trees or only affiliated trees 
 * @returns {Tree[]} - The list of trees
 */
export function getTrees(accountId: string = '', affiliatedOnly: boolean = true): Tree[] {
  let treeList: Tree[] = [];
  for (let index = 0; index < trees.length; index++) {
    const tree = trees[index];
    if (affiliatedOnly && accountId && nodes.getSome(tree.id).has(accountId)) {
      treeList.push(tree);
    } else {
      treeList.push(tree);
    }
  }
  return treeList;
}

/**
 * A public method to get the todo outcome

 * @param {TreeId} treeId - The id of the tree
 * @param {AccountId} accountId - The accountId related to a given node
 * @returns {i32}
 */
export function getTodoOutcomeToDelegate(treeId: TreeId, accountId: AccountId): i32 {
  assert(_findTreeIndex(treeId) > -1, "Tree not found!");
  let todoOutcome = nodes.getSome(treeId).get(accountId).assignedOutcome;
  for (let index = 0; index < edges.getSome(treeId).get(accountId).childAccountIds.length; index++) {
    const childAccountId = edges.getSome(treeId).get(accountId).childAccountIds[index];
    todoOutcome -= nodes.getSome(treeId).get(childAccountId).assignedOutcome
  }

  const treeNodesMap = nodes.getSome(treeId);
  const accountIdNode = treeNodesMap.get(accountId);
  todoOutcome -= accountIdNode.completedOutcome;
  return todoOutcome;
}

/**
 * A public method to get the report of a given node referenced by accountId

 * @param {string} treeId - The id of the tree
 * @param {string} accountId - The accountId related to a given node
 * @returns {NodeCompleteReport} - The complete report for a node
 */
 export function getReport(treeId: string, accountId: string): NodeCompleteReport {
  let nodeCompleteReport: NodeCompleteReport;
  assert(_findTreeIndex(treeId) > -1, "Tree not found!");
  const treeEdges = edges.getSome(treeId);
  assert(treeEdges.has(accountId), "The accountId is not found in the tree with ID = !" + treeId);
  const nodeEdges =  treeEdges.get(accountId);
  
  const childStates:  NodeReport[] = []
  
  let childrenCompletedOutcome = 0;
  for (let index = 0; index < nodeEdges.childAccountIds.length; index++) {
    const childAccountId = nodeEdges.childAccountIds[index];
    const childCompletedOutcome = _collectChildCompletedOutcome(treeId, childAccountId, 0)
    childStates.push(new NodeReport(
      childAccountId,
      nodes.getSome(treeId).get(childAccountId).assignedOutcome,
      childCompletedOutcome,
      getTodoOutcomeToDelegate(treeId, childAccountId),
      nodes.getSome(treeId).get(childAccountId).depth
    ))
    childrenCompletedOutcome += childCompletedOutcome
  }

  nodeCompleteReport = new NodeCompleteReport(
    new NodeReport(
      accountId,
      nodes.getSome(treeId).get(accountId).assignedOutcome,
      nodes.getSome(treeId).get(accountId).completedOutcome + childrenCompletedOutcome,
      getTodoOutcomeToDelegate(treeId, accountId),
      nodes.getSome(treeId).get(accountId).depth
    ), 
    childStates
  ); 

  return nodeCompleteReport
}


/**
 * A private method to recursively collect the outcome of all descendents of a given node
 *
 * @param {string} treeId - the id of the tree
 * @param {string} accountId - the accountId referencing a node within the tree 
 * @param {i32} totalOutcome - the total aggregated outcome
 * @returns {i32} - the outcome
 */
function _collectChildCompletedOutcome(treeId: string, accountId: string, totalOutcome: i32): i32 {
  assert(_findTreeIndex(treeId) > -1, "Tree not found!");
  const treeNodesMap = nodes.getSome(treeId);
  totalOutcome += treeNodesMap.get(accountId).completedOutcome;
  
  const treeEdges = edges.getSome(treeId);
  const nodeEdges =  treeEdges.get(accountId);

  for (let index = 0; index < nodeEdges.childAccountIds.length; index++) {
    const childAccountId = nodeEdges.childAccountIds[index];
    totalOutcome = _collectChildCompletedOutcome(treeId, childAccountId, totalOutcome)
  }

  return totalOutcome;
}

/**
 * A private method to find the index of a given tree in the list of trees
 * 
 *
 * @param {string} treeId - The id of the tree
 * @returns {i32} - The index with the tree list
 */
function _findTreeIndex(treeId: string): i32 {
  let i = 0;
  while ((i < trees.length) && (trees[i].id != treeId)) {
    i +=1;
  }
  return i < trees.length ? i : -1;
}

/**
 * A private method to find existing tree ids
 * @private
 * @returns {string[]} - List of existing ids
 */
function _existingTreeIds(): string[] {
  let ids: string[] = []
  for (let index = 0; index < trees.length; index++) {
      const Tree = trees[index];
      ids.push(Tree.id);
  }
  return ids;
}