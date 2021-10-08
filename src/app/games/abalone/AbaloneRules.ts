import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { AbaloneFailure } from './AbaloneFailure';
import { AbaloneState } from './AbaloneState';
import { AbaloneMove } from './AbaloneMove';

export interface AbaloneLegalityStatus extends LegalityStatus {

    newBoard: FourStatePiece[][];
}

export abstract class AbaloneNode extends MGPNode<AbaloneRules, AbaloneMove, AbaloneState, AbaloneLegalityStatus> {}

export class AbaloneRules extends Rules<AbaloneMove, AbaloneState, AbaloneLegalityStatus> {

    public static isLegal(move: AbaloneMove, state: AbaloneState): AbaloneLegalityStatus {
        const firstPieceValidity: MGPValidation = this.getFirstPieceValidity(move, state);
        if (firstPieceValidity.isFailure()) {
            return { legal: firstPieceValidity, newBoard: null };
        }
        if (move.isSingleCoord()) {
            return AbaloneRules.isLegalPush(move, state);
        } else {
            return AbaloneRules.isLegalSideStep(move, state);
        }
    }
    private static getFirstPieceValidity(move: AbaloneMove, state: AbaloneState): MGPValidation {
        const firstPiece: FourStatePiece = state.getPieceAt(move.coord);
        if (state.isPiece(move.coord) === false) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        } else if (firstPiece === FourStatePiece.ofPlayer(state.getCurrentOpponent())) {
            return MGPValidation.failure(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        } else {
            return MGPValidation.SUCCESS;
        }
    }
    private static isLegalPush(move: AbaloneMove, state: AbaloneState): AbaloneLegalityStatus {
        let pieces: number = 1;
        let tested: Coord = move.coord.getNext(move.dir);
        const PLAYER: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        const EMPTY: FourStatePiece = FourStatePiece.EMPTY;
        const newBoard: FourStatePiece[][] = state.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x] = EMPTY;
        while (pieces <= 3 && state.getNullable(tested) === PLAYER) {
            pieces++;
            tested = tested.getNext(move.dir);
        }
        if (pieces > 3) {
            return { legal: MGPValidation.failure(AbaloneFailure.CANNOT_MOVE_MORE_THAN_THREE_PIECES()), newBoard };
        } else if (state.isInBoard(tested) === false) {
            return { legal: MGPValidation.SUCCESS, newBoard };
        }
        newBoard[tested.y][tested.x] = PLAYER;
        if (state.getPieceAt(tested) === EMPTY) {
            return { legal: MGPValidation.SUCCESS, newBoard };
        }
        return AbaloneRules.isLegalRealPush(tested, move, state, pieces, newBoard);
    }
    private static isLegalRealPush(firstOpponent: Coord,
                                   move: AbaloneMove,
                                   state: AbaloneState,
                                   pushingPieces: number,
                                   newBoard: FourStatePiece[][])
    : AbaloneLegalityStatus
    {
        let opponentPieces: number = 0;
        const OPPONENT: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentOpponent());
        const PLAYER: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        while (opponentPieces < pushingPieces && state.getNullable(firstOpponent) === OPPONENT) {
            opponentPieces++;
            firstOpponent = firstOpponent.getNext(move.dir);
        }
        if (opponentPieces >= pushingPieces) {
            return { legal: MGPValidation.failure(AbaloneFailure.NOT_ENOUGH_PIECE_TO_PUSH()), newBoard };
        } else if (firstOpponent.isInRange(9, 9)) {
            if (state.getPieceAt(firstOpponent) === FourStatePiece.EMPTY) {
                newBoard[firstOpponent.y][firstOpponent.x] = OPPONENT;
            }
            if (state.getPieceAt(firstOpponent) === PLAYER) {
                return { legal: MGPValidation.failure(AbaloneFailure.CANNOT_PUSH_YOUR_OWN_PIECES()), newBoard };
            }
        }
        return { legal: MGPValidation.SUCCESS, newBoard };
    }
    private static isLegalSideStep(move: AbaloneMove, state: AbaloneState): AbaloneLegalityStatus {
        let last: Coord = move.lastPiece.get();
        const alignement: Direction = move.coord.getDirectionToward(last).get();
        last = last.getNext(alignement); // to include lastPiece as well
        let tested: Coord = move.coord;
        const PLAYER: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        const newBoard: FourStatePiece[][] = state.getCopiedBoard();
        while (tested.equals(last) === false && tested.isInRange(9, 9)) {
            if (state.getPieceAt(tested) !== PLAYER) {
                return {
                    legal: MGPValidation.failure(AbaloneFailure.MUST_ONLY_TRANSLATE_YOUR_PIECES()),
                    newBoard: null,
                };
            }
            const landing: Coord = tested.getNext(move.dir);
            newBoard[tested.y][tested.x] = FourStatePiece.EMPTY;
            if (landing.isInRange(9, 9)) {
                if (state.isPiece(landing)) {
                    return {
                        legal: MGPValidation.failure(AbaloneFailure.TRANSLATION_IMPOSSIBLE()),
                        newBoard: null,
                    };
                }
                if (state.getPieceAt(landing) === FourStatePiece.EMPTY) {
                    newBoard[landing.y][landing.x] = PLAYER;
                }
            }
            tested = tested.getNext(alignement);
        }
        return { legal: MGPValidation.SUCCESS, newBoard };
    }
    public static getGameStatus(node: AbaloneNode): GameStatus {
        const scores: [number, number] = node.gameState.getScores();
        if (scores[0] > 5) {
            return GameStatus.ZERO_WON;
        } else if (scores[1] > 5) {
            return GameStatus.ONE_WON;
        } else {
            return GameStatus.ONGOING;
        }
    }
    public applyLegalMove(move: AbaloneMove, state: AbaloneState, status: AbaloneLegalityStatus): AbaloneState {
        return new AbaloneState(status.newBoard, state.turn + 1);
    }
    public isLegal(move: AbaloneMove, state: AbaloneState): AbaloneLegalityStatus {
        return AbaloneRules.isLegal(move, state);
    }
    public getGameStatus(node: AbaloneNode): GameStatus {
        return AbaloneRules.getGameStatus(node);
    }
}
