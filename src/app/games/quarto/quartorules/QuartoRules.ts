import { Rules } from '../../../jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/mgpnode/MGPNode';
import { QuartoPartSlice } from '../QuartoPartSlice';
import { QuartoMove } from '../quartomove/QuartoMove';
import { QuartoEnum } from '../QuartoEnum';
import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { display } from 'src/app/collectionlib/utils';
import { MGPValidation } from 'src/app/collectionlib/mgpvalidation/MGPValidation';
import { NumberTable } from 'src/app/collectionlib/arrayutils/ArrayUtils';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Orthogonal } from 'src/app/jscaip/DIRECTION';
import { MGPOptional } from 'src/app/collectionlib/mgpoptional/MGPOptional';
import { SCORE } from 'src/app/jscaip/SCORE';

interface BoardStatus {
    score: SCORE;
    casesSensibles: CaseSensible[];
}
class CaseSensible {
    criteres: Critere[];
    // listes des crit�res qu'il faut remplir dans cette case pour gagner
    // si la pi�ce en main match un de ces crit�res, c'est une pr�-victoire
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
    addCritere(c: Critere): boolean {
        // rajoute le crit�re au cas où plusieurs lignes contiennent cette case sensible (de 1 à 3)
        // sans doublons
        // return true si le crit�re a �t� ajout�
        const i: number = this.indexOf(c);
        if (i > 0) {
            // pas ajout�, compt� en double
            return false;
        }
        if (i === 3) {
            throw new Error('CECI EST IMPOSSIBLE, on a rajout� trop d\'�l�ments dans cette CaseSensible'); // TODO enlever ce d�bug
        }
        this.criteres[-i - 1] = c;
        return true;
    }
    indexOf(c: Critere): number {
        // TODO Critere.contains
        // voit si ce crit�re est d�jà contenu dans la liste
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
    /* Un crit�re est une liste sous-crit�res Boolean, donc trois valeurs possibles, True, False, Null
     * False veut dire qu'il faut avoir une valeur sp�cifique (Grand, par exemple), True son oppos� (Petit)
     * Null veut dire que ce crit�re a d�jà �t� 'neutralis�'/'pacifi�' (si une ligne contient un Grand et un Petit pion, par exemple)
     */

    readonly subCritere: boolean[] = [null, null, null, null];

    constructor(bCase: number) {
        // un crit�re est initialis� avec une case, il en prend la valeur
        this.subCritere[0] = ((bCase & 8) === 8) ? true : false;
        this.subCritere[1] = ((bCase & 4) === 4) ? true : false;
        this.subCritere[2] = ((bCase & 2) === 2) ? true : false;
        this.subCritere[3] = ((bCase & 1) === 1) ? true : false;
    }
    setSubCrit(index: number, value: boolean): boolean {
        this.subCritere[index] = value;
        return true; // TODO v�rifier si j'ai un int�rêt à garder ceci
        // pour l'instant ça me permet de pouvoir v�rifier si il n'y a pas �crasement ou donn�e
        // mais je crois que c'est impossible vu l'usage que je compte en faire
    }
    equals(o: any): boolean {
        if (!(o instanceof Critere)) {
            return false;
        }
        const c: Critere = o as Critere;

        let i = 0;
        do {
            if (this.subCritere[i] !== c.subCritere[i]) {
                return false; // a!=b
            }
            i++;
        } while (i < 4);

        return true;
    }
    mergeWith(c: Critere): boolean {
        // merge avec l'autre critere
        // ce qu'ils signifie qu'on prendra ce qu'ils ont en commun
        // return true si ils ont au moins un critere en commun, false sinon

        let i = 0;
        let nonNull = 4;
        do {
            if (this.subCritere[i] !== c.subCritere[i]) {
                // si la case repr�sent�e par C et cette case ci sont diff�rentes
                // sur leurs i'i�me crit�re respectifs, alors il n'y a pas de crit�re en commun (NULL)
                this.subCritere[i] = null;
            }
            if (this.subCritere[i] == null) {
                // si apr�s ceci le i'i�me crit�re de cette repr�sentation est NULL, alors il perd un crit�re
                nonNull--;
            }
            i++;
        } while (i < 4);

        return (nonNull > 0);
    }
    mergeWithNumber(ic: number): boolean {
        const c: Critere = new Critere(ic);
        return this.mergeWith(c);
    }
    mergeWithQE(qe: QuartoEnum): boolean {
        return this.mergeWithNumber(qe);
    }
    isAllNull(): boolean {
        let i = 0;
        do {
            if (this.subCritere[i] !== null) {
                return false;
            }
            i++;
        } while (i < 4);
        return true;
    }
    match(c: Critere): boolean {
        // return true if there is at least one sub-critere in common between the two
        let i = 0;
        do {
            if (this.subCritere[i] === c.subCritere[i]) {
                return true;
            }
            i++;
        } while (i < 4);
        return false;
    }
    matchQE(qe: QuartoEnum): boolean {
        return this.match(new Critere(qe));
    }
    matchInt(c: number): boolean {
        return this.match(new Critere(c));
    }
    toString(): string {
        return 'Critere{' + QuartoRules.printArray(
            this.subCritere.map( (b) => {
                return (b === true) ? 1 : 0;
            })) + '}';
    }
}
abstract class QuartoNode extends MGPNode<QuartoRules, QuartoMove, QuartoPartSlice, LegalityStatus> {}

export class QuartoRules extends Rules<QuartoMove, QuartoPartSlice, LegalityStatus> {
    public applyLegalMove(move: QuartoMove, slice: QuartoPartSlice, status: LegalityStatus): { resultingMove: QuartoMove; resultingSlice: QuartoPartSlice; } {
        const newBoard: number[][] = slice.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x] = slice.pieceInHand;
        const resultingSlice: QuartoPartSlice = new QuartoPartSlice(newBoard, slice.turn + 1, move.piece);
        return { resultingSlice, resultingMove: move };
    } // TODO majeur bug : bloquer les undefined et null comme valeur de move !!

