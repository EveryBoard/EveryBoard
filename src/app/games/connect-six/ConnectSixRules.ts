import { Rules } from 'src/app/jscaip/Rules';
import { ConnectSixState } from './ConnectSixState';
import { GameNode } from 'src/app/jscaip/GameNode';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ConnectSixDrops, ConnectSixFirstMove, ConnectSixMove } from './ConnectSixMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { Utils } from 'src/app/utils/utils';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { GobanConfig } from 'src/app/jscaip/GobanConfig';
import { RulesConfigDescription, RulesConfigDescriptions } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

export class ConnectSixNode extends GameNode<ConnectSixMove, ConnectSixState, GobanConfig> {}

export class ConnectSixRules extends Rules<ConnectSixMove, ConnectSixState, GobanConfig> {

    private static singleton: MGPOptional<ConnectSixRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<GobanConfig> =
        RulesConfigDescriptions.GOBAN;

    public static get(): ConnectSixRules {
        if (ConnectSixRules.singleton.isAbsent()) {
            ConnectSixRules.singleton = MGPOptional.of(new ConnectSixRules());
        }
        return ConnectSixRules.singleton.get();
    }

    public static readonly CONNECT_SIX_HELPER: NInARowHelper<PlayerOrNone> =
        new NInARowHelper(Utils.identity, 6);

    public static getVictoriousCoords(state: ConnectSixState): Coord[] {
        return ConnectSixRules.CONNECT_SIX_HELPER.getVictoriousCoord(state);
    }

    private constructor() {
        super(ConnectSixState);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<GobanConfig> {
        return ConnectSixRules.RULES_CONFIG_DESCRIPTION;
    }

    public applyLegalMove(move: ConnectSixMove, state: ConnectSixState, _config: RulesConfig, _info: void)
    : ConnectSixState
    {
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
            const firstMove: ConnectSixFirstMove = move as ConnectSixFirstMove;
            if (state.isOnBoard(firstMove.coord) === false) {
                return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(firstMove.coord));
            }
            return MGPValidation.SUCCESS;
        } else {
            Utils.assert(move instanceof ConnectSixDrops, 'non-firsts moves should be instance of ConnectSixDrops');
            const nextMove: ConnectSixDrops = move as ConnectSixDrops;
            if (state.isOnBoard(nextMove.getFirst()) === false) {
                return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(nextMove.getFirst()));
            } else if (state.isOnBoard(nextMove.getSecond()) === false) {
                return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(nextMove.getSecond()));
            } else {
                return this.isLegalDrops(move as ConnectSixDrops, state);
            }
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
