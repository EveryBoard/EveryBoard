import { Rules } from '../../jscaip/Rules';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { QuartoState } from './QuartoState';
import { QuartoMove } from './QuartoMove';
import { QuartoPiece } from './QuartoPiece';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { Coord } from 'src/app/jscaip/Coord';
import { Ordinal } from 'src/app/jscaip/Ordinal';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { QuartoFailure } from './QuartoFailure';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { TableUtils } from 'src/app/jscaip/TableUtils';
import { CoordSet } from 'src/app/jscaip/CoordSet';
import { Debug } from 'src/app/utils/Debug';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { AlignmentStatus } from 'src/app/jscaip/AI/AlignmentHeuristic';

/**
 * A criterion is a list of boolean sub-criteria, so three possible values: true, false, null.
 * false means that we need a specific value (e.g., big), true is the opposite (e.g., small)
 * null means that this criterion has been neutralized
 * (if a line contains a big and a small piece, for example).
 */
class QuartoCriterion {

    private readonly subCriterion: MGPOptional<boolean>[] =
        [MGPOptional.empty(), MGPOptional.empty(), MGPOptional.empty(), MGPOptional.empty()];

    public constructor(piece: QuartoPiece) {
        // a criterion is initialized with a piece, it takes the piece's value
        this.subCriterion[0] = MGPOptional.of((piece.value & 8) === 8);
        this.subCriterion[1] = MGPOptional.of((piece.value & 4) === 4);
        this.subCriterion[2] = MGPOptional.of((piece.value & 2) === 2);
        this.subCriterion[3] = MGPOptional.of((piece.value & 1) === 1);
    }
    /**
     * Merge with another criterion.
     * This will keep what both have in common
     * Returns true if at least one criterion is common, false otherwise
     */
    public mergeWith(other: QuartoCriterion): boolean {
        let nonNull: number = 4;
        for (let i: number = 0; i < 4; i++) {
            if (this.subCriterion[i].equals(other.subCriterion[i]) === false) {
                /*
                 * if the piece represented by `other` is different from this piece
                 * on their ith criterion, then there is no common criterion (null)
                 */
                this.subCriterion[i] = MGPOptional.empty();
            }
            if (this.subCriterion[i].isAbsent()) {
                // if after this, the ith criterion is empty, then it lost a criterion
                nonNull--;
            }
        }
        return nonNull > 0;
    }

    public mergeWithQuartoPiece(piece: QuartoPiece): boolean {
        const criterion: QuartoCriterion = new QuartoCriterion(piece);
        return this.mergeWith(criterion);
    }

    public areAllAbsent(): boolean {
        for (let i: number = 0; i < 4; i++) {
            if (this.subCriterion[i].isPresent()) {
                return false;
            }
        }
        return true;
    }

    // returns true if there is at least one sub-criterion in common between the two
    public match(c: QuartoCriterion): boolean {
        for (let i: number = 0; i < 4; i++) {
            if (this.subCriterion[i].equals(c.subCriterion[i])) {
                return true;
            }
        }
        return false;
    }

    public matchPiece(piece: QuartoPiece): boolean {
        return this.match(new QuartoCriterion(piece));
    }

    public toString(): string {
        return 'Criterion{' +
            this.subCriterion.map((b: MGPOptional<boolean>) => {
                if (b.isPresent()) {
                    if (b.get()) {
                        return '1';
                    } else {
                        return '0';
                    }
                } else {
                    return 'x';
                }
            }).join(' ') + '}';
    }
}

export interface BoardStatus {

    status: AlignmentStatus;

    sensitiveSquares: CoordSet;
}

class QuartoLine {
    public constructor(public readonly initialCoord: Coord,
                       public readonly direction: Ordinal) {}
    public allCoords(): Coord[] {
        const coords: Coord[] = [];
        for (let i: number = 0; i < 4; i++) {
            coords.push(this.initialCoord.getNext(this.direction, i));
        }
        return coords;
    }
}
export class QuartoNode extends GameNode<QuartoMove, QuartoState> {}

interface LineInfos {

    commonCriterion: MGPOptional<QuartoCriterion>;

    sensitiveCoord: MGPOptional<Coord>;

    boardStatus: MGPOptional<BoardStatus>;
}

export class QuartoRules extends Rules<QuartoMove, QuartoState> {

