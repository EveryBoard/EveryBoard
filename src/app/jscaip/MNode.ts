import {Move} from './Move';
import {SCORE} from './SCORE';
import {Rules} from './Rules';
import {GamePartSlice} from './GamePartSlice';
import { MGPMap } from '../collectionlib/MGPMap';
import { LegalityStatus } from './LegalityStatus';

export class MNode<R extends Rules<M, S, L>, M extends Move, S extends GamePartSlice, L extends LegalityStatus> {
    // TODO: calculate a board - value by the information of the mother.boardValue + this.move to ease the calculation
    // TODO: choose ONE commenting langage, for fuck's sake.
    // TODO: check for the proper use of LinkedList to optimise the stuff
    // TODO: quand l'IA a tout ses choix � �galit� de bestHopedValue, elle doit d�partager par moyenne

    // static fields

    public static NB_NODE_CREATED = 0;

    public static VERBOSE = false;

    public static ruler: Rules<Move, GamePartSlice, LegalityStatus>;
    /* Permet d'obtenir les donn�es propre au jeu et non au minimax, ruler restera l'unique instance d'un set de r�gles
    */

    /* Exemples d'�tats th�orique d'un Node (cours)
    * Feuille - st�rile: n'as pas d'enfant apr�s un calcul
    * Feuille - bourgeon: n'as pas d'enfant avant un calcul
    * Une branche
    * Le tronc (la m�re)
    */

    // instance fields:

    public readonly mother: MNode<R, M, S, L> | null;
    /* the node from which we got on this Node
    * null si: plateau initial
    *: plateau r�cup�r� sans historique
    *
    * une Node sinon
    */

    public readonly move: M | null;

    public readonly gamePartSlice: S;

    public readonly ownValue: number;

    private childs: (MNode<R, M, S, L>[]) | null = null;
    /* null si: on as pas encore cr�e les potentiels enfant de cette Node
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

    private depth = -1;
    /* allow us to locate the place/status of the node in the decision tree
    * if depth === - 1:
    * recently created Node
    * if depth === 0:
    * leaf Node (by end of lecture)
    * if this.depth === this.mother.depth - 1:
    * just calculated Node
    */

    // statics methods:

    public static mod(turn: number): number {
        /* return - 1 if it's player 0's turn
         * return + 1 if it's player 1's turn
         */
        return (turn % 2) * 2 - 1;
    }
    public static getScoreStatus(score: number): SCORE {
        /* the score status is VICTORY if the score is minValue or MaxValue,
         * because it's how we encode the boardValue if there's a victory
         */
        if (score === Number.MAX_SAFE_INTEGER) {
            if (MNode.VERBOSE) console.log('VICTORY');
            return SCORE.VICTORY;
        }
        if (score === Number.MIN_SAFE_INTEGER) {
            if (MNode.VERBOSE) console.log('VICTORY');
            return SCORE.VICTORY;
        }
        if (score === Number.MIN_SAFE_INTEGER + 1) {
            if (MNode.VERBOSE) console.log('PRE_VICTORY_MIN');
            return SCORE.PRE_VICTORY;
        }
        if (score === Number.MAX_SAFE_INTEGER - 1) {
            if (MNode.VERBOSE) console.log('PRE_VICTORY_MAX');
            return SCORE.PRE_VICTORY;
        }
        return SCORE.DEFAULT;
    }
    public static getFirstNode<R extends Rules<M, S, L>, M extends Move, S extends GamePartSlice, L extends LegalityStatus> (initialBoard: S, gameRuler: R) {
        MNode.ruler = gameRuler; // pour toutes les node, gameRuler sera le r�f�rent
        return new MNode(null, null, initialBoard);
    }
    // instance methods:

