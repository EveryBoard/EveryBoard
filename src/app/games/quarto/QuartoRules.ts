import { GameStatus, Rules } from '../../jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { QuartoState } from './QuartoState';
import { QuartoMove } from './QuartoMove';
import { QuartoPiece } from './QuartoPiece';
import { assert, display } from 'src/app/utils/utils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { SCORE } from 'src/app/jscaip/SCORE';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { QuartoFailure } from './QuartoFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export interface BoardStatus {
    score: SCORE;
    sensitiveSquares: SensitiveSquare[];
}
class SensitiveSquare {
    /**
     * List of criteria that need to be fulfilled in this square in order to win.
     * If the piece in hand matches one of these criterion, this is a pre-victory
     */
    criteria: Criterion[];
    x: number;
    y: number;

    constructor(x: number, y: number) {
        /**
         * a sensitive square can be in maximum three lines
         * the horizontal, the vertical, and the diagonal
         */
        this.criteria = new Array<Criterion>(3);
        this.x = x;
        this.y = y;
    }
    /**
     * Add a criterion in square several line contains this sensitive square (1 to 3 lines could)
     * without duplicates
     * return true if the criterion has been added
     */
    public addCriterion(c: Criterion): boolean {
        const i: number = this.indexOf(c);
        if (i > 0) {
            // not added, counted twice
            return false;
        }
        // TODO remove this debug
        assert(i !== 3, `This is impossible, too many elements were added in this SensitiveSquare`);
        this.criteria[-i - 1] = c;
        return true;
    }
    /**
     * See if this criterion is already part of the list
     * Returns the index of c if it is found
     * Returns the index of where it could be added if it is not found
     */
    public indexOf(c: Criterion): number {
        // TODO Criterion.contains
        let i: number;
        for (i = 0; i < 3; i++) {
            if (this.criteria[i] == null) {
                return -i - 1; // is not contained, and there is room at index i
            }
            if (this.criteria[i].equals(c)) {
                return i + 1; // is contained at index i
            }
        }
        return 4; // is not contained and there is no more room
    }
}
/**
 * A criterion is a list of boolean sub-criteria, so three possible values: true, false, null.
 * false means that we need a specific value (e.g., big), true is the opposite (e.g., small)
 * null means that this criterion has been neutralized
 * (if a line contains a big and a small piece, for example).
 */
class Criterion {

    readonly subCriterion: (boolean | null)[] = [null, null, null, null];

