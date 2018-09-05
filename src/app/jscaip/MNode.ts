import { Move } from './Move';
import { SCORE } from './SCORE';
import { Rules } from './Rules';
import { GamePartSlice } from './GamePartSlice';
import { P4Rules } from '../games/games.p4/P4Rules';

export class MNode<R extends Rules> {
  // TODO calculate a board - value by the information of the mother.boardValue + this.move to ease the calculation
  // TODO choose ONE commenting langage, for fuck's sake.
  // TODO check for the proper use of LinkedList to optimise the stuff

  // static fields

  static VERBOSE = false;

  public static ruler: Rules;
  /* Permet d'obtenir les données propre au jeu et non au minimax, ruler restera l'unique instance d'un set de règles
  */

  /* Exemples d'états théorique d'un Node (cours)
  * Feuille - stérile: n'as pas d'enfant après un calcul
  * Feuille - bourgeon: n'as pas d'enfant avant un calcul
  * Une branche
  * Le tronc (la mère)
  */

  // instance fields:

  private readonly mother: MNode<R> | null;
  /* the node from which we got on this Node
  * null si: plateau initial
  *: plateau récupéré sans historique
  *
  * une Node sinon
  */

  private readonly move: Move | null;

  readonly gamePartSlice: GamePartSlice;

  private childs: (MNode<R>[]) | null = null;
  /* null si: on as pas encore crée les potentiels enfant de cette Node
  * et donc naturellement si c'est une feuille (depth = 0)
  *
  * une ArrayList vide si: c'est une fin de partie (et donc une feuille)
  *
  * une ArrayList de toutes les Nodes qu'on peut obtenir depuis celles ci sinon.
  */

  private bestChildNode: MNode<R> | null = null;

  private bestChildIndex = -1;
  /* - 1 si: c'est pas calculé
  * l'indice de la Node dans this.childs qui mène au meilleurs mouvement
  */

  private hopedValue: number | null = null;
  /* if it's a leaf: it's own board value
  * else: the board value of this node best child
  */

  private readonly ownValue: number;

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

  static mod(turn: number): number {
    /* return - 1 if it's player 0's turn
   * return + 1 if it's player 1's turn
   */
    return (turn % 2) * 2 - 1;
  }
  static getScoreStatus(score: number): SCORE {
    /* the score status is VICTORY if the score is minValue or MaxValue,
   * because it's how we encode the boardValue if there's a victory
   */
    if (score === Number.MAX_SAFE_INTEGER) {
      // System.out.println('VICTORY');
      return SCORE.VICTORY;
    }
    if (score === Number.MIN_SAFE_INTEGER) {
      // System.out.println('VICTORY');
      return SCORE.VICTORY;
    }
    if (score === Number.MIN_SAFE_INTEGER + 1) {
      if (MNode.VERBOSE) {
        console.log('PRE_VICTORY_MIN');
        return SCORE.PRE_VICTORY;
      }
    }
    if (score === Number.MAX_SAFE_INTEGER - 1) {
      if (MNode.VERBOSE) {
        console.log('PRE_VICTORY_MAX');
        return SCORE.PRE_VICTORY;
      }
    }
    return SCORE.DEFAULT;
  }
  static getFirstNode(initialBoard: GamePartSlice, gameRuler: Rules) {
    MNode.ruler = gameRuler; // pour toutes les node, gameRuler sera le référent
    return new MNode(null, null, initialBoard);
  }

  // instance methods:

