import { Move } from './Move';
import { SCORE } from './SCORE';
import { Rules } from './Rules';
import { MGPMap } from '../utils/MGPMap';
import { LegalityStatus } from './LegalityStatus';
import { assert, display, Utils } from 'src/app/utils/utils';
import { NodeUnheritance } from './NodeUnheritance';
import { Minimax } from './Minimax';
import { MGPSet } from '../utils/MGPSet';
import { MGPOptional } from '../utils/MGPOptional';
import { Player } from './Player';
import { AbstractGameState } from './GameState';

export class MGPNodeStats {
    public static createdNodes: number = 0;
    public static minimaxTime: number = 0;
}

export class MGPNode<R extends Rules<M, S, L>,
                     M extends Move,
                     S extends AbstractGameState,
                     L extends LegalityStatus = LegalityStatus,
                     U extends NodeUnheritance = NodeUnheritance> {
    // TODO: calculate a board - value by the information of the mother.boardValue + this.move to ease the calculation
    // TODO: choose ONE commenting langage, for fuck's sake.
    // TODO: check for the proper use of LinkedList to optimise the stuff
    // TODO: when AI has all choice at bestHopedValue equality, she must split by average?

    // static fields

    public static VERBOSE: boolean = false;

    // Contains data related to the game and not to the minimax, ruler is the only instance of a set of rules
    public static ruler: Rules<Move, AbstractGameState, LegalityStatus>;

    public static minimaxes: MGPMap<string, Minimax<Move, AbstractGameState>> = new MGPMap();
    // instance fields:

    private childs: (MGPNode<R, M, S, L, U>[]) | null = null;
    /* null if we did not create potential children of a node, hence also if it is a leaf (depth = 0)
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

    // statics methods:

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
    public static getFirstNode<R extends Rules<M, S, L>,
                               M extends Move,
                               S extends AbstractGameState,
                               L extends LegalityStatus,
                               U extends NodeUnheritance>(initialBoard: S, gameRuler: R)
    : MGPNode<R, M, S, L, U>
    {
        MGPNode.ruler = gameRuler; // for all nodes, gameRuler is the ruler
        return new MGPNode<R, M, S, L, U>(null, null, initialBoard);
    }
    // instance methods:

    constructor(public readonly mother: MGPNode<R, M, S, L, U> | null,
                public readonly move: M | null,
                public readonly gameState: S,
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
            this.ownValue.set(minimaxCreator.name, firstValue as NonNullable<U>);
            this.hopedValue.set(minimaxCreator.name, firstValue.value);
        }
        MGPNodeStats.createdNodes++;
        display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'creating ' + this.myToString());
    }
    public findBestMove(readingDepth: number, minimax: Minimax<M, S, L, U>, random: boolean = true): M {
        const startTime: number = new Date().getTime();
        let bestDescendant: MGPNode<R, M, S, L, U> = this.alphaBeta(readingDepth,
                                                                    Number.MIN_SAFE_INTEGER,
                                                                    Number.MAX_SAFE_INTEGER,
                                                                    minimax,
                                                                    random);
        while (bestDescendant.gameState.turn > this.gameState.turn + 1) {
            bestDescendant = Utils.getNonNullable(bestDescendant.mother);
            readingDepth--;
        }
        MGPNodeStats.minimaxTime += new Date().getTime() - startTime;
        return Utils.getNonNullable(bestDescendant.move);
    }
    public alphaBeta(depth: number,
                     alpha: number,
                     beta: number,
                     minimax: Minimax<M, S, L, U>,
                     random: boolean)
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
        assert(possibleMoves.length > 0, 'Minimax ' + minimax.name + ' should give move, received nones!');
        this.childs = this.childs || [];
        let bestChilds: MGPNode<R, M, S, L, U>[] = [];
        const currentPlayer: Player = this.gameState.getCurrentPlayer();
        let extremumExpected: number =
            currentPlayer === Player.ZERO ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
        const newValueIsBetter: (newValue: number, currentValue: number) => boolean =
            currentPlayer === Player.ZERO ? ((a: number, b: number) => a < b) : ((a: number, b: number) => a > b);
        for (const move of possibleMoves) {
            const child: MGPNode<R, M, S, L, U> = this.getOrCreateChild(move, minimax);
            const bestChildDescendant: MGPNode<R, M, S, L, U> =
                child.alphaBeta(depth - 1, alpha, beta, minimax, random);
            const bestChildValue: number = bestChildDescendant.getHopedValue(minimax);
            if (newValueIsBetter(bestChildValue, extremumExpected) || bestChilds.length === 0) {
                extremumExpected = bestChildDescendant.getHopedValue(minimax);
                if (currentPlayer === Player.ZERO) {
                    beta = Math.min(extremumExpected, beta);
                } else {
                    alpha = Math.max(extremumExpected, alpha);
                }
                bestChilds = [bestChildDescendant];
                if (alpha >= beta) {
                    display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'is pruned : ' +
                        this.myToString() + ' after calculating ' + bestChildDescendant.myToString());
                    const bestChildHopedValue: number = bestChildDescendant.getHopedValue(minimax);
                    this.hopedValue.put(minimax.name, bestChildHopedValue);
                    return bestChildDescendant;
                }
            } else if (bestChildValue === extremumExpected) {
                bestChilds.push(bestChildDescendant);
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
        let child: MGPNode<R, M, S, L, U> | null = this.getSonByMove(move);
        if (child == null) {
            const status: L = minimax.ruler.isLegal(move, this.gameState);
            if (status.legal.isFailure()) {
                Utils.handleError(`The minimax has accepted an illegal move, this should not happen.`);
            }
            const state: S = minimax.ruler.applyLegalMove(move, this.gameState, status);
            child = new MGPNode(this, move, state, minimax);
            Utils.getNonNullable(this.childs).push(child);
        }
        return child;
    }
    public getSonByMove(move: M): MGPNode<R, M, S, L, U> | null {
        assert(this.childs != null, 'Cannot get son of uncalculated node');
        for (const node of Utils.getNonNullable(this.childs)) {
            if (node.move != null && node.move.equals(move)) {
                return node;
            }
        }
        return null;
    }
    public getInitialNode(): MGPNode<R, M, S, L, U> {
        let almightyMom: MGPNode<R, M, S, L, U> = this;
        while (almightyMom.mother != null) {
            almightyMom = almightyMom.mother;
        }
        return almightyMom;
    }
    public getHopedValue(minimax: Minimax<M, S, L, U>): number {
        return this.hopedValue.get(minimax.name).get();
    }
    public getOwnValue(minimax: Minimax<M, S, L, U>): U {
        assert(minimax != null, 'Cannot got game value without minimax provided');

        let ownValue: U | null = this.ownValue.get(minimax.name).getOrNull();
        if (ownValue == null) {
            ownValue = minimax.getBoardValue(this);
            this.ownValue.set(minimax.name, ownValue as NonNullable<U>);
        }
        return ownValue;
    }
    public myToString(): string {
        let genealogy: string = '';
        let node: MGPNode<R, M, S, L, U> | null = this;
        if (node.mother == null) {
            const turn: number = node.gameState.turn;
            return 'NodeInitial: ' + turn;
        }
        do {
            const move: string = node.move == null ? ' ' : ' > ' + node.move.toString() + '> ';
            const turn: number = node.gameState.turn;
            genealogy = move + turn + ' ' + genealogy;
            node = node.mother;
        } while (node != null);
        return 'Node: ' + genealogy;
    }
    public hasMoves(): boolean {
        return this.childs != null;
    }
    // debug
    public countDescendants(): number {
        if (this.childs === null) {
            return 0;
        }
        let nbDescendants: number = this.childs.length;
        if (nbDescendants === 0) {
            return 0;
        }
        for (const son of this.childs) {
            nbDescendants += son.countDescendants();
        }
        return nbDescendants;
    }
}