    constructor(mother: MNode<R, M, S, L> | null, move: M | null, slice: S) {
        /* Initialisation condition:
         * mother: null for initial board
         * board: should already be a clone
         */
        const LOCAL_VERBOSE: boolean = false;
        this.mother = mother;
        this.move = move;
        this.gamePartSlice = slice;
        this.ownValue = this.mother == null ? 0 : MNode.ruler.getBoardValue(this);
        this.hopedValue = this.ownValue;
        if (MNode.VERBOSE || LOCAL_VERBOSE) {
            console.log("new node (" + MNode.NB_NODE_CREATED+") :: "+
                                       (this.move == null ? "null" : this.move.toString()) + " + " +
                                       this.gamePartSlice.toString() + " == " +
                                       this.ownValue);
            // console.log(mother);
        }
        MNode.NB_NODE_CREATED += 1;
    }
    public getNodeStatus(): String {
        const mother: String = this.mother === null ? 'mother' : 'node';

        let fertility: String;
        if (this.childs === null) {
            fertility = 'no - child - yet';
        } else if (this.childs.length === 0) {
            fertility = 'sterile';
        } else {
            fertility = 'have - child';
        }

        let calculated: String;
        if (this.hopedValue === null) {
            calculated = 'uncalculated';
        }
        if (this.hopedValue !== null) {
            calculated = 'calculation - done';
        }

        return mother + ' ' + fertility + ' ' + calculated;
    }
    public findBestMoveAndSetDepth(readingDepth: number): MNode<R, M, S, L> {
        if (MNode.VERBOSE) console.log("findBestMoveAndSetDepth(" + readingDepth + ") = " + this.gamePartSlice.toString() + " => " + this.ownValue);
        this.depth = readingDepth;
        return this.findBestMove();
    }
    public findBestMove(): MNode<R, M, S, L> {
        const LOCAL_VERBOSE: boolean = false;
        if (this.isLeaf()) {
            if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('isLeaf (' + this.myToString());
            return this; // rules - leaf or calculation - leaf
        }

        // here it's not a calculation - leaf and not yet proven to be a rules - leaf
        if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('Not A Leaf');

        if (this.childs === null) {
            // if the Node has no child yet
            if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('has No Child Yet');

            this.createChilds();
            if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('Childs created');

            // here it's not a calculation - leaf but now we can check if it's a rule - leaf
            if (this.childs && this.childs.length === 0) {
                // here this.depth !== 0 and this.hasAlreadyChild()
                // so this is the last condition needed to see if it's a leaf - by - rules
                if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('is A Leaf By Rules');
                return this; // rules - leaf
            }
            if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('has Child NOW');
        } else if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('Has already Childs');

        // here it's not a calculation - leaf nor a rules - leaf
        this.calculateChildsValue();
        if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('has Calculate Childs Value');
        return this.setBestChild();
    }
    public createChilds() {
        /* Conditions obtenues avant de lancer:
         * 1. this.childs === null
         *
         * Chose n�cessaire:
         * Demander � l'instance de Rules de calculer (pour this) tout les mouvement l�gaux
         * (avec ceux ci, doit - on avoir une liste de Node contenant en eux .move
         *
         * 1. Getter le dico < MoveX, Board > provenant du IRules
         *
         * 2. Pour chacun d'entre eux
         * a. setter sa mother � this // via constructeur
         * b. setter sa childs � null // AUTOMATIQUE
         * c. setter sa bestChild � null // AUTOMATIQUE
         * d. moveX est donc re�u de la classe Rules // via constructeur
         * e. board est aussi re�u de la classe Rules // via constructeur
         * f. setter sa value � null // AUTOMATIQUE
         * g. l'ajouter � this.childs
         * h. ne rien changer � sa depth avant que la Node ne soit calcul�
         */
        if (this.childs != null) throw new Error("multiple node childs calculation error");
        const LOCAL_VERBOSE = false;
        const moves: MGPMap<M, S> = MNode.ruler.getListMoves(this) as MGPMap<M, S>;
        this.childs = new Array<MNode<R, M, S, L>>();
        if (MNode.VERBOSE || LOCAL_VERBOSE) {
            console.log('createChilds received listMoves from ruler');
            console.log(moves);
        }
        for (let i=0; i<moves.size(); i++) {
            const entry = moves.get(i);
            if (MNode.VERBOSE || LOCAL_VERBOSE) {
                console.log('in the loop');
                console.log(entry);
            }
            const move: M = entry.key;
            const slice: S = entry.value;
            if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('move and board retrieved from the entry');

            const child: MNode<R, M, S, L> = new MNode<R, M, S, L>(this, move, slice);
            if (MNode.VERBOSE || LOCAL_VERBOSE) {
                console.log('child created');
                console.log(child);
            }
            this.childs.push(child);
        }

        if (MNode.VERBOSE || LOCAL_VERBOSE) {
            console.log('out of the loop');
            if (this.isEndGame()) console.log('Node.createChilds has found a endGame');
        }
    }
    private calculateChildsValue() {
        /* Condition d'appel
         * - les enfants sont d�jà cr�es
         * - ils ne sont pas forc�ment calcul�, mais si on l'appel c'est que le calcul n'est plus valable
         * - la Node n'est pas une feuille
         */
        if (this.childs == null) {
            throw new Error("theses childs should have been calculated");
        }
        for (const child of this.childs) {
            child.findBestMoveAndSetDepth(this.depth - 1);
        }
    }
    private setBestChild(): MNode<R, M, S, L> | null {
        /* return the the best child in the child list
         * use condition: childs is not empty
         */
        if (this.gamePartSlice.turn % 2 === 0) {
            return this.setMinChild();
        } else {
            return this.setMaxChild();
        }
    }
    private setMinChild(): MNode<R, M, S, L> | null {
        /* return the 'minimal' child
         * update the best hoped value
         * ( best for player 0 ! )
         * use condition: childs is not empty
         */
        if (this.childs == null) {
            return null;
        }
        let minValue: number = Number.MAX_SAFE_INTEGER;
        let minNode: MNode<R, M, S, L> = this.childs[0];

        for (const child of this.childs) {
            if (child.hopedValue < minValue || (child.hopedValue === minValue && Math.random() < 0.5)) {
                minNode = child;
                minValue = minNode.hopedValue;
                if (minValue === Number.MIN_SAFE_INTEGER) {
                    break;
                } // TODO: poirer i�i, si j'ai trouv� une victoire je peux supprimer les enfants et ma hopedValue ne changera plus !!!
            }
        }
        this.hopedValue = minValue;
        return minNode;
    }
    private setMaxChild(): MNode<R, M, S, L> | null {
        /* return the 'maximal' child
         * set the index of the best child in this.bestChild
         * and set its value
         * ( best fort player 1 ! )
         * use condition: childs is not empty
         */

        if (!this.childs) {
            return null;
        }
        let maxValue: number = Number.MIN_SAFE_INTEGER;
        let maxNode: MNode<R, M, S, L> = this.childs[0];

        for (const child of this.childs) {
            if (child.hopedValue > maxValue || (child.hopedValue === maxValue && Math.random() < 0.5)) {
                maxNode = child;
                maxValue = maxNode.hopedValue;
                if (maxValue === Number.MAX_SAFE_INTEGER) {
                    break;
                }
            }
        }
        this.hopedValue = maxValue;
        return maxNode;
    }
    public isLeaf(): boolean {
        if (this.depth === 0) {
            // we've reach the end of calculation here, so it's a leaf - by calculation limit
            return true;
        } else {
            // it's a leaf - by rules
            return this.isEndGame();
        }
    }
    public getSonByMove(move: M): MNode<R, M, S, L> | null {
        if (this.childs == null) {
            throw new Error("Cannot get son of uncalculated node");
        }
        for (const node of this.childs) {
            if (node.move && node.move.equals(move)) {
                return node;
            }
        }
        return null;
    }
    public getInitialNode(): MNode<R, M, S, L> {
        let allmightyMom: MNode<R, M, S, L> = this;
        while (allmightyMom.mother !== null) {
            allmightyMom = allmightyMom.mother;
        }
        return allmightyMom;
    }
    public getHopedValue(): number | null {
        return this.hopedValue;
    }
    public myToString(): String {
        return this +
            ' [mother = ' + this.mother +
            ', board = ' + this.gamePartSlice +
            ', childs = ' + this.childs +
            ', ownValue = ' + this.ownValue +
            ', hopedValue = ' + this.hopedValue +
            ', depth = ' + this.depth + ']';
    }
    public isEndGame(): boolean {
        const LOCAL_VERBOSE = false;

        const scoreStatus: SCORE = MNode.getScoreStatus(this.ownValue);
        if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('\nscoreStatus === ' + scoreStatus + '; ');

        if (scoreStatus === SCORE.VICTORY) {
            if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('MNode.isEndGame by victory');
            return true;
        }

        if (this.childs === null) {
            if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('uncalculated childs : [calculating childs...]');
            this.createChilds();
        }

        // CHILDS ARE CREATED NOW if ((MNode.VERBOSE || LOCAL_VERBOSE) && this.childs) console.log(this.childs.length + ' childs; ');

        if (this.childs.length === 0) {
            if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('MNode.isEndGame by  by no-child after calculation');
            return true;
        }

        if (MNode.VERBOSE || LOCAL_VERBOSE) console.log('MNode.isEndGame : no (childs and normal score)');
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
    public keepOnlyChoosenChild(choix: MNode<R, M, S, L>) {
        this.childs = new Array<MNode<R, M, S, L>>();
        this.childs.push(choix);
    }
}