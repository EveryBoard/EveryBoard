import { Move } from './Move';
import { SCORE } from './SCORE';
import { Rules } from './Rules';
import { GamePartSlice } from './GamePartSlice';
import { MGPMap } from '../utils/MGPMap';
import { LegalityStatus } from './LegalityStatus';
import { display } from 'src/app/utils/utils';
import { NodeUnheritance } from './NodeUnheritance';
import { Minimax } from './Minimax';

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
    /* Permet d'obtenir les données propre au jeu et non au minimax, ruler restera l'unique instance d'un set de règles
     * Exemples d'états théorique d'un Node (cours)
     * Feuille - stérile: n'as pas d'enfant après un calcul
     * Feuille - bourgeon: n'as pas d'enfant avant un calcul
     * Une branche
     * Le tronc (la mère)
     */

    public static minimaxes: MGPMap<string, Minimax<Move, GamePartSlice>> = new MGPMap();
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

    private readonly hopedValue: MGPMap<string, number> = new MGPMap();
    /* key is the name of the Minimax
     * value: if it's a leaf: its own board value
     * else: the board value of this node best descendant
     */

    private readonly ownValue: MGPMap<string, U> = new MGPMap();

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
        return new MGPNode(null, null, initialBoard);
    }
    // instance methods:

    constructor(public readonly mother: MGPNode<R, M, S, L, U> | null,
                public readonly move: M | null,
                public readonly gamePartSlice: S,
                ownValue?: MGPMap<string, U>) {
        /* Initialisation condition:
         * mother: null for initial board
         * board: should already be a clone
         */
        const LOCAL_VERBOSE: boolean = false;
        if (ownValue) {
            const currentMinimaxValue: { key: string, value: U } = ownValue.getByIndex(0);
            this.hopedValue.set(currentMinimaxValue.key, currentMinimaxValue.value.value);
        } else {
            this.ownValue = new MGPMap();
        }
        display(MGPNode.VERBOSE || LOCAL_VERBOSE, { createdNode: this });
    }
    public findBestMove(readingDepth: number, minimax: Minimax<M, S, L, U>): M {
        let bestDescendant: MGPNode<R, M, S, L, U> = this.alphaBeta(readingDepth,
                                                                    Number.MIN_SAFE_INTEGER,
                                                                    Number.MAX_SAFE_INTEGER,
                                                                    minimax);
        while (bestDescendant.gamePartSlice.turn > this.gamePartSlice.turn + 1) {
            bestDescendant = bestDescendant.mother;
            readingDepth--;
        }
        return bestDescendant.move;
    }
    public alphaBeta(depth: number,
                     alpha: number,
                     beta: number,
                     minimax: Minimax<M, S, L, U>)
    : MGPNode<R, M, S, L, U>
    {
        const LOCAL_VERBOSE: boolean = false;
        if (depth < 1 || MGPNode.ruler.isGameOver(this.gamePartSlice)) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'isLeaf : ' + this.myToString(minimax));
            return this; // rules - leaf or calculation - leaf
        }
        this.possiblesMoves = this.possiblesMoves = minimax.getListMoves(this, minimax) as M[];
        this.childs = [];
        // TODO: make that list MINIMAX_BASED
        let bestChild: MGPNode<R, M, S, L, U>;
        if (this.gamePartSlice.turn % 2 === 1) {
            let maximumExpected: number = Number.MIN_SAFE_INTEGER;
            for (const move of this.possiblesMoves) {
                const child: MGPNode<R, M, S, L, U> = this.getOrCreateChild(move, minimax);
                const bestChildDescendant: MGPNode<R, M, S, L, U> = child.alphaBeta(depth - 1, alpha, beta, minimax);
                const bestChildValue: number = bestChildDescendant.getHopedValue(minimax);
                if (bestChildValue >= maximumExpected) {
                    maximumExpected = bestChildDescendant.getHopedValue(minimax);
                    alpha = Math.max(maximumExpected, alpha);
                    bestChild = bestChildDescendant;
                    if (alpha >= beta) {
                        display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'is pruned : ' +
                            this.myToString(minimax) + ' after calculating ' + bestChild.myToString(minimax));
                        const bestChildHopedValue: number = bestChild.getHopedValue(minimax);
                        this.hopedValue.put(minimax.name, bestChildHopedValue);
                        return bestChildDescendant;
                    }
                }
            }
        } else {
            let minimumExpected: number = Number.MAX_SAFE_INTEGER;
            for (const move of this.possiblesMoves) {
                const child: MGPNode<R, M, S, L, U> = this.getOrCreateChild(move, minimax);
                const bestChildDescendant: MGPNode<R, M, S, L, U> = child.alphaBeta(depth - 1, alpha, beta, minimax);
                if (bestChildDescendant.getHopedValue(minimax) <= minimumExpected) {
                    minimumExpected = bestChildDescendant.getHopedValue(minimax);
                    beta = Math.min(minimumExpected, beta);
                    bestChild = bestChildDescendant;
                    if (alpha >= beta) {
                        display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'is pruned : ' +
                            this.myToString(minimax) + ' after calculating ' + bestChild.myToString(minimax));
                        const bestChildHopedValue: number = bestChild.getHopedValue(minimax);
                        this.hopedValue.put(minimax.name, bestChildHopedValue);
                        return bestChildDescendant;
                    }
                }
            }
        }
        const bestChildHopedValue: number = bestChild.hopedValue.get(minimax.toString()).get();
        this.hopedValue.put(minimax.toString(), bestChildHopedValue);
        return bestChild;
    }
    private getOrCreateChild(move: M, minimax: Minimax<M, S, L, U>): MGPNode<R, M, S, L, U> {
        let child: MGPNode<R, M, S, L, U> = this.getSonByMove(move);
        if (child == null) {
            const status: L = MGPNode.ruler.isLegal(move, this.gamePartSlice) as L;
            const state: S = MGPNode.ruler.applyLegalMove(move, this.gamePartSlice, status) as S;
            const value: U = minimax.getBoardValue(move, state);
            const valueMap: MGPMap<string, U> = new MGPMap();
            valueMap.set(minimax.toString(), value);
            child = new MGPNode(this, move, state, valueMap);
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
    public getHopedValue(minimax: Minimax<M, S, L, U>): number {
        if (minimax == null) {
            console.log('getHopedValue sans minimax est null')
            return null;
        }
        return this.hopedValue.get(minimax.name).getOrNull();
    }
    public getOwnValue(minimax: Minimax<M, S, L, U>): U {
        if (minimax == null) {
            console.log('jeu sans ia');
            return new NodeUnheritance(0) as U;
        }
        let ownValue: U = this.ownValue.get(minimax.name).getOrNull();
        if (ownValue == null) {
            ownValue = minimax.getBoardValue(this.move, this.gamePartSlice);
            this.ownValue.set(minimax.name, ownValue);
        }
        return ownValue;
    }
    public myToString(minimax: Minimax<M, S, L, U>): string {
        let genealogy: string = '';
        let node: MGPNode<R, M, S, L, U> = this;
        if (node.mother == null) {
            return 'first node';
        }
        while (node && node.move) {
            genealogy = node.move.toString() + ' > ' + genealogy;
            node = node.mother;
        }
        return genealogy;
    }
    public isEndGame(minimax: Minimax<M, S, L, U>): boolean { // TODO: remove cleanly
        if (minimax == null) {
            console.log('endGame sans ia is faulxe for now');
            return false;
        }
        const LOCAL_VERBOSE: boolean = false;
        const minimaxBoardValue: U = this.getOwnValue(minimax);
        const scoreStatus: SCORE = MGPNode.getScoreStatus(minimaxBoardValue.value);

        if (scoreStatus === SCORE.VICTORY) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'MGPNode.isEndGame by victory');
            return true;
        }

        if (this.possiblesMoves == null) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'uncalculated childs : [calculating childs...]');
            this.possiblesMoves = minimax.getListMoves(this, minimax) as M[];
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
