import { MGPFallible, MGPMap, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { EnumConfig } from '../../config/EnumConfig';
import { NumberConfig } from '../../config/NumberConfig';
import { RulesConfigDescription } from '../../config/RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from '../../config/RulesConfigDescriptionLocalizable';
import { GameNode } from '../../jscaip/AI/GameNode';
import { Coord, CoordFailure } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { GameStatus } from '../../jscaip/GameStatus';
import { ConfigurableRules } from '../../jscaip/Rules';
import { RulesFailure } from '../../jscaip/RulesFailure';
import { TableUtils } from '../../jscaip/TableUtils';
import { TopologicNInARowHelper } from '../../jscaip/TopologicNInARowHelper';
import { Direction } from '../../jscaip/direction/Direction';
import { HexagonalShape } from '../../jscaip/shape/HexagonalShape';
import { RectangularShape } from '../../jscaip/shape/RectangularShape';
import { TopologicShape } from '../../jscaip/shape/TopologicShape';
import { TorusShape } from '../../jscaip/shape/TorusShape';
import { TriangularShape } from '../../jscaip/shape/TriangularShape';
import { GameStateWithTable } from '../../jscaip/state/GameStateWithTable';
import { TopologicGameState } from '../../jscaip/state/TopologicGameState';
import { TopologicGameStateWithTable } from '../../jscaip/state/TopologicGameStateWithTable';
import { Topology } from '../../jscaip/topology/Topology';
import { TopologyID, TopologyMapper } from '../../jscaip/topology/TopologyMapper';
import { Localized } from '../../utils/LocaleUtils';
import { MGPValidators } from '../../utils/MGPValidator';

import { ConnectSixFailure } from './ConnectSixFailure';
import { ConnectSixMove } from './ConnectSixMove';

export class ConnectSixNode extends GameNode<ConnectSixMove, TopologicGameState<FourStatePiece, Direction>> {}

export const TopologyNames: Record<TopologyID, Localized> = {
    'SQUARE (4)': () => $localize`Square (4)`,
    'SQUARE (8)': () => $localize`Square (8)`,
    'HEXAGONAL': () => $localize`Hexagonal`,
    'TRIANGULAR': () => $localize`Triangular`,
};

export type ShapeID = 'SQUARE' | 'HEXAGONAL' | 'TRIANGULAR' | 'TORIC';

export const Shapes: Record<ShapeID, Localized> = {
    'SQUARE': () => $localize`Square`,
    'HEXAGONAL': () => $localize`Hexagonal`,
    'TRIANGULAR': () => $localize`Triangular`,
    'TORIC': () => $localize`Toric`,
};

export type ConnectSixConfig = {

    n: number;

    dropAfterFirstTurn: number;

    topology: TopologyID;

    shape: ShapeID;

    boardSize: number;

}

type HelperMap = MGPMap<ConnectSixConfig, TopologicNInARowHelper<FourStatePiece, Direction>>;

export class ConnectSixRules extends ConfigurableRules<ConnectSixMove,
                                                     TopologicGameState<FourStatePiece, Direction>,
                                                     ConnectSixConfig>
{
    private static singleton: MGPOptional<ConnectSixRules> = MGPOptional.empty();

    private static readonly helpers: HelperMap = new MGPMap();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<ConnectSixConfig> =
        new RulesConfigDescription<ConnectSixConfig>({
            name: (): string => $localize`Default`,
            config: {
                n: new NumberConfig(6, () => $localize`N`, MGPValidators.range(3, 10)),
                dropAfterFirstTurn: new NumberConfig(2, () => $localize`Drop after first turn`, MGPValidators.range(2, 10)),
                boardSize: new NumberConfig(19, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 100)),
                topology: new EnumConfig('SQUARE (8)', () => $localize`Space shape`, TopologyNames),
                shape: new EnumConfig('SQUARE', () => $localize`Board shape`, Shapes),
            },
            validators: [
                ConnectSixRules.toricTriangleConfigMustOnlyBeEven,
            ],
        });

    private static toricTriangleConfigMustOnlyBeEven(config: ConnectSixConfig): MGPValidation {
        if (config.shape === 'TORIC' &&
            config.topology === 'TRIANGULAR' &&
            config.boardSize % 2 !== 0
        ) {
            return MGPValidation.failure($localize`Toric board with triangle space should have even width`);
        }
        return MGPValidation.SUCCESS;
    }

    public static get(): ConnectSixRules {
        if (ConnectSixRules.singleton.isAbsent()) {
            ConnectSixRules.singleton = MGPOptional.of(new ConnectSixRules());
        }
        return ConnectSixRules.singleton.get();
    }

    public static getHelper(config: ConnectSixConfig): TopologicNInARowHelper<FourStatePiece, Direction> {
        if (ConnectSixRules.helpers.get(config).isAbsent()) {
            const topology: Topology<Direction> = ConnectSixRules.getTopology(config);
            const shape: TopologicShape<Direction> = ConnectSixRules.getShape(config, topology);
            const helper: TopologicNInARowHelper<FourStatePiece, Direction> =
                new TopologicNInARowHelper<FourStatePiece, Direction>(
                    (piece: FourStatePiece) => piece.getPlayer(),
                    config.n,
                    shape,
                );
            ConnectSixRules.helpers.put(config, helper);
        }
        return ConnectSixRules.helpers.get(config).get();
    }

    private static getTopology(config: ConnectSixConfig): Topology<Direction> {
        return TopologyMapper.topologyMap.get(config.topology).get();
    }

    private static getShape(config: ConnectSixConfig, topology: Topology<Direction>): TopologicShape<Direction> {
        switch (config.shape) {
            case 'SQUARE':
                return new RectangularShape(config.boardSize, config.boardSize, topology);
            case 'HEXAGONAL':
                return new HexagonalShape(config.boardSize, topology);
            case 'TORIC':
                return new TorusShape(config.boardSize, config.boardSize, topology);
            default:
                Utils.expectToBe(config.shape, 'TRIANGULAR');
                return new TriangularShape(config.boardSize, topology);
        }
    }

    public static getVictoriousCoords(
        state: TopologicGameState<FourStatePiece, Direction>,
        config: ConnectSixConfig,
    ): Coord[] {
        return new TopologicNInARowHelper(
            (piece: FourStatePiece) => {
                return piece.getPlayer();
            },
            config.n,
            state.getShape(),
        ).getVictoriousCoord(state);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<ConnectSixConfig> {
        return ConnectSixRules.RULES_CONFIG_DESCRIPTION;
    }

    public override applyLegalMove(move: ConnectSixMove,
                                   state: TopologicGameState<FourStatePiece, Direction>,
    ): TopologicGameState<FourStatePiece, Direction> {
        const player: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        let resultingState: TopologicGameState<FourStatePiece, Direction> = state;
        for (const coord of move.coords) {
            resultingState = resultingState.withPieceAt(coord, player);
        }
        return resultingState.incrementTurn();
    }

    public override isLegal(move: ConnectSixMove,
                            state: TopologicGameState<FourStatePiece, Direction>,
                            config: ConnectSixConfig,
    ): MGPFallible<void> {
        // TODO: check move with exactly zero move, they will work but should not !
        if (state.turn === 0 && move.coords.size() > 1) {
            return MGPFallible.failure(ConnectSixFailure.YOU_MUST_DROP_ONE_AT_FIRST_TURN());
        }
        const remainingDrops: number = this.countRemainingDrops(state);
        const expectedDroppedPiece: number = Math.min(remainingDrops, config.dropAfterFirstTurn);
        if (state.turn > 0 && move.coords.size() !== expectedDroppedPiece) {
            return MGPFallible.failure(ConnectSixFailure.YOU_MUST_PLAY_EXACTLY_N_PIECES(expectedDroppedPiece));
        }
        for (const coord of move.coords) {
            if (state.isNotOnBoard(coord)) {
                return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(coord));
            }
            if (state.getPieceAt(coord).isPlayer()) {
                return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
            }
        }
        return MGPValidation.SUCCESS;
    }

    private countRemainingDrops(state: TopologicGameState<FourStatePiece, Direction>): number {
        return state.getCoordsAndContents()
            .filter((coordAndContent: { coord: Coord; content: FourStatePiece }) => {
                return coordAndContent.content.equals(FourStatePiece.EMPTY);
            }).length;
    }

    public override getInitialState(config: ConnectSixConfig): TopologicGameState<FourStatePiece, Direction> {
        const topology: Topology<Direction> = ConnectSixRules.getTopology(config);
        const shape: TopologicShape<Direction> = ConnectSixRules.getShape(config, topology);
        let maxX: number = 0;
        let maxY: number = 0;
        for (const coord of shape.getAllCoords()) {
            maxX = Math.max(maxX, coord.x);
            maxY = Math.max(maxY, coord.y);
        }
        const board: FourStatePiece[][] =
            TableUtils.create(maxX + 1, maxY + 1, FourStatePiece.UNREACHABLE);
        for (const coord of shape.getAllCoords()) {
            board[coord.y][coord.x] = FourStatePiece.EMPTY;
        }
        const gameStateWithTable: GameStateWithTable<FourStatePiece> =
            new GameStateWithTable(board, 0);
        return new TopologicGameStateWithTable(topology, shape, gameStateWithTable);
    }

    public override getGameStatus(
        node: GameNode<ConnectSixMove, TopologicGameState<FourStatePiece, Direction>>,
        config: ConnectSixConfig,
    ): GameStatus {
        const state: TopologicGameState<FourStatePiece, Direction> = node.gameState;
        const victoriousCoord: Coord[] = ConnectSixRules.getVictoriousCoords(state, config);
        if (victoriousCoord.length > 0) {
            return GameStatus.getVictory(state.getCurrentOpponent());
        }
        if (this.isBoardFull(state)) {
            return GameStatus.DRAW;
        } else {
            return GameStatus.ONGOING;
        }
    }

    private isBoardFull(state: TopologicGameState<FourStatePiece, Direction>): boolean {
        return state
            .getAllCoords()
            .filter((coord: Coord) => {
                return state.getPieceAt(coord).isPlayer() === false;
            }).length === 0;
    }

}