  constructor(
    mother: MNode<R> | null,
    move: Move | null,
    board: GamePartSlice
  ) {
    /* Initialisation condition:
   * mother: null for initial board
   * board: should already be a clone
   */
    this.mother = mother;
    this.move = move;
    this.gamePartSlice = board;
    this.ownValue = this.mother ? MNode.ruler.getBoardValue(this) : 0;
    this.hopedValue = this.ownValue;
    if (MNode.VERBOSE) {
      console.log('MNode<R> in phase of creation with mom : ');
      console.log(mother);

      console.log('and with board');
      P4Rules.debugPrintBiArray(this.gamePartSlice.getCopiedBoard());
    }
  }
  getNodeStatus(): String {
    const mother: String = this.mother === null ? 'mother' : 'node';

    let fertility: String;
    if (this.childs === null) {
      fertility = 'no - child - yet';
    } else if (this.childs.length === 0) {
      fertility = 'sterile';
    } else {
      fertility = 'have - child';
    }

    let calculated: String = 'strange - impossible - calculation - state';
    if (this.bestChildIndex === -1 && this.hopedValue === null) {
      calculated = 'uncalculated';
    }
    if (this.bestChildIndex !== -1 && this.hopedValue === null) {
      calculated = 'calculation - in - progress';
    }
    if (this.bestChildIndex !== -1 && this.hopedValue !== null) {
      calculated = 'calculation - done';
    }

    return mother + ' ' + fertility + ' ' + calculated;
  }
  findBestMoveAndSetDepth(readingDepth: number): MNode<R> {
    this.depth = readingDepth;
    return this.findBestMove();
  }
  private findBestMove(): MNode<R> {
    if (this.isLeaf()) {
      if (MNode.VERBOSE) {
        console.log('isLeaf (' + this.myToString());
      }
      return this; // rules - leaf or calculation - leaf
    } else {
      // here it's not a calculation - leaf and not yet proven to be a rules - leaf
      if (MNode.VERBOSE) {
        console.log('Not A Leaf');
      }

      if (this.childs === null) {
        // if the Node has no child yet
        if (MNode.VERBOSE) {
          console.log('has No Child Yet');
        }
        this.createChilds();
        if (MNode.VERBOSE) {
          console.log('Childs created');
        }
        // here it's not a calculation - leaf but now we can check if it's a rule - leaf
        if (this.childs && (<any>this.childs).length === 0) {
          // here this.depth !== 0 and this.hasAlreadyChild()
          // so this is the last condition needed to see if it's a leaf - by - rules
          if (MNode.VERBOSE) {
            console.log('is A Leaf By Rules');
          }
          return this; // rules - leaf
        }
        if (MNode.VERBOSE) {
          console.log('has Child NOW');
        }
      } else {
        if (MNode.VERBOSE) {
          console.log('Has already Childs');
        }
      }
      // here it's not a calculation - leaf nor a rules - leaf
      this.calculateChildsValue();
      if (MNode.VERBOSE) {
        console.log('has Calculate Childs Value');
      }
      this.setBestChild();
      if (MNode.VERBOSE) {
        console.log('has set best child');
      }

      return this.bestChildNode;
    }
  }

  /* private Node findBestMove() { // version without prints
  if (this.isLeaf()) {
   return this; // rules - leaf or calculation - leaf
  } else {
   // here it's not a calculation - leaf and not yet proven to be a rules - leaf

   if (this.childs === null) { // if the Node has no child yet
    this.createChilds();
    // here it's not a calculation - leaf but now we can check if it's a rule - leaf
    if (this.childs.isEmpty()) {
     // here this.depth !== 0 and this.hasAlreadyChild()
     // so this is the last condition needed to see if it's a leaf - by - rules
     return this; // rules - leaf
   }
   // here it's not a calculation - leaf nor a rules - leaf
   this.calculateChildsValue();
   this.setBestChild();

   return this.bestChildNode;
  }
 } */