    private static singleton: MGPOptional<QuartoRules> = MGPOptional.empty();

    public static get(): QuartoRules {
        if (QuartoRules.singleton.isAbsent()) {
            QuartoRules.singleton = MGPOptional.of(new QuartoRules());
        }
        return QuartoRules.singleton.get();
    }

    public override getInitialState(): QuartoState {
        const board: QuartoPiece[][] = TableUtils.create(4, 4, QuartoPiece.EMPTY);
        return new QuartoState(board, 0, QuartoPiece.AAAA);
    }

    public readonly lines: ReadonlyArray<QuartoLine> = [
        // verticals
        new QuartoLine(new Coord(0, 0), Ordinal.DOWN),
        new QuartoLine(new Coord(1, 0), Ordinal.DOWN),
        new QuartoLine(new Coord(2, 0), Ordinal.DOWN),
        new QuartoLine(new Coord(3, 0), Ordinal.DOWN),
        // horizontals
        new QuartoLine(new Coord(0, 0), Ordinal.RIGHT),
        new QuartoLine(new Coord(0, 1), Ordinal.RIGHT),
        new QuartoLine(new Coord(0, 2), Ordinal.RIGHT),
        new QuartoLine(new Coord(0, 3), Ordinal.RIGHT),
        // diagonals
        new QuartoLine(new Coord(0, 0), Ordinal.DOWN_RIGHT),
        new QuartoLine(new Coord(0, 3), Ordinal.UP_RIGHT),
    ];

    private isOccupied(square: QuartoPiece): boolean {
        return (square !== QuartoPiece.EMPTY);
    }
    public override isLegal(move: QuartoMove, state: QuartoState): MGPValidation {
        /**
         * pieceInHand is the one to be placed
         * move.piece is the one given to the next player
         */
        const x: number = move.coord.x;
        const y: number = move.coord.y;
        const pieceToGive: QuartoPiece = move.piece;
        const board: QuartoPiece[][] = state.getCopiedBoard();
        const pieceInHand: QuartoPiece = state.pieceInHand;
        if (this.isOccupied(board[y][x])) {
            // we can't play on an occupied square
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        if (pieceToGive === QuartoPiece.EMPTY) {
            if (state.turn === 15) {
                // we must give a piece, except on the last turn
                return MGPValidation.SUCCESS;
            }
            return MGPValidation.failure(QuartoFailure.MUST_GIVE_A_PIECE());
        }
        if (QuartoState.isAlreadyOnBoard(pieceToGive, board)) {
            // the piece is already on the board
            return MGPValidation.failure(QuartoFailure.PIECE_ALREADY_ON_BOARD());
        }
        if (pieceInHand === pieceToGive) {
            // the piece given is the one in our hands, which is illegal
            return MGPValidation.failure(QuartoFailure.CANNOT_GIVE_PIECE_IN_HAND());
        }
        return MGPValidation.SUCCESS;
    }

    public override applyLegalMove(move: QuartoMove, state: QuartoState, _config: NoConfig, _info: void): QuartoState {
        const newBoard: QuartoPiece[][] = state.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x] = state.pieceInHand;
        const resultingState: QuartoState = new QuartoState(newBoard, state.turn + 1, move.piece);
        return resultingState;
    }

    public updateBoardStatus(line: QuartoLine, state: QuartoState, boardStatus: BoardStatus): BoardStatus {
        if (boardStatus.status === AlignmentStatus.PRE_VICTORY) {
            if (this.isThereAVictoriousLine(line, state)) {
                return {
                    status: AlignmentStatus.VICTORY,
                    sensitiveSquares: new CoordSet(),
                };
            } else {
                return boardStatus;
            }
        } else {
            const newStatus: BoardStatus = this.searchForVictoryOrPreVictoryInLine(line, state, boardStatus);
            return newStatus;
        }
    }

