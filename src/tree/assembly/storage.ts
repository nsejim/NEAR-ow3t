
import { PersistentVector } from 'near-sdk-as';
import { PersistentMap } from 'near-sdk-as';
import { AccountId, Node, Tree, TreeId, Edge } from './model';


/**
 * State to store the list of trees
 * @constant
 * @type {PersistentVector<Tree>}
 */
export const trees = new PersistentVector<Tree>("trees");

/**
 * State to store the map of nodes
 * @constant
 * @type {PersistentMap<TreeId, Map<AccountId, Node>>}
 */
export const nodes = new PersistentMap<TreeId, Map<AccountId, Node>>("nodes");

/**
 * State to store the map of edges (relationships)
 * @constant
 * @type {PersistentMap<TreeId, Map<AccountId, Edge>>}
 */
export const edges = new PersistentMap<TreeId, Map<AccountId, Edge>>("edges");

