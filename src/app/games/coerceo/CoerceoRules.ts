import { Coord } from 'src/app/jscaip/Coord';
import { GameNode } from 'src/app/jscaip/GameNode';
import { Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Debug, Utils } from 'src/app/utils/utils';
import { CoerceoMove, CoerceoRegularMove, CoerceoTileExchangeMove } from './CoerceoMove';
import { CoerceoState } from './CoerceoState';
import { CoerceoFailure } from './CoerceoFailure';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Table } from 'src/app/utils/ArrayUtils';

export class CoerceoNode extends GameNode<CoerceoMove, CoerceoState> {}

@Debug.log
export class CoerceoRules extends Rules<CoerceoMove, CoerceoState> {

    private static singleton: MGPOptional<CoerceoRules> = MGPOptional.empty();

    public static get(): CoerceoRules {
        if (CoerceoRules.singleton.isAbsent()) {
            CoerceoRules.singleton = MGPOptional.of(new CoerceoRules());
        }
        return CoerceoRules.singleton.get();
    }

    public getInitialState(): CoerceoState {
        const _: FourStatePiece = FourStatePiece.EMPTY;
        const N: FourStatePiece = FourStatePiece.UNREACHABLE;
        const O: FourStatePiece = FourStatePiece.ZERO;
        const X: FourStatePiece = FourStatePiece.ONE;
        const board: Table<FourStatePiece> = [
            [N, N, N, N, N, N, O, _, O, N, N, N, N, N, N],
            [N, N, N, _, _, O, _, _, _, O, _, _, N, N, N],
            [_, X, _, X, _, _, O, _, O, _, _, X, _, X, _],
            [X, _, _, _, X, _, _, _, _, _, X, _, _, _, X],
            [_, X, _, X, _, _, _, _, _, _, _, X, _, X, _],
            [_, O, _, O, _, _, _, _, _, _, _, O, _, O, _],
            [O, _, _, _, O, _, _, _, _, _, O, _, _, _, O],
            [_, O, _, O, _, _, X, _, X, _, _, O, _, O, _],
            [N, N, N, _, _, X, _, _, _, X, _, _, N, N, N],
            [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
        ];
        return new CoerceoState(board, 0, [0, 0], [0, 0]);
    }

    public applyLegalMove(move: CoerceoMove, state: CoerceoState, _info: void): CoerceoState {
        if (CoerceoMove.isTileExchange(move)) {
            return this.applyLegalTileExchange(move, state);
        } else {
            return this.applyLegalMovement(move, state);
        }
    }
    public applyLegalTileExchange(move: CoerceoTileExchangeMove, state: CoerceoState): CoerceoState {
        const newBoard: FourStatePiece[][] = state.getCopiedBoard();
        const captured: Coord = move.coord;
        newBoard[captured.y][captured.x] = FourStatePiece.EMPTY;
        const newCaptures: [number, number] = [state.captures[0], state.captures[1]];
        newCaptures[state.getCurrentPlayer().value] += 1;
        const newTiles: [number, number] = [state.tiles[0], state.tiles[1]];
        newTiles[state.getCurrentPlayer().value] -= 2;
        const afterCapture: CoerceoState = new CoerceoState(newBoard,
                                                            state.turn,
                                                            newTiles,
                                                            newCaptures);
        const afterTileRemoval: CoerceoState = afterCapture.removeTilesIfNeeded(captured, false);
        const resultingState: CoerceoState = new CoerceoState(afterTileRemoval.getCopiedBoard(),
                                                              afterTileRemoval.turn + 1,
                                                              afterTileRemoval.tiles,
                                                              afterTileRemoval.captures);
        return resultingState;
    }
    public applyLegalMovement(move: CoerceoRegularMove, state: CoerceoState): CoerceoState {
        // Move the piece
        const afterMovement: CoerceoState = state.applyLegalMovement(move);
        // removes emptied tiles
        const afterTilesRemoved: CoerceoState = afterMovement.removeTilesIfNeeded(move.getStart(), true);
        // removes captured pieces
        const afterCaptures: CoerceoState = afterTilesRemoved.doMovementCaptures(move);
        const resultingState: CoerceoState = new CoerceoState(afterCaptures.board,
                                                              state.turn + 1,
                                                              afterCaptures.tiles,
                                                              afterCaptures.captures);
        return resultingState;
    }
    public isLegal(move: CoerceoMove, state: CoerceoState): MGPValidation {
        if (CoerceoMove.isTileExchange(move)) {
            return this.isLegalTileExchange(move, state);
        } else {
            return this.isLegalMovement(move, state);
        }
    }
    public isLegalTileExchange(move: CoerceoTileExchangeMove, state: CoerceoState): MGPValidation {
        if (state.tiles[state.getCurrentPlayer().value] < 2) {
            return MGPValidation.failure(CoerceoFailure.NOT_ENOUGH_TILES_TO_EXCHANGE());
        }
        const captured: FourStatePiece = state.getPieceAt(move.coord);
        if (captured === FourStatePiece.UNREACHABLE ||
            captured === FourStatePiece.EMPTY)
        {
            return MGPValidation.failure(CoerceoFailure.CANNOT_CAPTURE_FROM_EMPTY());
        }
        if (captured.is(state.getCurrentPlayer())) {
            return MGPValidation.failure(RulesFailure.CANNOT_SELF_CAPTURE());
        }
        return MGPValidation.SUCCESS;
    }
    public isLegalMovement(move: CoerceoRegularMove, state: CoerceoState): MGPValidation {
        Utils.assert(state.getPieceAt(move.getStart()) !== FourStatePiece.UNREACHABLE,
                     'Cannot start with a coord outside the board ' + move.getStart().toString() + '.');
        Utils.assert(state.getPieceAt(move.getEnd()) !== FourStatePiece.UNREACHABLE,
                     'Cannot end with a coord outside the board ' + move.getEnd().toString() + '.');
        const starter: FourStatePiece = state.getPieceAt(move.getStart());
        if (starter === FourStatePiece.EMPTY) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        if (starter.is(state.getCurrentOpponent())) {
            return MGPValidation.failure(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }
        const lander: FourStatePiece = state.getPieceAt(move.getEnd());
        if (lander.is(state.getCurrentPlayer())) {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        return MGPValidation.SUCCESS;
    }
    public static getGameStatus(node: CoerceoNode): GameStatus {
        const state: CoerceoState = node.gameState;
        if (state.captures[0] >= 18) {
            return GameStatus.ZERO_WON;
        }
        if (state.captures[1] >= 18) {
            return GameStatus.ONE_WON;
        }
        return GameStatus.ONGOING;
    }
    public getGameStatus(node: CoerceoNode): GameStatus {
        return CoerceoRules.getGameStatus(node);
    }
}
