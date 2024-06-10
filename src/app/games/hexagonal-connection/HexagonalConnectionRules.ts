import { Rules } from 'src/app/jscaip/Rules';
import { HexagonalConnectionState } from './HexagonalConnectionState';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { MGPValidation, MGPOptional, Utils } from '@everyboard/lib';
import { HexagonalConnectionDrops, HexagonalConnectionFirstMove, HexagonalConnectionMove } from './HexagonalConnectionMove';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { Table } from 'src/app/jscaip/TableUtils';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

export class HexagonalConnectionNode extends GameNode<HexagonalConnectionMove, HexagonalConnectionState> {}

export class HexagonalConnectionRules extends Rules<HexagonalConnectionMove, HexagonalConnectionState> {

    private static singleton: MGPOptional<HexagonalConnectionRules> = MGPOptional.empty();

    public static get(): HexagonalConnectionRules {
        if (HexagonalConnectionRules.singleton.isAbsent()) {
            HexagonalConnectionRules.singleton = MGPOptional.of(new HexagonalConnectionRules());
        }
        return HexagonalConnectionRules.singleton.get();
    }

    public static readonly HEXAGONAL_CONNECTION_HELPER: NInARowHelper<FourStatePiece> =
        new NInARowHelper((piece: FourStatePiece) => piece.getPlayer(), 6);

    public static getVictoriousCoords(state: HexagonalConnectionState): Coord[] {
        return HexagonalConnectionRules.HEXAGONAL_CONNECTION_HELPER.getVictoriousCoord(state);
    }

    public override getInitialState(_config: NoConfig): HexagonalConnectionState {
        const _: FourStatePiece = FourStatePiece.EMPTY;
        const N: FourStatePiece = FourStatePiece.UNREACHABLE;
        const board: Table<FourStatePiece> = [
            [N, N, N, N, N, N, _, _, _, _, _, _, _],
            [N, N, N, N, N, _, _, _, _, _, _, _, _],
            [N, N, N, N, _, _, _, _, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, _, _, _, _, N, N],
            [_, _, _, _, _, _, _, _, _, _, N, N, N],
            [_, _, _, _, _, _, _, _, _, N, N, N, N],
            [_, _, _, _, _, _, _, _, N, N, N, N, N],
            [_, _, _, _, _, _, _, N, N, N, N, N, N],
        ];
        return new HexagonalConnectionState(board, 0);
    }

    public override applyLegalMove(move: HexagonalConnectionMove,
                                   state: HexagonalConnectionState)
    : HexagonalConnectionState
    {
        if (move instanceof HexagonalConnectionDrops) {
            return this.applyLegalDrops(move, state);
        } else {
            return this.applyLegalFirstMove(move, state);
        }
    }

    private applyLegalDrops(move: HexagonalConnectionDrops, state: HexagonalConnectionState): HexagonalConnectionState {
        const player: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        const first: Coord = move.getFirst();
        const second: Coord = move.getSecond();
        const newBoard: FourStatePiece[][] = state.getCopiedBoard();
        newBoard[first.y][first.x] = player;
        newBoard[second.y][second.x] = player;
        return new HexagonalConnectionState(newBoard, state.turn + 1);
    }

    private applyLegalFirstMove(move: HexagonalConnectionFirstMove, state: HexagonalConnectionState)
    : HexagonalConnectionState
    {
        const player: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        const newBoard: FourStatePiece[][] = state.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x] = player;
        return new HexagonalConnectionState(newBoard, state.turn + 1);
    }

    public override isLegal(move: HexagonalConnectionMove, state: HexagonalConnectionState): MGPValidation {
        if (move instanceof HexagonalConnectionFirstMove) {
            Utils.assert(state.turn === 0, 'HexagonalConnectionFirstMove should only be used at first move');
            if (state.isOnBoard(move.coord) === false) {
                return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(move.coord));
            }
            return MGPValidation.SUCCESS;
        } else {
            Utils.assert(state.turn > 0, 'HexagonalConnectionDrops should only be used after first move');
            if (state.isOnBoard(move.getFirst()) === false) {
                return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(move.getFirst()));
            } else if (state.isOnBoard(move.getSecond()) === false) {
                return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(move.getSecond()));
            } else {
                return this.isLegalDrops(move, state);
            }
        }
    }

    public isLegalDrops(move: HexagonalConnectionDrops, state: HexagonalConnectionState): MGPValidation {
        if (state.getPieceAt(move.getFirst()).isPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        } else if (state.getPieceAt(move.getSecond()).isPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        } else {
            return MGPValidation.SUCCESS;
        }
    }

    public getGameStatus(node: HexagonalConnectionNode): GameStatus {
        const state: HexagonalConnectionState = node.gameState;
        const victoriousCoord: Coord[] = HexagonalConnectionRules.HEXAGONAL_CONNECTION_HELPER.getVictoriousCoord(state);
        if (victoriousCoord.length > 0) {
            return GameStatus.getVictory(state.getCurrentOpponent());
        }
        return state.turn === 181 ? GameStatus.DRAW : GameStatus.ONGOING;
    }

}
