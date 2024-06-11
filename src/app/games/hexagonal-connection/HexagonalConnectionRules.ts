import { ConfigurableRules } from 'src/app/jscaip/Rules';
import { HexagonalConnectionState } from './HexagonalConnectionState';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { MGPValidation, MGPOptional, Utils } from '@everyboard/lib';
import { HexagonalConnectionDrops, HexagonalConnectionFirstMove, HexagonalConnectionMove } from './HexagonalConnectionMove';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { TableUtils } from 'src/app/jscaip/TableUtils';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { NumberConfig, RulesConfigDescription } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from 'src/app/utils/MGPValidator';

export type HexagonalConnectionConfig = {

    size: number;

    alignmentNeeded: number;

};

export class HexagonalConnectionNode extends GameNode<HexagonalConnectionMove, HexagonalConnectionState> {}

export class HexagonalConnectionRules extends ConfigurableRules<HexagonalConnectionMove,
                                                                HexagonalConnectionState,
                                                                HexagonalConnectionConfig>
{
    private static singleton: MGPOptional<HexagonalConnectionRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<HexagonalConnectionConfig> =
        new RulesConfigDescription<HexagonalConnectionConfig>({
            name: (): string => $localize`Hexagonal Connection`,
            config: {
                size: new NumberConfig(6, () => $localize`Size`, MGPValidators.range(1, 99)),
                alignmentNeeded: new NumberConfig(6, () => $localize`Alignement Needed TODO UNIFORMISE`, MGPValidators.range(1, 99)),
            },
        });

    public static get(): HexagonalConnectionRules {
        if (HexagonalConnectionRules.singleton.isAbsent()) {
            HexagonalConnectionRules.singleton = MGPOptional.of(new HexagonalConnectionRules());
        }
        return HexagonalConnectionRules.singleton.get();
    }

    public static getHexagonalConnectionHelper(config: MGPOptional<HexagonalConnectionConfig>)
    : NInARowHelper<FourStatePiece>
    {
        if (config.isPresent()) {
            return new NInARowHelper(
                (piece: FourStatePiece) => piece.getPlayer(),
                config.get().alignmentNeeded,
            );
        } else {
            const defaultConfig: HexagonalConnectionConfig =
                HexagonalConnectionRules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;
            return new NInARowHelper(
                (piece: FourStatePiece) => piece.getPlayer(),
                defaultConfig.alignmentNeeded,
            );
        }
    }

    public static getVictoriousCoords(state: HexagonalConnectionState, config: MGPOptional<HexagonalConnectionConfig>)
    : Coord[]
    {
        return HexagonalConnectionRules.getHexagonalConnectionHelper(config).getVictoriousCoord(state);
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<HexagonalConnectionConfig>> {
        return MGPOptional.of(HexagonalConnectionRules.RULES_CONFIG_DESCRIPTION);
    }

    public override getInitialState(config: MGPOptional<HexagonalConnectionConfig>): HexagonalConnectionState {
        const size: number = config.get().size;
        const boardSize: number = 1 + (size * 2);
        const board: FourStatePiece[][] = TableUtils.create(boardSize, boardSize, FourStatePiece.EMPTY);
        for (let x: number = 0; x < boardSize; x++) {
            for (let y: number = 0; y < boardSize; y++) {
                if ((x + y) < size) {
                    board[y][x] = FourStatePiece.UNREACHABLE;
                    board[boardSize - y - 1][boardSize - x - 1] = FourStatePiece.UNREACHABLE;
                }
            }
        }
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

    public override getGameStatus(node: HexagonalConnectionNode, config: MGPOptional<HexagonalConnectionConfig>)
    : GameStatus
    {
        const state: HexagonalConnectionState = node.gameState;
        const victoriousCoord: Coord[] = HexagonalConnectionRules
            .getHexagonalConnectionHelper(config)
            .getVictoriousCoord(state);
        if (victoriousCoord.length > 0) {
            return GameStatus.getVictory(state.getCurrentOpponent());
        }
        return state.turn === 181 ? GameStatus.DRAW : GameStatus.ONGOING;
    }

}
