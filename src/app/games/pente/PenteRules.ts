import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { GameNode } from 'src/app/jscaip/GameNode';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ConfigurableRules } from 'src/app/jscaip/Rules';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Utils } from 'src/app/utils/utils';
import { PenteMove } from './PenteMove';
import { PenteState } from './PenteState';
import { GobanConfig } from 'src/app/jscaip/GobanConfig';
import { RulesConfigDescription, RulesConfigDescriptions } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { TableUtils } from 'src/app/utils/ArrayUtils';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';

export class PenteNode extends GameNode<PenteMove, PenteState> {}

export class PenteRules extends ConfigurableRules<PenteMove, PenteState, GobanConfig> {

    public static readonly PENTE_HELPER: NInARowHelper<PlayerOrNone> =
        new NInARowHelper(Utils.identity, 5);

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<GobanConfig> =
        RulesConfigDescriptions.GOBAN;

    private static singleton: MGPOptional<PenteRules> = MGPOptional.empty();

    public static get(): PenteRules {
        if (PenteRules.singleton.isAbsent()) {
            PenteRules.singleton = MGPOptional.of(new PenteRules());
        }
        return PenteRules.singleton.get();
    }

    public override getInitialState(optionalConfig: MGPOptional<GobanConfig>): PenteState {
        const config: GobanConfig = optionalConfig.get();
        const board: PlayerOrNone[][] = TableUtils.create(config.width,
                                                          config.height,
                                                          PlayerOrNone.NONE);
        const cx: number = Math.floor(config.width / 2);
        const cy: number = Math.floor(config.height / 2);
        board[cy][cx] = PlayerOrNone.ONE;
        return new PenteState(board, PlayerMap.of(0, 0), 0);
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<GobanConfig>> {
        return MGPOptional.of(PenteRules.RULES_CONFIG_DESCRIPTION);
    }

    public override isLegal(move: PenteMove, state: PenteState): MGPValidation {
        if (state.isOnBoard(move.coord) === false) {
            return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(move.coord));
        } else if (state.getPieceAt(move.coord).isPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        } else {
            return MGPValidation.SUCCESS;
        }
    }

    public override applyLegalMove(move: PenteMove, state: PenteState, _config: MGPOptional<GobanConfig>, _info: void)
    : PenteState
    {
        const player: Player = state.getCurrentPlayer();
        const newBoard: PlayerOrNone[][] = state.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x]= player;
        const capturedPieces: Coord[] = this.getCaptures(move.coord, state, player);
        for (const captured of capturedPieces) {
            newBoard[captured.y][captured.x] = PlayerOrNone.NONE;
        }
        const captures: PlayerMap<number> = state.captures.getCopy();
        captures[player.getValue()] += capturedPieces.length;
        return new PenteState(newBoard, captures, state.turn+1);
    }

    public getCaptures(coord: Coord, state: PenteState, player: Player): Coord[] {
        const opponent: Player = player.getOpponent();
        const captures: Coord[] = [];
        for (const direction of Direction.factory.all) {
            const firstCapture: Coord = coord.getNext(direction, 1);
            const secondCapture: Coord = coord.getNext(direction, 2);
            const sandwicher: Coord = coord.getNext(direction, 3);
            if (state.isOnBoard(firstCapture) && state.getPieceAt(firstCapture) === opponent &&
                state.isOnBoard(secondCapture) && state.getPieceAt(secondCapture) === opponent &&
                state.isOnBoard(sandwicher) && state.getPieceAt(sandwicher) === player)
            {
                captures.push(firstCapture);
                captures.push(secondCapture);
            }
        }
        return captures;
    }

    public getGameStatus(node: PenteNode): GameStatus {
        const state: PenteState = node.gameState;
        const opponent: Player = state.getCurrentOpponent();
        if (10 <= state.captures[opponent.getValue()]) {
            return GameStatus.getVictory(opponent);
        }
        const victoriousCoord: Coord[] = PenteRules.PENTE_HELPER.getVictoriousCoord(state);
        if (victoriousCoord.length > 0) {
            return GameStatus.getVictory(opponent);
        }
        if (this.stillHaveEmptySquare(state)) {
            return GameStatus.ONGOING;
        } else {
            return GameStatus.DRAW;
        }
    }

    private stillHaveEmptySquare(state: PenteState): boolean {
        const width: number = state.getWidth();
        const height: number = state.getHeight();
        for (let y: number = 0; y < height; y++) {
            for (let x: number = 0; x < width; x++) {
                if (state.board[y][x] === PlayerOrNone.NONE) {
                    return true;
                }
            }
        }
        return false;
    }

}
