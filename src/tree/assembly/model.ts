import { Context } from 'near-sdk-as';

/**
 * NEAR AccountId
 *
 * @typedef {AccountId}
 */
export type AccountId = string;

/**
 * TreeId - Unique identifier
 *
 * @typedef {TreeId}
 */
export type TreeId = string;

/**
 * Class representing a tree
 * @class Tree
 */
@nearBindgen
export class Tree {
    
    /**
     * @property {AccountId}  ownerAccountId - The NEAR accountId of the tree's owner.
     * @public
     */
    ownerAccountId: AccountId; 

    /**
     * Creates an instance of Tree.
     * @constructor
     * @param {string} id - a unique identifier of a tree
     * @param {string} name - the name of a tree
     * @param {string} objective - the objective of a tree
     * @param {u32} outcome - the maximum value of the global outcome to be produced
     */
    constructor(
        public id: string,
        public name: string,
        public objective: string,
        public outcome: u32
    ) {
        this.ownerAccountId = Context.sender;
    }
}

/**
 * Class representing a node within a tree
 * @class Node
 */
@nearBindgen
export class Node {

    /**
     * @member {u32} completedOutcome - outcome already completed by a specific node
     */
    completedOutcome: u32 = 0;

    /**
     * Creates an instance of Node.
     *
     * @constructor
     * @param {string} description
     * @param {u32} assignedOutcome
     * @param {u32} depth
     */
    constructor(
       public description: string,
       public assignedOutcome: u32,
       public depth: u32   // The number of edges from the root to the node
    ) {

    }

    updateCompletedOutcome(outcome: u32, todoOutcome: u32): void {
        assert(outcome <= todoOutcome, "You cannot report more than " + todoOutcome.toString() + "!")
        this.completedOutcome += outcome;
    }
}

/**
 * Class representing edge (relationship) between nodes
 * @class Edge
 */
@nearBindgen
export class Edge {
    /**
     * Creates an edge instance.
     *
     * @constructor
     * @param {AccountId} parentAccountId - The NEAR accountId of the node parent for a given node
     * @param {AccountId[]} childAccountIds - The list of NEAR accounIds of child nodes for a given node
     */
    constructor(
        public parentAccountId: AccountId,
        public childAccountIds: AccountId[]
    ) {

    }

} 


/**
 * Class representing the report of a single node
 * @class NodeReport
 */
 @nearBindgen
export class NodeReport {
    /**
     * Creates an instance of NodeReport.
     * 
     * @constructor
     * @param {AccountId} accountId - The NEAR accountId of a node
     * @param {i32} assignedOutcome - The assigned outcome of a node
     * @param {i32} completedOutcome - The completed outcome of a node
     * @param {i32} openOutcome - The open outcome of a node
     * @param {i32} depth - The distance from root node
     */
    constructor(
        public accountId: AccountId,
        public assignedOutcome: i32,
        public completedOutcome: i32,
        public openOutcome: i32,
        public depth: i32,
    ){}
}

/**
 * Class representing the complete report of a node
 * @class NodeCompleteReport
 */
@nearBindgen
export class NodeCompleteReport {
    /**
     * Creates an instance of NodeCompleteReport.
     * 
     * @constructor
     * @param {NodeReport} node - Specific report of a node
     * @param {NodeReport[]} children - Reports of child nodes
     */
    constructor (
        public node: NodeReport, 
        public children: NodeReport[]
    ) {}
}
