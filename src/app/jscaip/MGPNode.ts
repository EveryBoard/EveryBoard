import { Move } from './Move';
import { SCORE } from './SCORE';
import { Rules } from './Rules';
import { GamePartSlice } from './GamePartSlice';
import { MGPMap } from '../utils/mgp-map/MGPMap';
import { LegalityStatus } from './LegalityStatus';
import { display } from 'src/app/utils/utils/utils';
import { NodeUnheritance } from './NodeUnheritance';

export class MGPNode<R extends Rules<M, S, L, U>,
                     M extends Move,
                     S extends GamePartSlice,
                     L extends LegalityStatus = LegalityStatus,
                     U extends NodeUnheritance = NodeUnheritance> {
    // TODO: calculate a board - value by the information of the mother.boardValue + this.move to ease the calculation
    // TODO: choose ONE commenting langage, for fuck's sake.
    // TODO: check for the proper use of LinkedList to optimise the stuff
    // TODO: quand l'IA a tout ses choix à égalité de bestHopedValue, elle doit départager par moyenne

    // static fields

    public static VERBOSE: boolean = false;

    public static ruler: Rules<Move, GamePartSlice, LegalityStatus, NodeUnheritance>;
    // Permet d'obtenir les données propre au jeu et non au minimax, ruler restera l'unique instance d'un set de règles

    /* Exemples d'états théorique d'un Node (cours)
    * Feuille - stérile: n'as pas d'enfant après un calcul
    * Feuille - bourgeon: n'as pas d'enfant avant un calcul
    * Une branche
    * Le tronc (la mère)
    */

    // instance fields:

    private possiblesMoves: M[] = null;
    /* Can countain more move than childs, in case of pruning
     * should be only calculated once
     */

    private childs: (MGPNode<R, M, S, L, U>[]) | null = null;
    /* null si: on as pas encore crée les potentiels enfant de cette Node
    * et donc naturellement si c'est une feuille (depth = 0)
    *
    * une ArrayList vide si: c'est une fin de partie (et donc une feuille)
    *
    * une ArrayList de toutes les Nodes qu'on peut obtenir depuis celles ci sinon.
    */

    private hopedValue: number | null = null;
    /* if it's a leaf: its own board value
    * else: the board value of this node best descendant
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
    public static getFirstNode<R extends Rules<M, S, L, U>,
                               M extends Move,
                               S extends GamePartSlice,
                               L extends LegalityStatus,
                               U extends NodeUnheritance>(initialBoard: S, gameRuler: R)
                               : MGPNode<R, M, S, L, U>
    {
        MGPNode.ruler = gameRuler; // pour toutes les node, gameRuler sera le référent
        return new MGPNode(null, null, initialBoard, 0);
    }
    // instance methods:

    constructor(public readonly mother: MGPNode<R, M, S, L, U> | null,
                public readonly move: M | null,
                public readonly gamePartSlice: S,
                public readonly ownValue: number,
                public readonly unheritance?: U) {
        /* Initialisation condition:
         * mother: null for initial board
         * board: should already be a clone
         */
        const LOCAL_VERBOSE: boolean = false;
        // this.ownValue = this.mother == null ? 0 : MGPNode.ruler.getBoardValue(this.move, this.gamePartSlice);
        this.hopedValue = this.ownValue;
        display(MGPNode.VERBOSE || LOCAL_VERBOSE, { createdNode: this });
    }
    public findBestMove(readingDepth: number): MGPNode<R, M, S, L, U> {
        return this.alphaBeta(readingDepth,
                              Number.MIN_SAFE_INTEGER,
                              Number.MAX_SAFE_INTEGER);
    }
    public alphaBeta(depth: number, alpha: number, beta: number): MGPNode<R, M, S, L, U> {
        const LOCAL_VERBOSE: boolean = false;
        if (depth === 0 || this.isEndGame()) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'isLeaf : ' + this.myToString());
            return this; // rules - leaf or calculation - leaf
        }

        let bestChild: MGPNode<R, M, S, L, U>;
        if (this.gamePartSlice.turn % 2 === 1) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'is even : ' + this.myToString());
            let maximumExpected: number = Number.MIN_SAFE_INTEGER;
            for (const move of this.possiblesMoves) {
                const child: MGPNode<R, M, S, L, U> = this.getOrCreateChild(move);
                const bestChildDescendant: MGPNode<R, M, S, L, U> = child.alphaBeta(depth - 1, alpha, beta);
                if (bestChildDescendant.getHopedValue() >= maximumExpected) {
                    maximumExpected = bestChildDescendant.getHopedValue();
                    alpha = Math.max(maximumExpected, alpha);
                    bestChild = bestChildDescendant;
                    if (alpha >= beta) {
                        display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'is pruned : ' +
                            this.myToString() + ' after calculating ' + bestChild.myToString());
                        this.hopedValue = bestChild.hopedValue;
                        return bestChildDescendant;
                    }
                }
            }
        } else {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'is odd : ' + this.myToString());
            let minimumExpected: number = Number.MAX_SAFE_INTEGER;
            for (const move of this.possiblesMoves) {
                const child: MGPNode<R, M, S, L, U> = this.getOrCreateChild(move);
                const bestChildDescendant: MGPNode<R, M, S, L, U> = child.alphaBeta(depth - 1, alpha, beta);
                if (bestChildDescendant.getHopedValue() <= minimumExpected) {
                    minimumExpected = bestChildDescendant.getHopedValue();
                    beta = Math.min(minimumExpected, beta);
                    bestChild = bestChildDescendant;
                    if (alpha >= beta) {
                        display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'is pruned : ' + this.myToString() +
                            ' after calculating ' + bestChild.myToString());
                        this.hopedValue = bestChild.hopedValue;
                        return bestChildDescendant;
                    }
                }
            }
        }
        this.hopedValue = bestChild.hopedValue;
        return bestChild;
    }
    private getOrCreateChild(move: M): MGPNode<R, M, S, L, U> {
        let child: MGPNode<R, M, S, L, U> = this.getSonByMove(move);
        if (child == null) {
            const status: L = MGPNode.ruler.isLegal(move, this.gamePartSlice) as L;
            const state: S = MGPNode.ruler.applyLegalMove(move, this.gamePartSlice, status) as S;
            const boardInfo: unknown = MGPNode.ruler.getBoardValue(move, state);
            let boardValue: number;
            let unheritance: U;
            if (typeof boardInfo === 'number') {
                boardValue = boardInfo;
            } else {
                boardValue = (boardInfo as U).value;
                unheritance = (boardInfo as U);
            }
            child = new MGPNode(this, move, state, boardValue, unheritance);
            this.childs.push(child);
        }
        return child;
    }
    public getSonByMove(move: M): MGPNode<R, M, S, L, U> | null {
        if (this.childs == null) {
            throw new Error('Cannot get son of uncalculated node');
        }
        for (const node of this.childs) {
            if (node.move && node.move.equals(move)) {
                return node;
            }
        }
        return null;
    }
    public getInitialNode(): MGPNode<R, M, S, L, U> {
        let almightyMom: MGPNode<R, M, S, L, U> = this;
        while (almightyMom.mother !== null) {
            almightyMom = almightyMom.mother;
        }
        return almightyMom;
    }
    public getHopedValue(): number | null {
        return this.hopedValue;
    }
    public myToString(): string {
        let genealogy: string = '';
        let node: MGPNode<R, M, S, L, U> = this;
        while (node && node.move) {
            genealogy = node.move.toString() + ' > ' + genealogy;
            node = node.mother;
        }
        return 'turn: ' + this.gamePartSlice.turn + ', ' +
               'own-value: ' + this.ownValue + ', ' +
               'hoped-value: ' + this.hopedValue + ', ' +
               genealogy;
    }
    public isEndGame(): boolean {
        const LOCAL_VERBOSE: boolean = false;
        const scoreStatus: SCORE = MGPNode.getScoreStatus(this.ownValue);

        if (scoreStatus === SCORE.VICTORY) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'MGPNode.isEndGame by victory');
            return true;
        }

        if (this.possiblesMoves == null) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'uncalculated childs : [calculating childs...]');
            const listMoves: MGPMap<M, S> = MGPNode.ruler.getListMoves(this) as MGPMap<M, S>;
            // TODO: only get the moves
            this.possiblesMoves = listMoves.listKeys();
            this.childs = [];
            // TODO: make that part of the rules evaluation
        }

        // MOVES ARE CREATED NOW

        if (this.possiblesMoves.length === 0) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'MGPNode.isEndGame by no-possible-moves after calculation');
            return true;
        }

        display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'MGPNode.isEndGame : no (moves and normal score)');
        return false;
    }
    public hasMoves(): boolean {
        return this.childs !== null;
    }
    // débug
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
