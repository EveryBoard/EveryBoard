import { GameStatus, Rules } from '../../jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { QuartoPartSlice } from './QuartoPartSlice';
import { QuartoMove } from './QuartoMove';
import { QuartoPiece } from './QuartoPiece';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { assert, display } from 'src/app/utils/utils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { SCORE } from 'src/app/jscaip/SCORE';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { QuartoFailure } from './QuartoFailure';

export interface BoardStatus {
    score: SCORE;
    casesSensibles: CaseSensible[];
}
class CaseSensible {
    criteres: Critere[];
    // listes des critères qu'il faut remplir dans cette case pour gagner
    // si la pièce en main match un de ces critères, c'est une pré-victoire
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.criteres = new Array<Critere>(3);
        /* une case sensible peut faire au maxium partie de trois lignes
         * l'horizontale, la verticale, la diagonale
         */
        this.x = x;
        this.y = y;
    }
    public addCritere(c: Critere): boolean {
        // rajoute le critère au cas où plusieurs lignes contiennent cette case sensible (de 1 à 3)
        // sans doublons
        // return true si le critère a été ajouté
        const i: number = this.indexOf(c);
        if (i > 0) {
            // pas ajouté, compté en double
            return false;
        }
        assert(i !== 3, 'CECI EST IMPOSSIBLE, on a rajouté trop d\'éléments dans cette CaseSensible');
        // TODO enlever ce débug
        this.criteres[-i - 1] = c;
        return true;
    }
    public indexOf(c: Critere): number {
        // TODO Critere.contains
        // voit si ce critère est déjà contenu dans la liste
        // retourne l'index de c si il le trouve
        // retourne l'index de l'endroit ou on pourrait le mettre si il n'est pas dedans
        let i: number;
        for (i = 0; i < 3; i++) {
            if (this.criteres[i] == null) {
                return -i - 1; // n'est pas contenu et il reste de la place à l'indice i
            }
            if (this.criteres[i].equals(c)) {
                return i + 1; // est contenu à l'indice i
            }
        }
        return 4; // n'est pas contenu et il n'y as plus de place
    }
}
class Critere {
    /* Un critère est une liste sous-critères booléens, donc trois valeurs possibles, True, False, Null
     * False veut dire qu'il faut avoir une valeur spécifique (Grand, par exemple), True son opposé (Petit)
     * Null veut dire que ce critère a déjà été 'neutralisé'/'pacifié'
     * (si une ligne contient un Grand et un Petit pion, par exemple)
     */

    readonly subCritere: boolean[] = [null, null, null, null];

    constructor(bCase: number) {
        // un critère est initialisé avec une case, il en prend la valeur
        this.subCritere[0] = (bCase & 8) === 8;
        this.subCritere[1] = (bCase & 4) === 4;
        this.subCritere[2] = (bCase & 2) === 2;
        this.subCritere[3] = (bCase & 1) === 1;
    }
    public setSubCrit(index: number, value: boolean): boolean {
        this.subCritere[index] = value;
        return true; // TODO vérifier si j'ai un intérêt à garder ceci
        // pour l'instant ça me permet de pouvoir vérifier si il n'y a pas écrasement ou donnée
        // mais je crois que c'est impossible vu l'usage que je compte en faire
    }
    public equals(o: Critere): boolean {
        let i: number = 0;
        do {
            if (this.subCritere[i] !== o.subCritere[i]) {
                return false; // a!=b
            }
            i++;
        } while (i < 4);

        return true;
    }
    public mergeWith(c: Critere): boolean {
        // merge avec l'autre critere
        // ce qu'ils signifie qu'on prendra ce qu'ils ont en commun
        // return true si ils ont au moins un critere en commun, false sinon

        let i: number = 0;
        let nonNull: number = 4;
        do {
            if (this.subCritere[i] !== c.subCritere[i]) {
                // si la case représentée par C et cette case ci sont différentes
                // sur leurs i'ième critère respectifs, alors il n'y a pas de critère en commun (NULL)
                this.subCritere[i] = null;
            }
            if (this.subCritere[i] == null) {
                // si après ceci le i'ième critère de cette représentation est NULL, alors il perd un critère
                nonNull--;
            }
            i++;
        } while (i < 4);

        return (nonNull > 0);
    }
    public mergeWithNumber(ic: number): boolean {
        const c: Critere = new Critere(ic);
        return this.mergeWith(c);
    }
    public mergeWithQuartoPiece(qe: QuartoPiece): boolean {
        return this.mergeWithNumber(qe.value);
    }
    public isAllNull(): boolean {
        let i: number = 0;
        do {
            if (this.subCritere[i] != null) {
                return false;
            }
            i++;
        } while (i < 4);
        return true;
    }
    public match(c: Critere): boolean {
        // return true if there is at least one sub-critere in common between the two
        let i: number = 0;
        do {
            if (this.subCritere[i] === c.subCritere[i]) {
                return true;
            }
            i++;
        } while (i < 4);
        return false;
    }
    public matchQE(qe: QuartoPiece): boolean {
        return this.match(new Critere(qe.value));
    }
    public matchInt(c: number): boolean {
        return this.match(new Critere(c));
    }
    public toString(): string {
        return 'Critere{' + QuartoRules.printArray(
            this.subCritere.map((b: boolean) => {
                return (b === true) ? 1 : 0;
            })) + '}';
    }
}
class Line {
    public constructor(public readonly initialCoord: Coord,
                       public readonly direction: Direction) {}
    public allCoords(): Coord[] {
        const coords: Coord[] = [];
        for (let i: number = 0; i < 4; i++) {
            coords.push(this.initialCoord.getNext(this.direction, i));
        }
        return coords;
    }
}
export abstract class QuartoNode extends MGPNode<QuartoRules, QuartoMove, QuartoPartSlice> {}