    public static VERBOSE = false;

    public static readonly lines: NumberTable = [
        [0, 0, 0, 1], // les verticales
        [1, 0, 0, 1],
        [2, 0, 0, 1],
        [3, 0, 0, 1],

        [0, 0, 1, 0], // les horizontales
        [0, 1, 1, 0],
        [0, 2, 1, 0],
        [0, 3, 1, 0],

        [0, 0, 1, 1], // les diagonales
        [0, 3, 1, -1]
    ]; // {cx, cy, dx, dy}
    // c (x, y) est la coordonnées de la première case
    // d (x, y) est la direction de la ligne en question

    public node: MGPNode<QuartoRules, QuartoMove, QuartoPartSlice, LegalityStatus>;
    // enum boolean {TRUE, FALSE, NULL}

    private static isOccupied(qcase: number): boolean {
        return (qcase !== QuartoEnum.UNOCCUPIED);
    }
    public static printArray(array: number[]): string {
        let result = '[';
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
        const pieceToGive: number = move.piece;
        const board: number[][] = slice.getCopiedBoard();
        const pieceInHand: number = slice.pieceInHand;
        if (QuartoRules.isOccupied(board[y][x])) {
            // on ne joue pas sur une case occupée
            return MGPValidation.failure('Cannot play on an occupied case.');
        }
        if (pieceToGive === null) {
            if (slice.turn === 15) {
                // on doit donner une pièce ! sauf au dernier tour
                return MGPValidation.SUCCESS;
            }
            return MGPValidation.failure('You must give a piece.');
        }
        if (!QuartoPartSlice.isPlacable(pieceToGive, board)) {
            // la piece est déjà sur le plateau
            return MGPValidation.failure('That piece is already on the board.');
        }
        if (pieceInHand === pieceToGive) {
            // la pièce donnée est la même que celle en main, c'est illégal
            return MGPValidation.failure('You cannot give the piece that was in your hands.');
        }
        return MGPValidation.SUCCESS;
    }
    private static filter(
        board: NumberTable,
        depth: number,
        firstPiece: MGPOptional<QuartoEnum>,
        coordDirs: { coord: Coord, dir: Orthogonal}[],
    ): { coord: Coord, dir: Orthogonal}[] {
        const remainingCoordDirs: { coord: Coord, dir: Orthogonal}[] = [];
        const min: number = QuartoEnum.UNOCCUPIED;
        if (remainingCoordDirs.length === 0) {
            return coordDirs;
        } else {
            return remainingCoordDirs;
        }
    }
    // Overrides :