  /* public void createChilds() { // version without prints
  /* Conditions obtenues avant de lancer:
  * 1. this.childs === null
  *
  * Chose nécessaire:
  * Demander à l'instance de Rules de calculer (pour this) tout les mouvement légaux
  * (avec ceux ci, doit - on avoir une liste de Node contenant en eux .move
  *
  * 1. Getter le dico < MoveX, Board > provenant du IRules
  *
  * 2. Pour chacun d'entre eux
  * a. setter sa mother à this // via constructeur
  * b. setter sa childs à null // AUTOMATIQUE
  * c. setter sa bestChild à null // AUTOMATIQUE
  * d. moveX est donc reçu de la classe Rules // via constructeur
  * e. board est aussi reçu de la classe Rules // via constructeur
  * f. setter sa value à null // AUTOMATIQUE
  * g. l'ajouter à this.childs
  * h. ne rien changer à sa depth avant que la Node ne soit calculée

  HashMap < MoveX, GamePartSlice > moves = ruler.getListMoves(this);
  this.childs = new LinkedList < Node > ();

  for(HashMap.Entry < MoveX, GamePartSlice > entry: moves.entrySet()) {

   MoveX moveX = entry.getKey();
   GamePartSlice board = entry.getValue();
   Node child = new Node(this, moveX, board);

   this.childs.add(child);
  }
  if (this.isEndGame()) System.out.println('Node.createChilds has found a endGame');
 } */

  createChilds() {
    /* Conditions obtenues avant de lancer:
   * 1. this.childs === null
   *
   * Chose nécessaire:
   * Demander à l'instance de Rules de calculer (pour this) tout les mouvement légaux
   * (avec ceux ci, doit - on avoir une liste de Node contenant en eux .move
   *
   * 1. Getter le dico < MoveX, Board > provenant du IRules
   *
   * 2. Pour chacun d'entre eux
   * a. setter sa mother à this // via constructeur
   * b. setter sa childs à null // AUTOMATIQUE
   * c. setter sa bestChild à null // AUTOMATIQUE
   * d. moveX est donc reçu de la classe Rules // via constructeur
   * e. board est aussi reçu de la classe Rules // via constructeur
   * f. setter sa value à null // AUTOMATIQUE
   * g. l'ajouter à this.childs
   * h. ne rien changer à sa depth avant que la Node ne soit calculée
   */
    const moves: {
      key: Move;
      value: GamePartSlice;
    }[] = MNode.ruler.getListMoves(this);
    this.childs = new Array<MNode<R>>();
    if (MNode.VERBOSE) {
      console.log('createChilds received listMoves from ruler');
      console.log(moves);
    }
    for (const entry of moves) {
      if (MNode.VERBOSE) {
        console.log('in the loop');
        console.log(entry);
      }
      const move: Move = entry.key;
      const board: GamePartSlice = entry.value;
      if (MNode.VERBOSE) {
        console.log('move and board retrieved from the entry');
      }
      const child: MNode<R> = new MNode<R>(this, move, board);
      if (MNode.VERBOSE) {
        console.log('child created');
        console.log(child);
      }
      this.childs.push(child);
    }
    if (MNode.VERBOSE) {
      console.log('out of the loop');
    }
    if (this.isEndGame()) {
      if (MNode.VERBOSE) {
        console.log('Node.createChilds has found a endGame');
      }
    }
  }
  private calculateChildsValue() {
    /* Condition d'appel
   * - les enfants sont déjà crées
   * - ils ne sont pas forcément calculé, mais si on l'appel c'est que le calcul n'est plus valable
   *   - la Node n'est pas une feuille
   */
    if (!this.childs) {
      return;
    }
    for (const child of this.childs) {
      child.findBestMoveAndSetDepth(this.depth - 1);
    }
  }
  private setBestChild(): MNode<R> | null {
    /* return the the best child in the child list
   * use condition: childs is not empty
   */
    if (this.gamePartSlice.turn % 2 === 0) {
      return <MNode<R>>this.setMinChild();
    } else {
      return this.setMaxChild();
    }
  }
  private setMinChild(): MNode<R> | null {
    /* return the 'minimal' child
   * set the index of the best child in this.bestChild
   * and set its value
   * ( best for player 0 ! )
   * use condition: childs is not empty
   */
    if (!this.childs) {
      return null;
    }
    let minValue: number = Number.MAX_SAFE_INTEGER;
    let minNode: MNode<R> = this.childs[0];

    for (const child of this.childs) {
      if (child.hopedValue && child.hopedValue < minValue) {
        minNode = child;
        minValue = <number>minNode.hopedValue;
        if (minValue === Number.MIN_SAFE_INTEGER) {
          break;
        }
      }
    }
    this.bestChildNode = minNode;
    this.hopedValue = minValue;
    return minNode;
  }
  private setMaxChild(): MNode<R> | null {
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
    let maxNode: MNode<R> = this.childs[0];

    for (const child of this.childs) {
      if (child.hopedValue && child.hopedValue > maxValue) {
        maxNode = child;
        maxValue = maxNode.hopedValue;
        if (maxValue === Number.MAX_SAFE_INTEGER) {
          break;
        }
      }
    }
    this.bestChildNode = maxNode;
    this.hopedValue = maxValue;
    return maxNode;
  }
  isLeaf(): boolean {
    if (this.depth === 0) {
      // we've reach the end of calculation here, so it's a leaf - by calculation limit
      return true;
    } else {
      // it's a leaf - by rules
      return this.isEndGame();
    }
  }
  getNode(move: Move): MNode<R> | null {
    // TODO rename according to the fact that it's getSonByMove
    /* int index = this.moves.indexOf(moveX);
  if (index === - 1) return null;
  return this.childs.get(index);
   */ // old version
    if (!this.childs) {
      return null;
    }
    for (const node of this.childs) {
      if (node.move && node.move.equals(move)) {
        return node;
      }
    }
    return null;
  }
  getMother(): MNode<R> | null {
    return this.mother;
  }
  getMove(): Move | null {
    return this.move;
  }
  getOwnValue(): number {
    return this.ownValue;
  }
  getInitialNode(): MNode<R> {
    let allmightyMom: MNode<R> = this;
    while (allmightyMom.mother !== null) {
      allmightyMom = allmightyMom.mother;
    }
    return allmightyMom;
  }
  getBestChild(): number {
    return this.bestChildIndex;
  }
  getHopedValue(): number | null {
    return this.hopedValue;
  }
  myToString(): String {
    return (
      this +
      ' [mother = ' +
      this.mother +
      ', board = ' +
      this.gamePartSlice +
      ', childs = ' +
      this.childs +
      ', bestChild = ' +
      this.bestChildIndex +
      ', ownValue = ' +
      this.ownValue +
      ', hopedValue = ' +
      this.hopedValue +
      ', depth = ' +
      this.depth +
      ']'
    );
  }
  /* public boolean isEndGame() { // version without prints
  if (getScoreStatus(this.ownValue) === SCORE.VICTORY) return true;
  return ((this.childs !== null) && (this.childs.isEmpty()));
 } */

