import { Rules } from 'src/app/jscaip/Rules';
import { ConnectSixState } from './ConnectSixState';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ConnectSixDrops, ConnectSixFirstMove, ConnectSixMove } from './ConnectSixMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { Utils } from 'src/app/utils/utils';
import { GameStatus } from 'src/app/jscaip/GameStatus';

export class ConnectSixNode extends MGPNode<ConnectSixRules, ConnectSixMove, ConnectSixState> {}

export class ConnectSixRules extends Rules<ConnectSixMove, ConnectSixState> {

    private static singleton: MGPOptional<ConnectSixRules> = MGPOptional.empty();

    public static get(): ConnectSixRules {
        if (ConnectSixRules.singleton.isAbsent()) {
            ConnectSixRules.singleton = MGPOptional.of(new ConnectSixRules());
        }
        return ConnectSixRules.singleton.get();
    }
    public static readonly CONNECT_SIX_HELPER: NInARowHelper<PlayerOrNone> =
        new NInARowHelper(ConnectSixState.isOnBoard, Utils.identity, 6);

    public static getVictoriousCoords(state: ConnectSixState): Coord[] {
        return ConnectSixRules.CONNECT_SIX_HELPER.getVictoriousCoord(state);
    }
    private constructor() {
        super(ConnectSixState);
    }
    public applyLegalMove(move: ConnectSixMove, state: ConnectSixState, _info: void): ConnectSixState {
        if (move instanceof ConnectSixDrops) {
            return this.applyLegalDrops(move, state);
        } else {
            return this.applyLegalFirstMove(move, state);
        }
    }
    private applyLegalDrops(move: ConnectSixDrops, state: ConnectSixState): ConnectSixState {
        const player: Player = state.getCurrentPlayer();
        const first: Coord = move.getFirst();
        const second: Coord = move.getSecond();
        const newBoard: PlayerOrNone[][] = state.getCopiedBoard();
        newBoard[first.y][first.x] = player;
        newBoard[second.y][second.x] = player;
        return new ConnectSixState(newBoard, state.turn + 1);
    }
    private applyLegalFirstMove(move: ConnectSixFirstMove, state: ConnectSixState): ConnectSixState {
        const player: Player = state.getCurrentPlayer();
        const newBoard: PlayerOrNone[][] = state.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x] = player;
        return new ConnectSixState(newBoard, state.turn + 1);
    }
    public isLegal(move: ConnectSixMove, state: ConnectSixState): MGPValidation {
        if (state.turn === 0) {
            Utils.assert(move instanceof ConnectSixFirstMove, 'First move should be instance of ConnectSixFirstMove');
            return MGPValidation.SUCCESS;
        } else {
            Utils.assert(move instanceof ConnectSixDrops, 'non-firsts moves should be instance of ConnectSixDrops');
            return this.isLegalDrops(move as ConnectSixDrops, state);
        }
    }
    public isLegalDrops(move: ConnectSixDrops, state: ConnectSixState): MGPValidation {
        if (state.getPieceAt(move.getFirst()).isPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        } else if (state.getPieceAt(move.getSecond()).isPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        } else {
            return MGPValidation.SUCCESS;
        }
    }
    public getGameStatus(node: ConnectSixNode): GameStatus {
        const state: ConnectSixState = node.gameState;
        const victoriousCoord: Coord[] = ConnectSixRules.CONNECT_SIX_HELPER.getVictoriousCoord(state);
        if (victoriousCoord.length > 0) {
            return GameStatus.getVictory(state.getCurrentOpponent());
        }
        return state.turn === 181 ? GameStatus.DRAW : GameStatus.ONGOING;
    }
}
