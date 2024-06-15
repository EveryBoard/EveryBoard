import { ConfigurableRules } from 'src/app/jscaip/Rules';
import { HexagonalConnectionState } from './HexagonalConnectionState';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { MGPValidation, MGPOptional, Utils } from '@everyboard/lib';
import { HexagonalConnectionMove } from './HexagonalConnectionMove';
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

    numberOfDrops: number;

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
                size: new NumberConfig(1, () => $localize`Size`, MGPValidators.range(1, 99)),
                alignmentNeeded: new NumberConfig(6, () => $localize`Alignement Needed TODO UNIFORMISE`, MGPValidators.range(1, 99)),
                numberOfDrops: new NumberConfig(2, () => $localize`Number of drops`, MGPValidators.range(1, 99)),
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
        const player: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        const newBoard: FourStatePiece[][] = state.getCopiedBoard();
        for (const coord of move.coords) {
            newBoard[coord.y][coord.x] = player;
        }
        return new HexagonalConnectionState(newBoard, state.turn + 1);
    }

    public override isLegal(move: HexagonalConnectionMove,
                            state: HexagonalConnectionState,
                            config: MGPOptional<HexagonalConnectionConfig>)
    : MGPValidation
    {
        const configuration: HexagonalConnectionConfig = config.get();
        const numberOfDrop: number = move.coords.size();
        if (state.turn === 0) {
            Utils.assert(numberOfDrop === 1, 'HexagonalConnectionMove should only drop one piece at first turn');
        } else {
            Utils.assert(numberOfDrop === configuration.numberOfDrops,
                         'HexagonalConnectionMove should have exactly ' + configuration.numberOfDrops+ ' drops (got ' + numberOfDrop + ')');
        }
        return this.isLegalDrops(move, state);
    }

    public isLegalDrops(move: HexagonalConnectionMove, state: HexagonalConnectionState): MGPValidation {
        for (const coord of move.coords) {
            if (state.isOnBoard(coord) === false) {
                return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(coord));
            }
            if (state.getPieceAt(coord).isPlayer()) {
                return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
            }
        }
        return MGPValidation.SUCCESS;
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