  isEndGame(): boolean {
    const localVerbose = false;

    const scoreStatus: SCORE = MNode.getScoreStatus(this.ownValue);
    if (MNode.VERBOSE || localVerbose) {
      console.log('\nscoreStatus === ' + scoreStatus + '; ');
    }

    if (scoreStatus === SCORE.VICTORY) {
      if (MNode.VERBOSE || localVerbose) {
        console.log('victory found');
      }
      return true;
    }

    if (this.childs === null) {
      if (MNode.VERBOSE || localVerbose) {
        console.log('[calculating childs...]');
      }
      this.createChilds();
    }

    if (MNode.VERBOSE || localVerbose) {
      if (this.childs) {
        console.log(this.childs.length + ' childs; ');
      }
    }

    if (this.childs && this.childs.length === 0) {
      if (MNode.VERBOSE || localVerbose) {
        console.log('end by no - child');
      }
      return true;
    }

    if (MNode.VERBOSE || localVerbose) {
      console.log('nor VICTORY nor childs.isEmpty');
    }

    return false;
  }
  hasMoves(): boolean {
    return this.childs !== null;
  }

  // débug

  countDescendants(): number {
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
  keepOnlyChoosenChild(choix: MNode<R>) {
    this.childs = new Array<MNode<R>>();
    this.childs.push(choix);
  }

}
