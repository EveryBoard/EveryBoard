import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { AbaloneFailure } from './AbaloneFailure';
import { AbaloneState } from './AbaloneState';
import { AbaloneMove } from './AbaloneMove';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export type AbaloneLegalityInformation = Table<FourStatePiece>

export class AbaloneNode extends MGPNode<AbaloneRules, AbaloneMove, AbaloneState, AbaloneLegalityInformation> {}

export class AbaloneRules extends Rules<AbaloneMove, AbaloneState, AbaloneLegalityInformation> {

    public static isLegal(move: AbaloneMove, state: AbaloneState): MGPFallible<AbaloneLegalityInformation> {
        const firstPieceValidity: MGPValidation = this.getFirstPieceValidity(move, state);
        if (firstPieceValidity.isFailure()) {
            return firstPieceValidity.toFailedFallible();
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
    private static isLegalPush(move: AbaloneMove, state: AbaloneState): MGPFallible<AbaloneLegalityInformation> {
        let pieces: number = 1;
        let tested: Coord = move.coord.getNext(move.dir);
        const player: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        const empty: FourStatePiece = FourStatePiece.EMPTY;
        const newBoard: FourStatePiece[][] = state.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x] = empty;
        while (pieces <= 3 && state.isOnBoard(tested) && state.getPieceAt(tested) === player) {
            pieces++;
            tested = tested.getNext(move.dir);
        }
        if (pieces > 3) {
            return MGPFallible.failure(AbaloneFailure.CANNOT_MOVE_MORE_THAN_THREE_PIECES());
        } else if (state.isInBoard(tested) === false) {
            return MGPFallible.success(newBoard);
        }
        newBoard[tested.y][tested.x] = player;
        if (state.getPieceAt(tested) === empty) {
            return MGPFallible.success(newBoard);
        }
        return AbaloneRules.isLegalRealPush(tested, move, state, pieces, newBoard);
    }
    private static isLegalRealPush(firstOpponent: Coord,
                                   move: AbaloneMove,
                                   state: AbaloneState,
                                   pushingPieces: number,
                                   newBoard: FourStatePiece[][])
    : MGPFallible<AbaloneLegalityInformation>
    {
        let opponentPieces: number = 0;
        const OPPONENT: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentOpponent());
        const player: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        while (opponentPieces < pushingPieces &&
               state.isOnBoard(firstOpponent) &&
               state.getPieceAt(firstOpponent) === OPPONENT) {
            opponentPieces++;
            firstOpponent = firstOpponent.getNext(move.dir);
        }
        if (opponentPieces >= pushingPieces) {
            return MGPFallible.failure(AbaloneFailure.NOT_ENOUGH_PIECE_TO_PUSH());
        } else if (firstOpponent.isInRange(9, 9)) {
            if (state.getPieceAt(firstOpponent) === FourStatePiece.EMPTY) {
                newBoard[firstOpponent.y][firstOpponent.x] = OPPONENT;
            }
            if (state.getPieceAt(firstOpponent) === player) {
                return MGPFallible.failure(AbaloneFailure.CANNOT_PUSH_YOUR_OWN_PIECES());
            }
        }
        return MGPFallible.success(newBoard);
    }
    private static isLegalSideStep(move: AbaloneMove, state: AbaloneState): MGPFallible<AbaloneLegalityInformation> {
        let last: Coord = move.lastPiece.get();
        const alignement: Direction = move.coord.getDirectionToward(last).get();
        last = last.getNext(alignement); // to include lastPiece as well
        let tested: Coord = move.coord;
        const player: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        const newBoard: FourStatePiece[][] = state.getCopiedBoard();
        while (tested.equals(last) === false && tested.isInRange(9, 9)) {
            if (state.getPieceAt(tested) !== player) {
                return MGPFallible.failure(AbaloneFailure.MUST_ONLY_TRANSLATE_YOUR_PIECES());
            }
            const landing: Coord = tested.getNext(move.dir);
            newBoard[tested.y][tested.x] = FourStatePiece.EMPTY;
            if (landing.isInRange(9, 9)) {
                if (state.isPiece(landing)) {
                    return MGPFallible.failure(AbaloneFailure.TRANSLATION_IMPOSSIBLE());
                }
                if (state.getPieceAt(landing) === FourStatePiece.EMPTY) {
                    newBoard[landing.y][landing.x] = player;
                }
            }
            tested = tested.getNext(alignement);
        }
        return MGPFallible.success(newBoard);
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
    public applyLegalMove(_move: AbaloneMove, state: AbaloneState, newBoard: AbaloneLegalityInformation): AbaloneState {
        return new AbaloneState(newBoard, state.turn + 1);
    }
    public isLegal(move: AbaloneMove, state: AbaloneState): MGPFallible<AbaloneLegalityInformation> {
        return AbaloneRules.isLegal(move, state);
    }
    public getGameStatus(node: AbaloneNode): GameStatus {
        return AbaloneRules.getGameStatus(node);
    }
}