    public isLegal(move: QuartoMove, slice: QuartoPartSlice): LegalityStatus {
        return { legal: QuartoRules.isLegal(move, slice) };
    }
    public getListMoves(n: QuartoNode): MGPMap<QuartoMove, QuartoPartSlice> {
        const listMoves: MGPMap<QuartoMove, QuartoPartSlice> = new MGPMap<QuartoMove, QuartoPartSlice>();

        const slice: QuartoPartSlice = n.gamePartSlice;
        let moveAppliedPartSlice: QuartoPartSlice;

        const board: number[][] = slice.getCopiedBoard();
        const pawns: Array<QuartoEnum> = slice.getRemainingPawns();
        const inHand: number = slice.pieceInHand;

        let nextBoard: number[][];
        const nextTurn: number = slice.turn + 1;

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (board[y][x] === QuartoEnum.UNOCCUPIED) {
                    // Pour chaque cases vides
                    for (const remainingPiece of pawns) { // piece est la pièce qu'on va donner
                        nextBoard = slice.getCopiedBoard();
                        nextBoard[y][x] = inHand; // on place la pièce qu'on a en main en (x, y)

                        const move: QuartoMove = new QuartoMove(x, y, remainingPiece); // synthèse du mouvement listé
                        moveAppliedPartSlice = new QuartoPartSlice(nextBoard, nextTurn, remainingPiece); // plateau obtenu

                        listMoves.set(move, moveAppliedPartSlice);
                    }
                }
            }
        }
        return listMoves;
    }
    public getBoardValue(move: QuartoMove, slice: QuartoPartSlice): number {
        let boardStatus: BoardStatus = {
            score: SCORE.DEFAULT,
            casesSensibles: []
        };
        for (const line of QuartoRules.lines) {
            boardStatus = this.updateBoardStatus(line, slice, boardStatus);
            if (boardStatus.score === SCORE.VICTORY) {
                return this.scoreToBoardValue(boardStatus.score, slice.turn);
            }
        }
        return this.scoreToBoardValue(boardStatus.score, slice.turn);
    }
    private updateBoardStatus(line: readonly number[], slice: QuartoPartSlice, boardStatus: BoardStatus): BoardStatus {
        // pour chaque ligne (les horizontales, verticales, puis diagonales)
        if (boardStatus.score === SCORE.PRE_VICTORY) {
            if (this.isThereAVictoriousLine(line, slice)) {
                return {
                    score: SCORE.VICTORY,
                    casesSensibles: null
                };
            } else {
                return boardStatus; // Nothing changed exploring this line
            }
        } else {
            const newStatus: BoardStatus = this.searchForVictoryOrPreVictoryInLine(line, slice, boardStatus);
            return newStatus;
        }
    }
    private isThereAVictoriousLine(line: readonly number[], slice: QuartoPartSlice): boolean {
        // si on a trouvé une pré-victoire
        // la seule chose susceptible de changer le résultat total est une victoire
        let cx: number = line[0];
        let cy: number = line[1];
        let dx: number = line[2];
        let dy: number = line[3];
        let i = 0; // index de la case testée
        let c: number = slice.getBoardByXY(cx, cy);
        let commonCrit = new Critere(c);
        while (QuartoRules.isOccupied(c) && !commonCrit.isAllNull() && (i < 3)) {
            i++;
            cy += dy;
            cx += dx; // on regarde la case suivante
            c = slice.getBoardByXY(cx, cy);
            commonCrit.mergeWithNumber(c);
        }
        if (QuartoRules.isOccupied(c) && !commonCrit.isAllNull()) {
            // the last case was occupied, and there was some common critere on all the four pieces
            // that's what victory is like in Quarto
            return true
        } else {
            return false;
        }
    }
    private searchForVictoryOrPreVictoryInLine(line: readonly number[], slice: QuartoPartSlice, boardStatus: BoardStatus): BoardStatus {
        // on cherche pour une victoire, pré victoire, ou un score normal
        let cs: CaseSensible = null; // la première case vide
        let commonCrit: Critere;

        let cx: number = line[0];
        let cy: number = line[1];
        let dx: number = line[2];
        let dy: number = line[3];
        for (let i = 0; i < 4; i++, cy += dy, cx += dx) {
            const c: number = slice.getBoardByXY(cx, cy);
            // on analyse toute la ligne
            if (c === QuartoEnum.UNOCCUPIED) {
                // si la case C est inoccupée
                if (cs == null) {
                    cs = new CaseSensible(cx, cy);
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
        }

        // on a maintenant traité l'entierté de la ligne
        // on en fait le bilan
        if ((commonCrit !== null) && (!commonCrit.isAllNull())) {
            // NEW
            // Cette ligne n'est pas nulle et elle a un critère en commun entre toutes ses pièces
            if (cs == null) {
                return { score: SCORE.VICTORY, casesSensibles: null };
            } else {
                // si il n'y a qu'une case vide, alors la case sensible qu'on avais trouvé et assigné
                // est dans ce cas bel et bien une case sensible
                if (commonCrit.matchInt(slice.pieceInHand)) {
                    display(QuartoRules.VERBOSE, 'Pré-victoire! at line ' + +line[0] + line[1] + line[2] + line[3]);

                    boardStatus.score = SCORE.PRE_VICTORY;
                }
                cs.addCritere(commonCrit);
                boardStatus.casesSensibles.push(cs)
            }
        }
        return boardStatus;
    }
    private scoreToBoardValue(score: SCORE, turn: number): number {
        if (score === SCORE.DEFAULT) {
            return 0;
        } else {
            const isPlayerZeroTurn: boolean = turn % 2 === 0;
            if (score === SCORE.PRE_VICTORY) {
                return isPlayerZeroTurn ? Number.MIN_SAFE_INTEGER + 1 : Number.MAX_SAFE_INTEGER - 1;
            } else {
                return isPlayerZeroTurn ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
            }
        }
    }
}
