import { ArrayUtils } from '../utils/ArrayUtils';
import { MGPFallible } from '../utils/MGPFallible';
import { MGPOptional } from '../utils/MGPOptional';
import { Debug, Utils } from '../utils/utils';
import { GameState } from './GameState';
import { GameStatus } from './GameStatus';
import { AI, AITimeLimitOptions, GameNode, MoveGenerator } from './MGPNode';
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
export class MCTS<M extends Move, S extends GameState, L = void> implements AI<M, S, AITimeLimitOptions> {
    // The exploration parameter influences the MCTS results.
    // It is chosen "empirically" (this is the "generally recommended value" from Wikipedia)
    public explorationParameter: number = Math.sqrt(2);

    // The longest a game can be before we decide to stop simulating it
    public maxGameLength: number = 1000;

    public readonly availableOptions: AITimeLimitOptions[] = [];

    public constructor(public readonly name: string,
                       private readonly moveGenerator: MoveGenerator<M, S>,
                       private readonly rules: Rules<M, S, L>)
    {
        for (let i: number = 1; i < 10; i++) {
            this.availableOptions.push({ name: `${i} seconds`, maxSeconds: i });
        }
    }

    /**
     * Performs the search, given a node representing a board.
     * The search is performed for at most `iterations` iterations.
     */
    public chooseNextMove(root: GameNode<M, S>, options: AITimeLimitOptions): M {
        Utils.assert(this.rules.getGameStatus(root).isEndGame === false, 'cannot search from a finished game');
        const player: Player = root.gameState.getCurrentPlayer();
        const startTime: number = Date.now();
        let iterations: number = 0;
        do {
            const expansionResult: NodeAndPath<M, S> = this.expand(this.select({ node: root, path: [root] }));
            const gameStatus: GameStatus = this.simulate(expansionResult.node);
            this.backpropagate(expansionResult.path, this.winScore(gameStatus, player));
            iterations++;
        } while (Date.now() < startTime + options.maxSeconds * 1000);
        Debug.display('MCTS', 'chooseNextMove', 'root winRatio: ' + this.winRatio(root));
        const bestChild: GameNode<M, S> =
            ArrayUtils.maximumBy(root.getChildren(), (n: GameNode<M, S>) => this.winRatio(n));
        const seconds: number = (Date.now() - startTime) / 1000;
        Debug.display('MCTS', 'chooseNextMove', 'Computed ' + iterations + ' in ' + seconds);
        Debug.display('MCTS', 'chooseNextMove', 'Best child has a win ratio of: ' + this.winRatio(bestChild));
        return bestChild.previousMove.get();
    }
    private winScore(gameStatus: GameStatus, player: Player): number {
        switch (gameStatus) {
            case GameStatus.DRAW:
            case GameStatus.ONGOING:
                return 0.5;
            default:
                if (gameStatus.winner === player) return 1;
                else return 0;
        }
    }
    /**
     * Computes the UCB value of a node.
     * The UCB (Upper-Confidence-Bound) is a value used to select nodes to explore.
     */
    private ucb(node: GameNode<M, S>, parentSimulations: number): number {
        const simulations: number = this.simulations(node);
        if (parentSimulations === 0 || simulations === 0) {
            return Number.MAX_SAFE_INTEGER;
        }
        return (this.wins(node) / simulations) +
               this.explorationParameter * Math.sqrt(Math.log(parentSimulations) / simulations);
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
    private select(nodeAndPath: NodeAndPath<M, S>): NodeAndPath<M, S> {
        const node: GameNode<M, S> = nodeAndPath.node;
        Debug.display('MCTS', 'select', node.id);
        if (node.hasChildren()) {
            const simulations: number = this.simulations(node);
            // Select within the child with the highest UCB value.
            Debug.display('MCTS', 'select', (node.getChildren().map((n: GameNode<M, S>) => n.id + ': ' + this.ucb(node, simulations))));
            const childToVisit: GameNode<M, S> =
                ArrayUtils.maximumBy(node.getChildren(), (n: GameNode<M, S>) => this.ucb(n, simulations));
            Debug.display('MCTS', 'select', 'selecting ' + childToVisit.id);
            return this.select({ node: childToVisit, path: nodeAndPath.path.concat([childToVisit]) });
        } else {
            // This is a leaf node, we select it.
            Debug.display('MCTS', 'select', 'this is a leaf node, we select it');
            return nodeAndPath;
        }
    }
    /**
     * Expands a node, i.e., creates children to explore if needed, or returns the node directly.
     * @returns one of the created child, or the node itself if it is terminal
     */
    private expand(nodeAndPath: NodeAndPath<M, S>): NodeAndPath<M, S> {
        if (this.rules.getGameStatus(nodeAndPath.node).isEndGame) {
            // Even though we haven't explicitly explored this node (that is, selected it for expansion),
            // it is a terminal node. We won't try to calculate its child.
            return nodeAndPath;
        }
        const node: GameNode<M, S> = nodeAndPath.node;
        const moves: M[] = this.moveGenerator.getListMoves(node);
        Utils.assert(moves.length > 0, `${this.name}: move generator did not return any move on a non-finished game: ${this.moveGenerator.constructor.name}`);
        // Create the children and pick the first one
        for (const move of moves) {
            node.addChild(this.play(node, move));
        }
        const pickedChild: GameNode<M, S> = ArrayUtils.getRandomElement(node.getChildren());
        return { node: pickedChild, path: nodeAndPath.path.concat([pickedChild]) };
    }
    /**
     * Simulate a game from the given node. Does not change anything in the node.
     * @returns the game status at the end of the simulation
     */
    private simulate(node: GameNode<M, S>): GameStatus {
        Debug.display('MCTS', 'simulate', 'simulate from node which has a last move of ' + node.previousMove.get().toString());
        let current: GameNode<M, S> = node;
        let steps: number = 0;
        do {
            const status: GameStatus = this.rules.getGameStatus(current);
            if (status.isEndGame) {
                Debug.display('MCTS', 'simulate', `end game in ${steps} steps, winner is ${status.winner}`);
                return status;
            }
            steps++;
            current = this.playRandomStep(current);
        } while (steps < this.maxGameLength);
        // Game has taken more than MAX_GAME_LENGTH steps
        return GameStatus.ONGOING;
    }
    /**
     * Picks a random move and play it
     * @returns the state after the move
     */
    private playRandomStep(node: GameNode<M, S>): GameNode<M, S> {
        const move: M = ArrayUtils.getRandomElement(this.moveGenerator.getListMoves(node));
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
    private backpropagate(path: GameNode<M, S>[], winScore: number): void {
        for (const node of path) {
            this.addSimulationResult(node, winScore);
            Debug.display('MCTS', 'backpropagate', `backpropagate to node which now has ${this.wins(node)/this.simulations(node)}`);
        }
    }
    private addSimulationResult(node: GameNode<M, S>, winScore: number): void {
        const simulations: number = this.simulations(node) + 1;
        const wins: number = this.wins(node) + winScore;
        node.setCache('wins', wins);
        node.setCache('simulations', simulations);
    }
}
