import { ArrayUtils } from '../utils/ArrayUtils';
import { MGPFallible } from '../utils/MGPFallible';
import { MGPOptional } from '../utils/MGPOptional';
import { Utils } from '../utils/utils';
import { BoardValue } from './BoardValue';
import { GameState } from './GameState';
import { GameStatus } from './GameStatus';
import { MGPNode } from './MGPNode';
import { Minimax } from './Minimax';
import { Move } from './Move';
import { Player } from './Player';
import { Rules } from './Rules';

/**
 * A node is an MGPNode with a number of wins over a number of simulations
 * It can have childrens.
 */
class MCTSNode<R extends Rules<M, S, L>,
               M extends Move,
               S extends GameState,
               L = void,
               U extends BoardValue = BoardValue>
{

    // The number of simulations done from this node
    public simulations: number = 0;
    // The number of wins seen when simulating from this node
    public wins: number = 0;
    // The children of this node
    public children: MCTSNode<R, M, S, L, U>[] = []

    public constructor(
        public readonly id: number,
        public readonly node: MGPNode<R, M, S, L, U>)
    {
    }

    /**
     * Computes the UCB value of this node
     */
    public ucb(totalSimulations: number): number {
        if (totalSimulations === 0 || this.simulations === 0) {
            return Number.MAX_SAFE_INTEGER;
        }
        // console.log(`${this.wins} / ${this.simulations}) + ${MCTS.explorationParameter} * Math.sqrt(${Math.log(totalSimulations)} / ${this.simulations}`);
        // console.log((this.wins / this.simulations) + MCTS.explorationParameter * Math.sqrt(Math.log(totalSimulations) / this.simulations));
        return (this.wins / this.simulations) +
               MCTS.explorationParameter * Math.sqrt(Math.log(totalSimulations) / this.simulations);
    }
    /**
     * Computes the win ratio for this node
     */
    public winRatio(): number {
        if (this.simulations === 0) return 1;
        return this.wins / this.simulations;
    }
}

type NodeAndPath<R extends Rules<M, S, L>,
                 M extends Move,
                 S extends GameState,
                 L = void,
                 U extends BoardValue = BoardValue> =
{
    node: MCTSNode<R, M, S, L, U>,
    path: MCTSNode<R, M, S, L, U>[],
}

/*
 * Implement Monte-Carlo Tree Search
 * Useful resources to understand MCTS:
 *   - https://www.analyticsvidhya.com/blog/2019/01/monte-carlo-tree-search-introduction-algorithm-deepmind-alphago/
 *   - https://vgarciasc.github.io/mcts-viz/
 */
