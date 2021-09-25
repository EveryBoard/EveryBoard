import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { AbaloneFailure } from './AbaloneFailure';
import { AbaloneGameState } from './AbaloneGameState';
import { AbaloneMove } from './AbaloneMove';

export interface AbaloneLegalityStatus extends LegalityStatus {

    newBoard: number[][];
}

export abstract class AbaloneNode extends MGPNode<AbaloneRules, AbaloneMove, AbaloneGameState, AbaloneLegalityStatus> {}

export class AbaloneRules extends Rules<AbaloneMove, AbaloneGameState, AbaloneLegalityStatus> {

    public static isLegal(move: AbaloneMove, state: AbaloneGameState): AbaloneLegalityStatus {
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
    private static getFirstPieceValidity(move: AbaloneMove, state: AbaloneGameState): MGPValidation {
        const firstPiece: number = state.getBoardAt(move.coord);
        if (state.isPiece(move.coord) === false) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY);
        } else if (firstPiece === state.getCurrentEnnemy().value) {
            return MGPValidation.failure(RulesFailure.CANNOT_CHOOSE_ENEMY_PIECE);
        } else {
            return MGPValidation.SUCCESS;
        }
    }
    private static isLegalPush(move: AbaloneMove, state: AbaloneGameState): AbaloneLegalityStatus {
        let pieces: number = 1;
        let tested: Coord = move.coord.getNext(move.dir);
        const PLAYER: number = state.getCurrentPlayer().value;
        const EMPTY: number = FourStatePiece.EMPTY.value;
        const newBoard: number[][] = state.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x] = EMPTY;
        while (pieces <= 3 && state.getNullable(tested) === PLAYER) {
            pieces++;
            tested = tested.getNext(move.dir);
        }
        if (pieces > 3) {
            return { legal: MGPValidation.failure(AbaloneFailure.CANNOT_MOVE_MORE_THAN_THREE_PIECES), newBoard };
        } else if (state.isInBoard(tested) === false) {
            return { legal: MGPValidation.SUCCESS, newBoard };
        }
        newBoard[tested.y][tested.x] = PLAYER;
        if (state.getBoardAt(tested) === EMPTY) {
            return { legal: MGPValidation.SUCCESS, newBoard };
        }
        return AbaloneRules.isLegalRealPush(tested, move, state, pieces, newBoard);
    }
    private static isLegalRealPush(firstEnnemy: Coord,
                                   move: AbaloneMove,
                                   state: AbaloneGameState,
                                   pushingPieces: number,
                                   newBoard: number[][])
    : AbaloneLegalityStatus
    {
        let enemyPieces: number = 0;
        const ENEMY: number = state.getCurrentEnnemy().value;
        const PLAYER: number = state.getCurrentPlayer().value;
        while (enemyPieces < pushingPieces && state.getNullable(firstEnnemy) === ENEMY) {
            enemyPieces++;
            firstEnnemy = firstEnnemy.getNext(move.dir);
        }
        if (enemyPieces >= pushingPieces) {
            return { legal: MGPValidation.failure(AbaloneFailure.NOT_ENOUGH_PIECE_TO_PUSH), newBoard };
        } else if (firstEnnemy.isInRange(9, 9)) {
            if (state.getBoardAt(firstEnnemy) === FourStatePiece.EMPTY.value) {
                newBoard[firstEnnemy.y][firstEnnemy.x] = ENEMY;
            }
            if (state.getBoardAt(firstEnnemy) === PLAYER) {
                return { legal: MGPValidation.failure(AbaloneFailure.CANNOT_PUSH_YOUR_OWN_PIECES), newBoard };
            }
        }
        return { legal: MGPValidation.SUCCESS, newBoard };
    }
    private static isLegalSideStep(move: AbaloneMove, state: AbaloneGameState): AbaloneLegalityStatus {
        let last: Coord = move.lastPiece.get();
        const alignement: Direction = move.coord.getDirectionToward(last).get();
        last = last.getNext(alignement); // to include lastPiece as well
        let tested: Coord = move.coord;
        const PLAYER: number = state.getCurrentPlayer().value;
        const newBoard: number[][] = state.getCopiedBoard();
        while (tested.equals(last) === false && tested.isInRange(9, 9)) {
            if (state.getBoardAt(tested) !== PLAYER) {
                return {
                    legal: MGPValidation.failure(AbaloneFailure.MUST_ONLY_TRANSLATE_YOUR_PIECES),
                    newBoard: null,
                };
            }
            const landing: Coord = tested.getNext(move.dir);
            newBoard[tested.y][tested.x] = FourStatePiece.EMPTY.value;
            if (landing.isInRange(9, 9)) {
                if (state.isPiece(landing)) {
                    return {
                        legal: MGPValidation.failure(AbaloneFailure.TRANSLATION_IMPOSSIBLE),
                        newBoard: null,
                    };
                }
                if (state.getBoardAt(landing) === FourStatePiece.EMPTY.value) {
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
    public applyLegalMove(move: AbaloneMove, state: AbaloneGameState, status: AbaloneLegalityStatus): AbaloneGameState {
        return new AbaloneGameState(status.newBoard, state.turn + 1);
    }
    public isLegal(move: AbaloneMove, state: AbaloneGameState): AbaloneLegalityStatus {
        return AbaloneRules.isLegal(move, state);
    }
    public getGameStatus(node: AbaloneNode): GameStatus {
        return AbaloneRules.getGameStatus(node);
    }
}
