
import { Context, VMContext } from 'near-sdk-as';
import { createTree, registerNode, getTodoOutcomeToDelegate, updateCompletedOutcome, getReport } from '../assembly/index';
import { nodes, trees, edges } from '../assembly/storage';

describe('Tree', () => {

    beforeEach(() => {
        VMContext.setSigner_account_id("nsejim.testnet");
    })

    describe('createTree method', () => {
        it('should Tree list be increased by 1 after creating a new Tree', () => {
            // Act
            const treeId = createTree("Export Coffee", 1000);
            
            // Assert
            expect(trees.length).toBe(1);
            expect(trees[0].id).toStrictEqual(treeId);
        })
    })

    describe('registerNode method', () => {
        itThrows("should fail when registering a node in an non-existant Tree", () => {
            registerNode("1", "toto.testnet", "Rwanda Country Manager", 200);
        })

        it('should register the creator of an Tree as a node and assign the quantity correctly', () => {
            // Act
            const treeId = createTree("Export Coffee", 1000);
    
            // Assert
            const orgNodesMap  = nodes.getSome(treeId);
            expect(orgNodesMap.has(Context.sender)).toBe(true);
            expect(orgNodesMap.get(Context.sender).assignedOutcome).toBe(1000);
        })

        it('should correctly initiate the relationship of the Tree creator', () => {
            // Act
            const treeId = createTree("Export Coffee", 1000);
    
            // Assert
            const orgRelationship = edges.getSome(treeId);
            expect(orgRelationship.get(Context.sender).parentAccountId).toBe(Context.sender);
            expect(orgRelationship.get(Context.sender).childAccountIds.length).toBe(0);  
        })

        it('should register the node as a child of the owner', () => {
            // Arrange
            const treeId = createTree("Export Coffee", 1000);
            
            // Act
            registerNode(treeId, "toto.testnet", "Rwanda Country Manager", 200);
            
            // Assert
            const orgNodesMap  = nodes.getSome(treeId);
            expect(orgNodesMap.has(Context.sender)).toBe(true);
            expect(orgNodesMap.has("toto.testnet")).toBe(true);
            const orgRelationship = edges.getSome(treeId);
            expect(orgRelationship.get(Context.sender).childAccountIds.length).toBe(1);
            expect(orgRelationship.get("toto.testnet").parentAccountId).toBe(Context.sender);
            expect(getTodoOutcomeToDelegate(treeId, Context.sender)).toBe(800);  
        })

        it('should each node have the correct depth', () => {
            // Arrange
            const treeId = createTree("Export Coffee", 1000);
            
            // Act
            registerNode(treeId, "toto.testnet", "Rwanda", 200);
            VMContext.setSigner_account_id("toto.testnet");
            registerNode(treeId, "alice.testnet", "RDC", 100);
            VMContext.setSigner_account_id("alice.testnet");
            registerNode(treeId, "bob.testnet", "Burundi", 50);

            // Assert
            const treeNodesMap = nodes.getSome(treeId);
            expect(treeNodesMap.get("nsejim.testnet").depth).toBe(0);
            expect(treeNodesMap.get("toto.testnet").depth).toBe(1);
            expect(treeNodesMap.get("alice.testnet").depth).toBe(2);
            expect(treeNodesMap.get("bob.testnet").depth).toBe(3);
        })

        itThrows('should fail when trying to allocate more than allowed', () => {
            const treeId = createTree("Export Coffee", 1000);
            registerNode(treeId, "toto.testnet", "Rwanda Country Manager", 2000);
        })

    })


    describe('updateCompletedOutcome method', () => {
        it('should correctly update the node counter', () => {
            // Arrange
            const treeId = createTree("Export Coffee", 1000);
            registerNode(treeId, "toto.testnet", "Rwanda", 200);
            registerNode(treeId, "alice.testnet", "RDC", 500);
            registerNode(treeId, "bob.testnet", "Burundi", 300);
            
            // Act
            VMContext.setSigner_account_id("alice.testnet");
            updateCompletedOutcome(treeId, 400);
            
            // Assert
            const openQuantity = getTodoOutcomeToDelegate(treeId, Context.sender);
            expect(openQuantity).toBe(100);
        })
    })

    describe('getReport method', () => {
        it('should correctly generate the complete report of a node', () => {
            // Arrange
            const treeId = createTree("Export Coffee", 1000);
            registerNode(treeId, "toto.testnet", "Rwanda", 200);
            registerNode(treeId, "alice.testnet", "RDC", 500);
            registerNode(treeId, "bob.testnet", "Burundi", 200);
            
            // Act
            updateCompletedOutcome(treeId, 80);
            VMContext.setSigner_account_id("alice.testnet");
            updateCompletedOutcome(treeId, 200);
            registerNode(treeId, "claude.testnet", "RDC", 100);
            VMContext.setSigner_account_id("claude.testnet");
            updateCompletedOutcome(treeId, 20);
            
            // Assert
            expect(getReport(treeId, "nsejim.testnet").children.length).toBe(3);
            expect(getReport(treeId, "alice.testnet").children.length).toBe(1);
            expect(getReport(treeId, "nsejim.testnet").node.completedOutcome).toBe(300);
            expect(getReport(treeId, "alice.testnet").node.completedOutcome).toBe(220);
        })
    })




})