export class MCTS<R extends Rules<M, S, L>,
                  M extends Move,
                  S extends GameState,
                  L = void,
                  U extends BoardValue = BoardValue>
{
    // The exploration parameter influences the MCTS results.
    // It is chosen "empirically" (this is the "generally recommended value" from Wikipedia)
    public static explorationParameter: number = Math.sqrt(2);

    public static useMinimaxInsteadOfRandomMove: boolean = false;

    /**
     * We need a minimax to get the list of moves.
     */
    public constructor(private readonly minimax: Minimax<M, S, L, U>,
                       private readonly rules: Rules<M, S, L>) {
    }

    private id: number = 0;
    /**
     * Performs the search, given a node representing a board.
     * The search is performed for at most `iterations` iterations.
     */
    public search(start: MGPNode<R, M, S, L, U>, iterations: number = 1000): M {
        const root: MCTSNode<R, M, S, L, U> = new MCTSNode(0, start);
        const startTime: number = new Date().getTime();
        for (let i: number = 0; i < iterations; i++) {
            const expansionResult: NodeAndPath<R, M, S, L, U> =
                this.expand(this.select({ node: root, path: [root] }, i));
            const win: boolean = this.simulate(expansionResult.node, root.node.gameState.getCurrentPlayer());
            if (win) console.log('win by player ' + root.node.gameState.getCurrentPlayer() )
            this.backpropagate(expansionResult.path, win);
        }
        console.log('root winRatio: ' + root.winRatio());
        console.log(root.children.map((n) => n.id + ': ' + n.winRatio())); // .filter((n) => n > 0));
        const bestChild: MCTSNode<R, M, S, L, U> =
            ArrayUtils.maximumBy(root.children, (n: MCTSNode<R, M, S, L, U>) => n.winRatio());
        console.log('best child is ' + bestChild.id);
        const seconds =  (new Date().getTime() - startTime) / 1000;
        console.log('Computed ' + iterations/seconds + ' iterations per second');
        console.log('Best child has a win ratio of: ' + bestChild.winRatio());
        return bestChild.node.move.get();
    }
    /**
     * Selects the node that we will consider in this iteration.
     * This takes the first unexplored node it finds in a BFS fashion.
     * @returns the selected node
     */
    private select(nodeAndPath: NodeAndPath<R, M, S, L, U>, simulations: number): NodeAndPath<R, M, S, L, U> {
        const node: MCTSNode<R, M, S, L, U> = nodeAndPath.node;
        if (node.children.length === 0) {
            // This is a leaf node, we select it.
            // console.log('this is a leaf node')
            return nodeAndPath;
        } else {
            // Select within the child with the highest UCB value.
            console.log('UCB');
            console.log(node.children.map((n) => n.id + ': ' + n.ucb(simulations)));
            const childToVisit: MCTSNode<R, M, S, L, U> =
                ArrayUtils.maximumBy(node.children, (n: MCTSNode<R, M, S, L, U>) => n.ucb(simulations));
            console.log('selecting ' + childToVisit.id);
            return this.select({ node: childToVisit, path: nodeAndPath.path.concat([childToVisit]) }, simulations);
        }
    }
    /**
     * Expands a node, i.e., creates children to explore if needed, or returns the node directly.
     * @returns one of the created child, or the node itself if it is terminal
     */
    private expand(nodeAndPath: NodeAndPath<R, M, S, L, U>): NodeAndPath<R, M, S, L, U> {
        // console.log('expand')
        const node: MCTSNode<R, M, S, L, U> = nodeAndPath.node;
        const moves: M[] = this.minimax.getListMoves(node.node);
        // console.log('there are ' + moves.length);
        if (moves.length === 0) {
            // It has no children, this is a leaf node. We pick this one.
            return nodeAndPath;
        } else {
            const children: MCTSNode<R, M, S, L, U>[] = [];
            // Create the children and pick the first one
            for (const move of moves) {
                children.push(new MCTSNode(++this.id, this.play(node.node, move)));
            }
            node.children = children;
            const pickedChild: MCTSNode<R, M, S, L, U> = ArrayUtils.getRandomElement(children);
            return { node: pickedChild, path: nodeAndPath.path.concat([pickedChild]) };
        }
    }

    /**
     * Simulate a game from the given node. Does not change anything in the node.
     * @returns true if the simulation was a win
     */
    private simulate(node: MCTSNode<R, M, S, L, U>, player: Player): boolean {
        console.log('simulate ' + node.node.gameState.turn)
        let current: MGPNode<R, M, S, L, U> = node.node;
        let steps: number = 0;
        do {
            const status: GameStatus = this.rules.getGameStatus(current);
            console.log(status)
            if (status.isEndGame) {
                return status.winner === player;
            }
            steps++;
            Utils.assert(steps < 1000, 'MCTS: game too long');
            current = this.playRandomStep(current);
        } while (true);
    }
    /**
     * Picks a random move and play it
     * @returns the state after the move
     */
    private playRandomStep(node: MGPNode<R, M, S, L, U>): MGPNode<R, M, S, L, U> {
        let move: M;
        if (MCTS.useMinimaxInsteadOfRandomMove) {
            move = node.findBestMove(1, this.minimax);
        } else {
            move = ArrayUtils.getRandomElement(this.minimax.getListMoves(node));
            console.log('playing: ' + move)
        }
        return this.play(node, move);
    }
    /**
     * Plays a move.
     * @returns the state after the move
     */
    private play(node: MGPNode<R, M, S, L, U>, move: M): MGPNode<R, M, S, L, U> {
        const legality: MGPFallible<L> = this.rules.isLegal(move, node.gameState);
        Utils.assert(legality.isSuccess(), 'heuristic returned illegal move');
        const childState: S = this.rules.applyLegalMove(move, node.gameState, legality.get());
        const childNode: MGPNode<R, M, S, L, U> = new MGPNode(childState, MGPOptional.of(node), MGPOptional.of(move));
        return childNode;
    }
    /**
     * Backpropagates the result of a simulation in a path from the simulated node to the root of the tree.
     * @returns nothing, as it modifies the nodes directly
     */
    private backpropagate(path: MCTSNode<R, M, S, L, U>[], win: boolean): void {
        // console.log('path is ' + path.length);
        for (const node of path) {
            node.simulations++;
            if (win) node.wins++;
        }
    }
}
