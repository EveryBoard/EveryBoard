import { Move } from './Move';
import { SCORE } from './SCORE';
import { Rules } from './Rules';
import { MGPMap } from '../utils/MGPMap';
import { assert, display } from 'src/app/utils/utils';
import { NodeUnheritance } from './NodeUnheritance';
import { Minimax } from './Minimax';
import { MGPSet } from '../utils/MGPSet';
import { MGPOptional } from '../utils/MGPOptional';
import { Player } from './Player';
import { GameState } from './GameState';
import { MGPFallible } from '../utils/MGPFallible';

export class MGPNodeStats {
    public static createdNodes: number = 0;
    public static minimaxTime: number = 0;
}

export class MGPNode<R extends Rules<M, S, L>,
                     M extends Move,
                     S extends GameState,
                     L = void,
                     U extends NodeUnheritance = NodeUnheritance> {
    // TODO: calculate a board - value by the information of the mother.boardValue + this.move to ease the calculation
    // TODO: check for the proper use of LinkedList to optimise the stuff
    // TODO: when AI has all choice at bestHopedValue equality, she must split by average?

    public static VERBOSE: boolean = false;

    // Contains data related to the game and not to the minimax, ruler is the only instance of a set of rules
    public static ruler: Rules<Move, GameState, unknown>;

    public static minimaxes: MGPMap<string, Minimax<Move, GameState>> = new MGPMap();

    private childs: MGPOptional<MGPNode<R, M, S, L, U>[]> = MGPOptional.empty();
    /* empty if we did not create potential children of a node, hence also if it is a leaf (depth = 0)
    *
    * an empty ArrayList if it is the end of the game (and then a leaf)
    *
    * otherwise, an ArrayList of all nodes that we can obtain from this node.
    */

    private readonly hopedValue: MGPMap<string, number> = new MGPMap();
    /* key is the name of the Minimax
     * value: if it's a leaf: its own board value
     * else: the board value of this node best descendant
     */

    private readonly ownValue: MGPMap<string, U> = new MGPMap();

    private readonly possibleMoves: MGPMap<string, MGPSet<M>> = new MGPMap();
    /* Can contain more move than childs, in case of pruning
     * should be only calculated once
     */

    public static getScoreStatus(score: number): SCORE {
        /* the score status is VICTORY if the score is minValue or MaxValue,
         * because it's how we encode the boardValue if there's a victory
         */
        const LOCAL_VERBOSE: boolean = false;
        if (score === Number.MAX_SAFE_INTEGER) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'VICTORY');
            return SCORE.VICTORY;
        }
        if (score === Number.MIN_SAFE_INTEGER) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'VICTORY');
            return SCORE.VICTORY;
        }
        if (score === Number.MIN_SAFE_INTEGER + 1) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'PRE_VICTORY_MIN');
            return SCORE.PRE_VICTORY;
        }
        if (score === Number.MAX_SAFE_INTEGER - 1) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'PRE_VICTORY_MAX');
            return SCORE.PRE_VICTORY;
        }
        display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'DEFAULT');
        return SCORE.DEFAULT;
    }
    constructor(public readonly gameState: S,
                public readonly mother: MGPOptional<MGPNode<R, M, S, L, U>> = MGPOptional.empty(),
                public readonly move: MGPOptional<M> = MGPOptional.empty(),
                public minimaxCreator?: Minimax<M, S, L, U>)
    {
        /* Initialisation condition:
         * mother: null for initial board
         * board: should already be a clone
         */
        const LOCAL_VERBOSE: boolean = false;
        this.ownValue = new MGPMap<string, U>();
        if (minimaxCreator != null) {
            const firstValue: U = minimaxCreator.getBoardValue(this);
            this.ownValue.set(minimaxCreator.name, firstValue);
            this.hopedValue.set(minimaxCreator.name, firstValue.value);
        }
        MGPNodeStats.createdNodes++;
        display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'creating ' + this.myToString());
    }
    public findBestMove(readingDepth: number,
                        minimax: Minimax<M, S, L, U>,
                        random: boolean = false,
                        prune: boolean = true)
    : M
    {
        const startTime: number = new Date().getTime();
        let bestDescendant: MGPNode<R, M, S, L, U> = this.alphaBeta(readingDepth,
                                                                    Number.MIN_SAFE_INTEGER,
                                                                    Number.MAX_SAFE_INTEGER,
                                                                    minimax,
                                                                    random,
                                                                    prune);
        while (bestDescendant.gameState.turn > this.gameState.turn + 1) {
            bestDescendant = bestDescendant.mother.get();
            readingDepth--;
        }
        MGPNodeStats.minimaxTime += new Date().getTime() - startTime;
        return bestDescendant.move.get();
    }
    public alphaBeta(depth: number,
                     alpha: number,
                     beta: number,
                     minimax: Minimax<M, S, L, U>,
                     random: boolean,
                     prune: boolean)
    : MGPNode<R, M, S, L, U>
    {
        const LOCAL_VERBOSE: boolean = false;
        if (depth < 1) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'isLeaf-Calculation : ' + this.myToString() + ' at depth ' + depth);
            return this; // leaf by calculation
        } else if (minimax.ruler.getGameStatus(this).isEndGame) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'isLeaf-EndGame(' + MGPNode.ruler.getGameStatus(this).winner.toString() + ') : ' + this.myToString() + ' at depth ' + depth);
            return this; // rules - leaf or calculation - leaf
        }
        const possibleMoves: M[] = this.getPossibleMoves(minimax);
        assert(possibleMoves.length > 0, 'Minimax ' + minimax.name + ' should give move, received none!');
        if (this.childs.isAbsent()) {
            this.childs = MGPOptional.of([]);
        }
        let bestChilds: MGPNode<R, M, S, L, U>[] = [];
        const currentPlayer: Player = this.gameState.getCurrentPlayer();
        let extremumExpected: number =
            currentPlayer === Player.ZERO ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
        const newValueIsBetter: (newValue: number, currentValue: number) => boolean =
            currentPlayer === Player.ZERO ? ((a: number, b: number) => a < b) : ((a: number, b: number) => a > b);
        for (const move of possibleMoves) {
            const child: MGPNode<R, M, S, L, U> = this.getOrCreateChild(move, minimax);
            const bestChildDescendant: MGPNode<R, M, S, L, U> =
                child.alphaBeta(depth - 1, alpha, beta, minimax, random, prune);
            const bestChildValue: number = bestChildDescendant.getHopedValue(minimax);
            if (newValueIsBetter(bestChildValue, extremumExpected) || bestChilds.length === 0) {
                extremumExpected = bestChildValue;
                bestChilds = [bestChildDescendant];
            } else if (bestChildValue === extremumExpected) {
                bestChilds.push(bestChildDescendant);
            }
            if (prune && newValueIsBetter(extremumExpected, currentPlayer === Player.ZERO ? alpha : beta)) {
                // cut-off, no need to explore the other childs
                break;
            }
            if (currentPlayer === Player.ZERO) {
                beta = Math.min(extremumExpected, beta);
            } else {
                alpha = Math.max(extremumExpected, alpha);
            }
        }
        let bestChild: MGPNode<R, M, S, L, U>;
        if (random) {
            const randomIndex: number = Math.floor(Math.random() * bestChilds.length);
            bestChild = bestChilds[randomIndex];
        } else {
            bestChild = bestChilds[0];
        }
        const bestChildHopedValue: number = bestChild.hopedValue.get(minimax.toString()).get();
        this.hopedValue.put(minimax.toString(), bestChildHopedValue);
        return bestChild;
    }
    private getPossibleMoves(minimax: Minimax<M, S, L, U>): M[] {
        const currentMoves: MGPOptional<MGPSet<M>> = this.possibleMoves.get(minimax.name);
        if (currentMoves.isAbsent()) {
            const moves: M[] = minimax.getListMoves(this);
            this.possibleMoves.set(minimax.name, new MGPSet(moves));
            return moves;
        } else {
            return currentMoves.get().getCopy();
        }
    }
    private getOrCreateChild(move: M, minimax: Minimax<M, S, L, U>): MGPNode<R, M, S, L, U> {
        let child: MGPOptional<MGPNode<R, M, S, L, U>> = this.getSonByMove(move);
        if (child.isAbsent()) {
            const legality: MGPFallible<L> = minimax.ruler.isLegal(move, this.gameState);
            assert(legality.isSuccess(), 'The minimax has accepted an illegal move, this should not happen.');
            const state: S = minimax.ruler.applyLegalMove(move, this.gameState, legality.get());
            child = MGPOptional.of(new MGPNode(state, MGPOptional.of(this), MGPOptional.of(move), minimax));
            this.childs.get().push(child.get());
        }
        return child.get();
    }
    public getSonByMove(move: M): MGPOptional<MGPNode<R, M, S, L, U>> {
        assert(this.childs.isPresent(), 'Cannot get son of uncalculated node');
        for (const node of this.childs.get()) {
            if (node.move.isPresent() && node.move.equalsValue(move)) {
                return MGPOptional.of(node);
            }
        }
        return MGPOptional.empty();
    }
    public getInitialNode(): MGPNode<R, M, S, L, U> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let almightyMom: MGPNode<R, M, S, L, U> = this;
        while (almightyMom.mother.isPresent()) {
            almightyMom = almightyMom.mother.get();
        }
        return almightyMom;
    }
    public getHopedValue(minimax: Minimax<M, S, L, U>): number {
        return this.hopedValue.get(minimax.name).get();
    }
    public getOwnValue(minimax: Minimax<M, S, L, U>): U {
        const ownValueOptional: MGPOptional<U> = this.ownValue.get(minimax.name);
        if (ownValueOptional.isAbsent()) {
            const ownValue: U = minimax.getBoardValue(this);
            this.ownValue.set(minimax.name, ownValue);
            return ownValue;
        } else {
            return ownValueOptional.get();
        }
    }
    public myToString(): string {
        let genealogy: string = '';
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let node: MGPNode<R, M, S, L, U> = this;
        if (node.mother.isAbsent()) {
            const turn: number = node.gameState.turn;
            return 'NodeInitial: ' + turn;
        }
        while (node.mother.isPresent()) {
            const move: string = node.move.isAbsent() ? ' ' : ' > ' + node.move.get().toString() + '> ';
            const turn: number = node.gameState.turn;
            genealogy = move + turn + ' ' + genealogy;
            node = node.mother.get();
        }
        return 'Node: ' + genealogy;
    }
    public hasMoves(): boolean {
        return this.childs.isPresent();
    }
    // debug
    public countDescendants(): number {
        if (this.childs.isAbsent()) {
            return 0;
        }
        let nbDescendants: number = this.childs.get().length;
        for (const son of this.childs.get()) {
            nbDescendants += son.countDescendants();
        }
        return nbDescendants;
    }
}
