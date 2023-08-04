import { ArrayUtils } from '../utils/ArrayUtils';
import { MGPFallible } from '../utils/MGPFallible';
import { MGPOptional } from '../utils/MGPOptional';
import { Utils } from '../utils/utils';
import { GameState } from './GameState';
import { GameStatus } from './GameStatus';
import { AI, AIIterationLimitOptions, GameNode, MoveGenerator } from './MGPNode';
import { Move } from './Move';
import { Player } from './Player';
import { Rules } from './Rules';

type NodeAndPath<M extends Move, S extends GameState> = {
    node: GameNode<M, S>,
    path: GameNode<M, S>[],
}

/*
 * Implement Monte-Carlo Tree Search
 * Useful resources to understand MCTS:
 *   - https://www.analyticsvidhya.com/blog/2019/01/monte-carlo-tree-search-introduction-algorithm-deepmind-alphago/
 *   - https://vgarciasc.github.io/mcts-viz/
 */
export class MCTS<M extends Move, S extends GameState, L = void> implements AI<M, S, AIIterationLimitOptions> {
    // The exploration parameter influences the MCTS results.
    // It is chosen "empirically" (this is the "generally recommended value" from Wikipedia)
    public static explorationParameter: number = Math.sqrt(2);

    public readonly availableOptions: AIIterationLimitOptions[] = [];
    /**
     * We need a minimax to get the list of moves.
     */
    public constructor(public readonly name: string,
                       private readonly moveGenerator: MoveGenerator<M, S>,
                       private readonly rules: Rules<M, S, L>) {
        for (let i: number = 1; i < 10; i++) {
            this.availableOptions.push({ name: `Level ${i}`, maxIterations: i*1000 });
        }
    }