    constructor(bSquare: QuartoPiece) {
        // a criterion is initialized with a square, it takes the square's value
        this.subCriterion[0] = (bSquare.value & 8) === 8;
        this.subCriterion[1] = (bSquare.value & 4) === 4;
        this.subCriterion[2] = (bSquare.value & 2) === 2;
        this.subCriterion[3] = (bSquare.value & 1) === 1;
    }
    public setSubCrition(index: number, value: boolean): boolean {
        this.subCriterion[index] = value;
        return true;
        /**
         * TODO check if we need to keep this
         *  currently, it is used to check that there is no override but it should be impossible that it happens
         */
    }
    public equals(o: Criterion): boolean {
        let i: number = 0;
        do {
            if (this.subCriterion[i] !== o.subCriterion[i]) {
                return false; // a!=b
            }
            i++;
        } while (i < 4);

        return true;
    }
    /**
     * Merge with another criterion.
     * This will keep what both have in common
     * Returns true if at least one criterion is common, false otherwise
     */
    public mergeWith(c: Criterion): boolean {
        let i: number = 0;
        let nonNull: number = 4;
        do {
            if (this.subCriterion[i] !== c.subCriterion[i]) {
                /*
                 * if the square represented by C is different from this square
                 * on their ith criterion, then there is no common criterion (null)
                 */
                this.subCriterion[i] = null;
            }
            if (this.subCriterion[i] == null) {
                // if after this, the ith criterion is null, then it loses a criterion
                nonNull--;
            }
            i++;
        } while (i < 4);

        return (nonNull > 0);
    }
    public mergeWithQuartoPiece(ic: QuartoPiece): boolean {
        const c: Criterion = new Criterion(ic);
        return this.mergeWith(c);
    }
    public isAllNull(): boolean {
        let i: number = 0;
        do {
            if (this.subCriterion[i] != null) {
                return false;
            }
            i++;
        } while (i < 4);
        return true;
    }
    public match(c: Criterion): boolean {
        // returns true if there is at least one sub-critere in common between the two
        let i: number = 0;
        do {
            if (this.subCriterion[i] === c.subCriterion[i]) {
                return true;
            }
            i++;
        } while (i < 4);
        return false;
    }
    public matchQE(qe: QuartoPiece): boolean {
        return this.match(new Criterion(qe));
    }
    public matchInt(c: QuartoPiece): boolean {
        return this.match(new Criterion(c));
    }
    public toString(): string {
        return 'Criterion{' + QuartoRules.printArray(
            this.subCriterion.map((b: boolean) => {
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
export class QuartoNode extends MGPNode<QuartoRules, QuartoMove, QuartoState> {}

export class QuartoRules extends Rules<QuartoMove, QuartoState> {

    public applyLegalMove(move: QuartoMove,
                          state: QuartoState)
    : QuartoState
    {
        const newBoard: QuartoPiece[][] = state.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x] = state.pieceInHand;
        const resultingState: QuartoState = new QuartoState(newBoard, state.turn + 1, move.piece);
        return resultingState;
    }

    public static VERBOSE: boolean = false;

    public static readonly lines: ReadonlyArray<Line> = [
        // verticals
        new Line(new Coord(0, 0), Direction.DOWN),
        new Line(new Coord(1, 0), Direction.DOWN),
        new Line(new Coord(2, 0), Direction.DOWN),
        new Line(new Coord(3, 0), Direction.DOWN),
        // horizontals
        new Line(new Coord(0, 0), Direction.RIGHT),
        new Line(new Coord(0, 1), Direction.RIGHT),
        new Line(new Coord(0, 2), Direction.RIGHT),
        new Line(new Coord(0, 3), Direction.RIGHT),
        // diagonals
        new Line(new Coord(0, 0), Direction.DOWN_RIGHT),
        new Line(new Coord(0, 3), Direction.UP_RIGHT),
    ];

    private static isOccupied(square: QuartoPiece): boolean {
        return (square !== QuartoPiece.NONE);
    }
    public static printArray(array: number[]): string {
        let result: string = '[';
        for (const i of array) {
            result += i + ' ';
        }
        return result + ']';
    }
    private static isLegal(move: QuartoMove, state: QuartoState): MGPValidation {
        /**
         * pieceInHand is the one to be placed
         * move.piece is the one gave to the next players
         */
        const x: number = move.coord.x;
        const y: number = move.coord.y;
        const pieceToGive: QuartoPiece = move.piece;
        const board: QuartoPiece[][] = state.getCopiedBoard();
        const pieceInHand: QuartoPiece = state.pieceInHand;
        if (QuartoRules.isOccupied(board[y][x])) {
            // we can't play on an occupied square
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        if (pieceToGive === QuartoPiece.NONE) {
            if (state.turn === 15) {
                // we must give a piece, except on the last turn
                return MGPValidation.SUCCESS;
            }
            return MGPValidation.failure(QuartoFailure.MUST_GIVE_A_PIECE());
        }
        if (!QuartoState.isPlacable(pieceToGive, board)) {
            // the piece is already on the board
            return MGPValidation.failure(QuartoFailure.PIECE_ALREADY_ON_BOARD());
        }
        if (pieceInHand === pieceToGive) {
            // the piece given is the one in our hands, which is illegal
            return MGPValidation.failure(QuartoFailure.CANNOT_GIVE_PIECE_IN_HAND());
        }
        return MGPValidation.SUCCESS;
    }
    // Overrides :

    public isLegal(move: QuartoMove, state: QuartoState): MGPFallible<void> {
        return QuartoRules.isLegal(move, state).toFallible(undefined);
    }
    public static updateBoardStatus(line: Line, state: QuartoState, boardStatus: BoardStatus): BoardStatus {
        if (boardStatus.score === SCORE.PRE_VICTORY) {
            if (this.isThereAVictoriousLine(line, state)) {
                return {
                    score: SCORE.VICTORY,
                    sensitiveSquares: [],
                };
            } else {
                return boardStatus;
            }
        } else {
            const newStatus: BoardStatus = this.searchForVictoryOrPreVictoryInLine(line, state, boardStatus);
            return newStatus;
        }
    }
    private static isThereAVictoriousLine(line: Line, state: QuartoState): boolean {
        /**
         * if we found a pre-victory,
         * the only thing that can change the result is a victory
         */
        let coord: Coord = line.initialCoord;
        let i: number = 0; // index of the tested square
        let c: QuartoPiece = state.getPieceAt(coord);
        const commonCrit: Criterion = new Criterion(c);
        while (QuartoRules.isOccupied(c) && !commonCrit.isAllNull() && (i < 3)) {
            i++;
            coord = coord.getNext(line.direction, 1);
            c = state.getPieceAt(coord);
            commonCrit.mergeWithQuartoPiece(c);
        }
        if (QuartoRules.isOccupied(c) && !commonCrit.isAllNull()) {
            /**
             * the last square was occupied, and there was some common critere on all the four pieces
             * that's what victory is like in Quarto
             */
            return true;
        } else {
            return false;
        }
    }
    private static searchForVictoryOrPreVictoryInLine(line: Line,
                                                      state: QuartoState,
                                                      boardStatus: BoardStatus)
    : BoardStatus
    {
        // we're looking for a victory, pre-victory, or normal score
        let cs: MGPOptional<SensitiveSquare> = MGPOptional.empty(); // the first square is empty
        let commonCrit: MGPOptional<Criterion> = MGPOptional.empty();

        let coord: Coord = line.initialCoord;
        for (let i: number = 0; i < 4; i++) {
            const c: QuartoPiece = state.getPieceAt(coord);
            // we look through the entire line
            if (c === QuartoPiece.NONE) {
                // if c is unoccupied
                if (cs.isAbsent()) {
                    cs = MGPOptional.of(new SensitiveSquare(coord.x, coord.y));
                } else {
                    return boardStatus; // 2 empty square: no victory or pre-victory, or new criterion
                }
            } else {
                // if c is occupied
                if (commonCrit.isAbsent()) {
                    commonCrit = MGPOptional.of(new Criterion(c));
                    display(QuartoRules.VERBOSE, 'set commonCrit to ' + commonCrit.toString());
                } else {
                    commonCrit.get().mergeWithQuartoPiece(c);
                    display(QuartoRules.VERBOSE, 'update commonCrit: ' + commonCrit.toString());
                }
            }
            coord = coord.getNext(line.direction, 1);
        }

        // we now have looked through the entire line, we summarize everything
        if (commonCrit.isPresent() && (!commonCrit.get().isAllNull())) {
            // this line is not null and has a common criterion between all of its pieces
            if (cs.isAbsent()) {
                return { score: SCORE.VICTORY, sensitiveSquares: [] };
            } else {
                // if these is only one empty square, then the sensitive square we found is indeed sensitive
                if (commonCrit.get().matchInt(state.pieceInHand)) {
                    boardStatus.score = SCORE.PRE_VICTORY;
                }
                cs.get().addCriterion(commonCrit.get());
                boardStatus.sensitiveSquares.push(cs.get());
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
        const state: QuartoState = node.gameState;
        let boardStatus: BoardStatus = {
            score: SCORE.DEFAULT,
            sensitiveSquares: [],
        };
        for (const line of QuartoRules.lines) {
            boardStatus = QuartoRules.updateBoardStatus(line, state, boardStatus);
            if (boardStatus.score === SCORE.VICTORY) {
                return QuartoRules.scoreToGameStatus(boardStatus.score, state.turn);
            }
        }
        return QuartoRules.scoreToGameStatus(boardStatus.score, state.turn);
    }
    public getVictoriousCoords(state: QuartoState): Coord[] {
        for (const line of QuartoRules.lines) {
            if (QuartoRules.isThereAVictoriousLine(line, state)) {
                return line.allCoords();
            }
        }
        return [];
    }
}