export class QuartoRules extends Rules<QuartoMove, QuartoPartSlice> {

    public applyLegalMove(move: QuartoMove,
                          slice: QuartoPartSlice)
    : QuartoPartSlice
    {
        const newBoard: number[][] = slice.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x] = slice.pieceInHand.value;
        const resultingSlice: QuartoPartSlice = new QuartoPartSlice(newBoard, slice.turn + 1, move.piece);
        return resultingSlice;
    }

    public static VERBOSE: boolean = false;

    public static readonly lines: ReadonlyArray<Line> = [
        new Line(new Coord(0, 0), Direction.DOWN), // les verticales
        new Line(new Coord(1, 0), Direction.DOWN),
        new Line(new Coord(2, 0), Direction.DOWN),
        new Line(new Coord(3, 0), Direction.DOWN),
        new Line(new Coord(0, 0), Direction.RIGHT), // les horizontales
        new Line(new Coord(0, 1), Direction.RIGHT),
        new Line(new Coord(0, 2), Direction.RIGHT),
        new Line(new Coord(0, 3), Direction.RIGHT),
        new Line(new Coord(0, 0), Direction.DOWN_RIGHT), // les diagonales
        new Line(new Coord(0, 3), Direction.UP_RIGHT),
    ];

    public node: MGPNode<QuartoRules, QuartoMove, QuartoPartSlice>;

    private static isOccupied(qcase: number): boolean {
        return (qcase !== QuartoPiece.NONE.value);
    }
    public static printArray(array: number[]): string {
        let result: string = '[';
        for (const i of array) {
            result += i + ' ';
        }
        return result + ']';
    }
    private static isLegal(move: QuartoMove, slice: QuartoPartSlice): MGPValidation {
        /* pieceInHand is the one to be placed
         * move.piece is the one gave to the next players
         */
        const x: number = move.coord.x;
        const y: number = move.coord.y;
        const pieceToGive: QuartoPiece = move.piece;
        const board: number[][] = slice.getCopiedBoard();
        const pieceInHand: QuartoPiece = slice.pieceInHand;
        if (QuartoRules.isOccupied(board[y][x])) {
            // on ne joue pas sur une case occupée
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_CASE);
        }
        if (pieceToGive === QuartoPiece.NONE) {
            if (slice.turn === 15) {
                // on doit donner une pièce ! sauf au dernier tour
                return MGPValidation.SUCCESS;
            }
            return MGPValidation.failure(QuartoFailure.MUST_GIVE_A_PIECE);
        }
        if (!QuartoPartSlice.isPlacable(pieceToGive, board)) {
            // la piece est déjà sur le plateau
            return MGPValidation.failure(QuartoFailure.PIECE_ALREADY_ON_BOARD);
        }
        if (pieceInHand === pieceToGive) {
            // la pièce donnée est la même que celle en main, c'est illégal
            return MGPValidation.failure(QuartoFailure.CANNOT_GIVE_PIECE_IN_HAND);
        }
        return MGPValidation.SUCCESS;
    }
    // Overrides :

    public isLegal(move: QuartoMove, slice: QuartoPartSlice): LegalityStatus {
        return { legal: QuartoRules.isLegal(move, slice) };
    }
    public static updateBoardStatus(line: Line, slice: QuartoPartSlice, boardStatus: BoardStatus): BoardStatus {
        // pour chaque ligne (les horizontales, verticales, puis diagonales)
        if (boardStatus.score === SCORE.PRE_VICTORY) {
            if (this.isThereAVictoriousLine(line, slice)) {
                return {
                    score: SCORE.VICTORY,
                    casesSensibles: null,
                };
            } else {
                return boardStatus; // Nothing changed exploring this line
            }
        } else {
            const newStatus: BoardStatus = this.searchForVictoryOrPreVictoryInLine(line, slice, boardStatus);
            return newStatus;
        }
    }
    private static isThereAVictoriousLine(line: Line, slice: QuartoPartSlice): boolean {
        // si on a trouvé une pré-victoire
        // la seule chose susceptible de changer le résultat total est une victoire
        let coord: Coord = line.initialCoord;
        let i: number = 0; // index de la case testée
        let c: number = slice.getBoardAt(coord);
        const commonCrit: Critere = new Critere(c);
        while (QuartoRules.isOccupied(c) && !commonCrit.isAllNull() && (i < 3)) {
            i++;
            coord = coord.getNext(line.direction, 1);
            c = slice.getBoardAt(coord);
            commonCrit.mergeWithNumber(c);
        }
        if (QuartoRules.isOccupied(c) && !commonCrit.isAllNull()) {
            // the last case was occupied, and there was some common critere on all the four pieces
            // that's what victory is like in Quarto
            return true;
        } else {
            return false;
        }
    }
    private static searchForVictoryOrPreVictoryInLine(line: Line,
                                                      slice: QuartoPartSlice,
                                                      boardStatus: BoardStatus)
    : BoardStatus
    {
        // on cherche pour une victoire, pré victoire, ou un score normal
        let cs: CaseSensible = null; // la première case vide
        let commonCrit: Critere;

        let coord: Coord = line.initialCoord;
        for (let i: number = 0; i < 4; i++) {
            const c: number = slice.getBoardAt(coord);
            // on analyse toute la ligne
            if (c === QuartoPiece.NONE.value) {
                // si la case C est inoccupée
                if (cs == null) {
                    cs = new CaseSensible(coord.x, coord.y);
                } else {
                    return boardStatus; // 2 empty case: no victory or pre-victory, or new criteria
                }
            } else {
                // si la case est occupée
                if (commonCrit == null) {
                    commonCrit = new Critere(c);
                    display(QuartoRules.VERBOSE, 'set commonCrit to ' + commonCrit.toString());
                } else {
                    commonCrit.mergeWithNumber(c);
                    display(QuartoRules.VERBOSE, 'update commonCrit: ' + commonCrit.toString());
                }
            }
            coord = coord.getNext(line.direction, 1);
        }

        // on a maintenant traité l'entierté de la ligne
        // on en fait le bilan
        if ((commonCrit != null) && (!commonCrit.isAllNull())) {
            // NEW
            // Cette ligne n'est pas nulle et elle a un critère en commun entre toutes ses pièces
            if (cs == null) {
                return { score: SCORE.VICTORY, casesSensibles: null };
            } else {
                // si il n'y a qu'une case vide, alors la case sensible qu'on avais trouvé et assigné
                // est dans ce cas bel et bien une case sensible
                if (commonCrit.matchInt(slice.pieceInHand.value)) {
                    boardStatus.score = SCORE.PRE_VICTORY;
                }
                cs.addCritere(commonCrit);
                boardStatus.casesSensibles.push(cs);
            }
        }
        return boardStatus;
    }
    public static scoreToGameStatus(score: SCORE, turn: number): GameStatus {
        const player: Player = Player.of(turn % 2);
        if (score === SCORE.VICTORY) {
            return GameStatus.getDefeat(player);
        }
        return turn === 16 ? GameStatus.DRAW : GameStatus.ONGOING;
    }
    public getGameStatus(node: QuartoNode): GameStatus {
        const state: QuartoPartSlice = node.gamePartSlice;
        let boardStatus: BoardStatus = {
            score: SCORE.DEFAULT,
            casesSensibles: [],
        };
        for (const line of QuartoRules.lines) {
            boardStatus = QuartoRules.updateBoardStatus(line, state, boardStatus);
            if (boardStatus.score === SCORE.VICTORY) {
                return QuartoRules.scoreToGameStatus(boardStatus.score, state.turn);
            }
        }
        return QuartoRules.scoreToGameStatus(boardStatus.score, state.turn);
    }
    public getVictoriousCoords(slice: QuartoPartSlice): Coord[] {
        for (const line of QuartoRules.lines) {
            if (QuartoRules.isThereAVictoriousLine(line, slice)) {
                return line.allCoords();
            }
        }
        return [];
    }
}