    private isThereAVictoriousLine(line: QuartoLine, state: QuartoState): boolean {
        /**
         * if we found a pre-victory,
         * the only thing that can change the result is a victory
         */
        let coord: Coord = line.initialCoord;
        let c: QuartoPiece = state.getPieceAt(coord);
        const commonCrit: QuartoCriterion = new QuartoCriterion(c);
        for (let i: number = 0; i < 3; i++) {
            if (this.isOccupied(c) === false || commonCrit.areAllAbsent()) {
                break;
            }
            coord = coord.getNext(line.direction, 1);
            c = state.getPieceAt(coord);
            commonCrit.mergeWithQuartoPiece(c);
        }
        if (this.isOccupied(c) && commonCrit.areAllAbsent() === false) {
            /**
             * the last square was occupied, and there was some common criterion on all the four pieces
             * that's what victory is like in Quarto
             */
            return true;
        } else {
            return false;
        }
    }

    private searchForVictoryOrPreVictoryInLine(line: QuartoLine,
                                               state: QuartoState,
                                               boardStatus: BoardStatus)
    : BoardStatus
    {
        // we're looking for a victory, pre-victory
        const lineInfos: LineInfos = this.getLineInfos(line, state, boardStatus);
        if (lineInfos.boardStatus.isPresent()) {
            return lineInfos.boardStatus.get();
        }
        const commonCriterion: MGPOptional<QuartoCriterion> = lineInfos.commonCriterion;
        const sensitiveCoord: MGPOptional<Coord> = lineInfos.sensitiveCoord;

        // we now have looked through the entire line, we summarize everything
        if (commonCriterion.isPresent() && (commonCriterion.get().areAllAbsent() === false)) {
            // this line is not null and has a common criterion between all of its pieces
            if (sensitiveCoord.isAbsent()) {
                // the line is full
                return { status: AlignmentStatus.VICTORY, sensitiveSquares: new CoordSet() };
            } else {
                // if there is only one empty square, then the sensitive square we found is indeed sensitive
                if (commonCriterion.get().matchPiece(state.pieceInHand)) {
                    boardStatus.status = AlignmentStatus.PRE_VICTORY;
                }
                const coord: Coord = sensitiveCoord.get();
                boardStatus.sensitiveSquares = boardStatus.sensitiveSquares.addElement(coord);
            }
        }
        return boardStatus;
    }

    private getLineInfos(line: QuartoLine, state: QuartoState, boardStatus: BoardStatus): LineInfos {
        let sensitiveCoord: MGPOptional<Coord> = MGPOptional.empty(); // the first square is empty
        let commonCriterion: MGPOptional<QuartoCriterion> = MGPOptional.empty();

        let coord: Coord = line.initialCoord;
        for (let i: number = 0; i < 4; i++) {
            const c: QuartoPiece = state.getPieceAt(coord);
            // we look through the entire line
            if (c === QuartoPiece.EMPTY) {
                // if c is unoccupied
                if (sensitiveCoord.isAbsent()) {
                    sensitiveCoord = MGPOptional.of(coord);
                } else {
                    // 2 empty square: no victory or pre-victory, or new criterion
                    return {
                        sensitiveCoord: MGPOptional.of(coord),
                        commonCriterion,
                        boardStatus: MGPOptional.of(boardStatus),
                    };
                }
            } else {
                // if c is occupied
                if (commonCriterion.isAbsent()) {
                    commonCriterion = MGPOptional.of(new QuartoCriterion(c));
                    Debug.display('QuartoRules', 'getLineInfos', 'set commonCrit to ' + commonCriterion.toString());
                } else {
                    commonCriterion.get().mergeWithQuartoPiece(c);
                    Debug.display('QuartoRules', 'getLineInfos', 'update commonCrit: ' + commonCriterion.toString());
                }
            }
            coord = coord.getNext(line.direction, 1);
        }
        return { commonCriterion, sensitiveCoord, boardStatus: MGPOptional.empty() };
    }

    public override getGameStatus(node: QuartoNode): GameStatus {
        const state: QuartoState = node.gameState;
        let boardStatus: BoardStatus = {
            status: AlignmentStatus.NOTHING,
            sensitiveSquares: new CoordSet(),
        };
        for (const line of this.lines) {
            boardStatus = this.updateBoardStatus(line, state, boardStatus);
            if (boardStatus.status === AlignmentStatus.VICTORY) {
                return boardStatus.status.toGameStatus(state.turn);
            }
        }
        return boardStatus.status.toGameStatus(state.turn);
    }

    public getVictoriousCoords(state: QuartoState): Coord[] {
        for (const line of this.lines) {
            if (this.isThereAVictoriousLine(line, state)) {
                return line.allCoords();
            }
        }
        return [];
    }
}
