import { MGPOptional, MGPValidation } from '@everyboard/lib';

import { NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from '../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { GameNode } from '../../jscaip/AI/GameNode';
import { Coord } from '../../jscaip/Coord';
import { GameStatus } from '../../jscaip/GameStatus';
import { Ordinal } from '../../jscaip/Ordinal';
import { Player, PlayerOrNone } from '../../jscaip/Player';
import { ConfigurableRules } from '../../jscaip/Rules';
import { RulesConfig } from '../../jscaip/RulesConfigUtil';
import { RulesFailure } from '../../jscaip/RulesFailure';
import { TableUtils } from '../../jscaip/TableUtils';
import { MGPValidators } from '../../utils/MGPValidator';

import { SquarzFailure } from './SquarzFailure';
import { SquarzMove } from './SquarzMove';
import { SquarzState } from './SquarzState';

export class SquarzNode extends GameNode<SquarzMove, SquarzState> {}

export type SquarzConfig = RulesConfig & {

    width: number;

    height: number;

    jumpSize: number;

};

export class SquarzRules extends ConfigurableRules<SquarzMove, SquarzState, SquarzConfig> {

    private static singleton: MGPOptional<SquarzRules> = MGPOptional.empty();

    public static get(): SquarzRules {
        if (SquarzRules.singleton.isAbsent()) {
            SquarzRules.singleton = MGPOptional.of(new SquarzRules());
        }
        return SquarzRules.singleton.get();
    }

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<SquarzConfig> =
        new RulesConfigDescription<SquarzConfig>({
            name: (): string => $localize`Squarz`,
            config: {
                width: new NumberConfig(8, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(3, 99)),
                height: new NumberConfig(8, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(3, 99)),
                jumpSize: new NumberConfig(2, () => $localize`Jump Size`, MGPValidators.range(2, 99)),
            },
        });

    public override getRulesConfigDescription(): RulesConfigDescription<SquarzConfig> {
        return SquarzRules.RULES_CONFIG_DESCRIPTION;
    }

    public override getInitialState(config: SquarzConfig): SquarzState {
        const width: number = config.width;
        const height: number = config.height;
        const board: PlayerOrNone[][] = TableUtils.create(width, height, PlayerOrNone.NONE);
        board[0][0] = Player.ZERO;
        board[height - 1][width - 1] = Player.ZERO;
        board[height - 1][0] = Player.ONE;
        board[0][width - 1] = Player.ONE;
        return new SquarzState(board, 0);
    }

    public override isLegal(move: SquarzMove, state: SquarzState, config: SquarzConfig)
    : MGPValidation
    {
        const distance: number = move.getDistance();
        const jumpSize: number = config.jumpSize;
        if (jumpSize < distance) {
            return MGPValidation.failure(SquarzFailure.MAX_DISTANCE_IS_N(jumpSize));
        }
        const start: PlayerOrNone = state.getPieceAt(move.getStart());
        const opponent: Player = state.getCurrentOpponent();
        if (start === opponent) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        if (start.isNone()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        const landing: PlayerOrNone = state.getPieceAt(move.getEnd());
        if (landing.isNone()) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
    }

    public override applyLegalMove(move: SquarzMove, state: SquarzState): SquarzState {
        const start: Coord = move.getStart();
        const end: Coord = move.getEnd();
        const moveDistance: number = start.getDistanceToward(end);
        const player: Player = state.getCurrentPlayer();
        const opponent: Player = state.getCurrentOpponent();
        let resultingState: SquarzState = state.setPieceAt(end, player);
        if (moveDistance > 1) {
            resultingState = resultingState.setPieceAt(start, PlayerOrNone.NONE);
        }
        for (const direction of Ordinal.ORDINALS) {
            const neighbor: Coord = end.getNext(direction, 1);
            if (resultingState.hasPieceAt(neighbor, opponent)) {
                resultingState = resultingState.setPieceAt(neighbor, player);
            }
        }
        return new SquarzState(resultingState.board, resultingState.turn + 1);
    }

    public override getGameStatus(node: SquarzNode, config: SquarzConfig): GameStatus {
        const jumpSize: number = config.jumpSize;
        const state: SquarzState = node.gameState;
        const currentPlayer: Player = state.getCurrentPlayer();
        if (this.canPlayerMove(state, currentPlayer, jumpSize)) {
            return GameStatus.ONGOING;
        } else {
            return this.getDominantPlayerVictory(state);
        }
    }

    private canPlayerMove(state: SquarzState, player: Player, jumpSize: number): boolean {
        for (const coordAndContent of state.getCoordsAndContents()) {
            if (coordAndContent.content.equals(player)) {
                if (state.hasMovablePieceAt(coordAndContent.coord, jumpSize)) {
                    return true;
                }
            }
        }
        return false;
    }

    public getPossiblesMoves(state: SquarzState, coord: Coord, config: SquarzConfig)
    : SquarzMove[]
    {
        const moves: SquarzMove[] = [];
        const jumpSize: number = config.jumpSize;
        for (let y: number = -jumpSize; y <= jumpSize; y++) {
            for (let x: number = -jumpSize; x <= jumpSize; x++) {
                const landingCoord: Coord = new Coord(coord.x + x, coord.y + y);
                if (state.isEmptyAt(landingCoord)) {
                    moves.push(SquarzMove.from(coord, landingCoord).get());
                }
            }
        }
        return moves;
    }

    private getDominantPlayerVictory(state: SquarzState): GameStatus {
        const winner: PlayerOrNone = state.getDominantPlayer();
        if (winner.isPlayer()) {
            return GameStatus.getVictory(winner);
        } else {
            return GameStatus.DRAW;
        }
    }

}