    /**
     * Performs the search, given a node representing a board.
     * The search is performed for at most `iterations` iterations.
     */
    public chooseNextMove(root: GameNode<M, S>, options: AIIterationLimitOptions): M {
        Utils.assert(this.rules.getGameStatus(root).isEndGame === false, 'cannot search from a finished game');
        const player: Player = root.gameState.getCurrentPlayer();
        const startTime: number = new Date().getTime();
        for (let i: number = 0; i < options.maxIterations; i++) {
            // console.log('------ ITERATION ' + i)
            const expansionResult: NodeAndPath<M, S> = this.expand(this.select({ node: root, path: [root] }, i));
            const win: boolean = this.simulate(expansionResult.node, player);
            // if (win) console.log(`>>>>> win by player ${player} in node ${expansionResult.node.id}`)
            this.backpropagate(expansionResult.path, win);
        }
        // console.log('---- DONE')
        // console.log('root winRatio: ' + this.winRatio(root));
        // console.log(root.children.map((n) => n.id + ': ' + this.winRatio(n))); // .filter((n) => n > 0));
        const bestChild: GameNode<M, S> =
            ArrayUtils.maximumBy(root.getChildren(), (n: GameNode<M, S>) => this.winRatio(n));
        // console.log('best child is ' + bestChild.move.get().toString());
        const seconds =  (new Date().getTime() - startTime) / 1000;
        console.log('Computed ' + options.maxIterations/seconds + ' iterations per second');
        console.log('Best child has a win ratio of: ' + this.winRatio(bestChild));
        // root.printDot(this.rules, 0);
        return bestChild.move.get();
    }
    /**
     * Computes the UCB value of a node.
     * The UCB (Upper-Confidence-Bound) is a value used to select nodes to explore.
     */
    private ucb(node: GameNode<M, S>, totalSimulations: number): number {
        const simulations: number = this.simulations(node);
        if (totalSimulations === 0 || simulations === 0) {
            return Number.MAX_SAFE_INTEGER;
        }
        return (this.wins(node) / simulations) +
               MCTS.explorationParameter * Math.sqrt(Math.log(totalSimulations) / simulations);
    }
    /**
     * Computes the win ratio for this node, as how many simulations have been won.
     */
    private winRatio(node: GameNode<M, S>): number {
        const simulations: number = this.simulations(node);
        if (this.simulations(node) === 0) return 1;
        return this.wins(node) / simulations;
    }
    private wins(node: GameNode<M, S>): number {
        return this.getCounterFromCache(node, 'wins');
    }
    private simulations(node: GameNode<M, S>): number {
        return this.getCounterFromCache(node, 'simulations');
    }
    private getCounterFromCache(node: GameNode<M, S>, name: string): number {
        const cachedValue: MGPOptional<number> = node.getCache(name);
        if (cachedValue.isPresent()) {
            return cachedValue.get();
        } else {
            node.setCache(name, 0);
            return 0;
        }
    }
    /**
     * Selects the node that we will consider in this iteration.
     * This takes the first unexplored node it finds in a BFS fashion.
     * @returns the selected node
     */
    private select(nodeAndPath: NodeAndPath<M, S>, simulations: number): NodeAndPath<M, S> {
        const node: GameNode<M, S> = nodeAndPath.node;
        if (node.hasChildren()) {
            // Select within the child with the highest UCB value.
            // console.log('UCB');
            // console.log(node.children.map((n) => n.id + ': ' + n.ucb(simulations)));
            const childToVisit: GameNode<M, S> = ArrayUtils.maximumBy(node.getChildren(), (n: GameNode<M, S>) => this.ucb(n, simulations));
            // console.log('selecting ' + childToVisit.id);
            return this.select({ node: childToVisit, path: nodeAndPath.path.concat([childToVisit]) }, simulations);
        } else {
            // This is a leaf node, we select it.
            // console.log('this is a leaf node')
            return nodeAndPath;
        }
    }
    /**
     * Expands a node, i.e., creates children to explore if needed, or returns the node directly.
     * @returns one of the created child, or the node itself if it is terminal
     */
    private expand(nodeAndPath: NodeAndPath<M, S>): NodeAndPath<M, S> {
        // console.log('expand node ' + nodeAndPath.node.id + ' with current player ' + nodeAndPath.node.node.gameState.getCurrentPlayer());
        if (this.rules.getGameStatus(nodeAndPath.node).isEndGame) {
            // Even though we haven't explicitly explored this node (that is, selected it for expansion),
            // it is a terminal node. We won't try to calculate its child.
            return nodeAndPath;
        }
        const node: GameNode<M, S> = nodeAndPath.node;
        const moves: M[] = this.moveGenerator.getListMoves(node);
        // console.log('there are ' + moves.length);
        if (moves.length === 0) {
            // It has no children, this is a leaf node. We pick this one.
            return nodeAndPath;
        } else {
            // Create the children and pick the first one
            for (const move of moves) {
                // console.log('child ' + childId + ' is: ' + move.toString())
                node.addChild(move, this.play(node, move));
            }
            const pickedChild: GameNode<M, S> = ArrayUtils.getRandomElement(node.getChildren());
            return { node: pickedChild, path: nodeAndPath.path.concat([pickedChild]) };
        }
    }
    /**
     * Simulate a game from the given node. Does not change anything in the node.
     * @returns true if the simulation was a win
     */
    private simulate(node: GameNode<M, S>, player: Player): boolean {
        // console.log('simulate from node ' + node.id + ' which has a last move of ' + node.node.move.get().toString())
        let current: GameNode<M, S> = node;
        let steps: number = 0;
        do {
            const status: GameStatus = this.rules.getGameStatus(current);
            // console.log(status)
            if (status.isEndGame) {
                // console.log('!!!!! end game, winner is ' + status.winner);
                return status.winner === player;
            }
            steps++;
            current = this.playRandomStep(current);
        } while (steps < 1000);
        // Game has taken more than 1000 steps, we consider it a loss
        return false;
    }
    /**
     * Picks a random move and play it
     * @returns the state after the move
     */
    private playRandomStep(node: GameNode<M, S>): GameNode<M, S> {
        let move: M;
        // console.log('PLAYING')
        move = ArrayUtils.getRandomElement(this.moveGenerator.getListMoves(node));
        return this.play(node, move);
    }
    /**
     * Plays a move.
     * @returns the state after the move
     */
    private play(node: GameNode<M, S>, move: M): GameNode<M, S> {
        const legality: MGPFallible<L> = this.rules.isLegal(move, node.gameState);
        Utils.assert(legality.isSuccess(), 'heuristic returned illegal move');
        const childState: S = this.rules.applyLegalMove(move, node.gameState, legality.get());
        const childNode: GameNode<M, S> = new GameNode(childState, MGPOptional.of(node), MGPOptional.of(move));
        return childNode;
    }
    /**
     * Backpropagates the result of a simulation in a path from the simulated node to the root of the tree.
     * @returns nothing, as it modifies the nodes directly
     */
    private backpropagate(path: GameNode<M, S>[], win: boolean): void {
        // console.log('path is ' + path.length);
        for (const node of path) {
            this.newSimulation(node, win);
            // console.log(`backpropagate to node ${node.id} which now has ${node.wins/node.simulations}`);
        }
    }
    private newSimulation(node: GameNode<M, S>, win: boolean): void {
        const simulations: number = this.simulations(node) + 1;
        let wins: number = this.wins(node);
        if (win) wins++;
        node.setCache('wins', wins);
        node.setCache('simulations', simulations);
    }
}
