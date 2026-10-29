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
import { HexagonShape } from '../../jscaip/shape/HexagonShape';
import { RectangleShape } from '../../jscaip/shape/RectangleShape';
import { TopologicShape } from '../../jscaip/shape/TopologicShape';
import { TorusShape } from '../../jscaip/shape/TorusShape';
import { TriangleShape } from '../../jscaip/shape/TriangleShape';
import { SimpleGameStateWithTable } from '../../jscaip/state/SimpleGameStateWithTable';
import { TopologicGameState } from '../../jscaip/state/TopologicGameState';
import { TopologicGameStateWithTable } from '../../jscaip/state/TopologicGameStateWithTable';
import { Topology } from '../../jscaip/topology/Topology';
import { TopologyID, topologyMap } from '../../jscaip/topology/topologyMap';
import { Localized } from '../../utils/LocaleUtils';
import { MGPValidators } from '../../utils/MGPValidator';

import { ConnectNFailure } from './ConnectNFailure';
import { ConnectNMove } from './ConnectNMove';

export class ConnectNNode extends GameNode<ConnectNMove, TopologicGameState<FourStatePiece, Direction>> {}

export const ConnectNTopologyNames: Record<TopologyID, Localized> = {
    'SQUARE (4)': () => $localize`Square (4)`,
    'SQUARE (8)': () => $localize`Square (8)`,
    'HEXAGON': () => $localize`Hexagon`,
    'TRIANGLE': () => $localize`Triangle`,
};

export type ConnectNShapeEnum = 'SQUARE' | 'HEXAGON' | 'TRIANGLE' | 'TORUS';

export const ConnectNShapes: Record<ConnectNShapeEnum, Localized> = {
    'SQUARE': () => $localize`Square`,
    'HEXAGON': () => $localize`Hexagon`,
    'TRIANGLE': () => $localize`Triangle`,
    'TORUS': () => $localize`Torus`,
};

export type ConnectNConfig = {

    n: number;

    dropAfterFirstTurn: number;

    topology: TopologyID;

    shape: ConnectNShapeEnum;

    boardSize: number;

}

type HelperMapKey = {
    n: number;
    topology: TopologyID;
};

type HelperMap = MGPMap<HelperMapKey, TopologicNInARowHelper<FourStatePiece, Direction>>;

export class ConnectNRules extends ConfigurableRules<ConnectNMove,
                                                     TopologicGameState<FourStatePiece, Direction>,
                                                     ConnectNConfig>
{
    private static singleton: MGPOptional<ConnectNRules> = MGPOptional.empty();

    private static readonly helpers: HelperMap = new MGPMap();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<ConnectNConfig> =
        new RulesConfigDescription<ConnectNConfig>({
            name: (): string => $localize`Default`,
            config: {
                n: new NumberConfig(6, () => $localize`N`, MGPValidators.range(3, 10)),
                dropAfterFirstTurn: new NumberConfig(2, () => $localize`Drop after first turn`, MGPValidators.range(2, 10)),
                boardSize: new NumberConfig(19, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 100)),
                topology: new EnumConfig('SQUARE (8)', () => $localize`Space shape`, ConnectNTopologyNames),
                shape: new EnumConfig('SQUARE', () => $localize`Board shape`, ConnectNShapes),
            },
            validators: [
                ConnectNRules.toricTriangleConfigMustOnlyBeEven,
            ],
        });

    private static toricTriangleConfigMustOnlyBeEven(config: ConnectNConfig): MGPValidation {
        if (config.shape === 'TORUS' &&
            config.topology === 'TRIANGLE' &&
            config.boardSize % 2 !== 0
        ) {
            return MGPValidation.failure($localize`Toric board with triangle space should have even width`);
        }
        return MGPValidation.SUCCESS;
    }

    public static get(): ConnectNRules {
        if (ConnectNRules.singleton.isAbsent()) {
            ConnectNRules.singleton = MGPOptional.of(new ConnectNRules());
        }
        return ConnectNRules.singleton.get();
    }

    public static getHelper(config: ConnectNConfig): TopologicNInARowHelper<FourStatePiece, Direction> {
        const key: HelperMapKey = { n: config.n, topology: config.topology };
        if (ConnectNRules.helpers.get(key).isAbsent()) {
            const topology: Topology<Direction> = ConnectNRules.getTopology(config);
            const shape: TopologicShape<Direction> = ConnectNRules.getShape(config, topology);
            const helper: TopologicNInARowHelper<FourStatePiece, Direction> =
                new TopologicNInARowHelper<FourStatePiece, Direction>(
                    (piece: FourStatePiece) => piece.getPlayer(),
                    config.n,
                    shape,
                );
            ConnectNRules.helpers.put(key, helper);
        }
        return ConnectNRules.helpers.get(key).get();
    }

    private static getTopology(config: ConnectNConfig): Topology<Direction> {
        return topologyMap.get(config.topology).get();
    }

    private static getShape(config: ConnectNConfig, topology: Topology<Direction>): TopologicShape<Direction> {
        switch (config.shape) {
            case 'SQUARE': {
                return new RectangleShape(config.boardSize, config.boardSize, topology);
            } case 'HEXAGON': {
                return new HexagonShape(config.boardSize, topology);
            } case 'TORUS': {
                return new TorusShape(config.boardSize, config.boardSize, topology);
            } default: {
                Utils.expectToBe(config.shape, 'TRIANGLE');
                return new TriangleShape(config.boardSize, topology);
            }
        }
    }

    public static getVictoriousCoords(
        state: TopologicGameState<FourStatePiece, Direction>,
        config: ConnectNConfig,
    ): Coord[] {
        return new TopologicNInARowHelper(
            (piece: FourStatePiece) => {
                return piece.getPlayer();
            },
            config.n,
            state.getShape(),
        ).getVictoriousCoord(state);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<ConnectNConfig> {
        return ConnectNRules.RULES_CONFIG_DESCRIPTION;
    }

    public override applyLegalMove(move: ConnectNMove,
                                   state: TopologicGameState<FourStatePiece, Direction>,
    ): TopologicGameState<FourStatePiece, Direction> {
        const player: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        let resultingState: TopologicGameState<FourStatePiece, Direction> = state;
        for (const coord of move.coords) {
            resultingState = resultingState.withPieceAt(coord, player);
        }
        return resultingState.incrementTurn();
    }

    public override isLegal(move: ConnectNMove,
                            state: TopologicGameState<FourStatePiece, Direction>,
                            config: ConnectNConfig,
    ): MGPFallible<void> {
        if (state.turn === 0 && move.coords.size() > 1) {
            return MGPFallible.failure(ConnectNFailure.YOU_MUST_DROP_ONE_AT_FIRST_TURN());
        }
        if (state.turn > 0 && move.coords.size() !== config.dropAfterFirstTurn) {
            return MGPFallible.failure(ConnectNFailure.YOU_MUST_PLAY_EXACTLY_N_PIECES(config.dropAfterFirstTurn));
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

    public override getInitialState(config: ConnectNConfig): TopologicGameState<FourStatePiece, Direction> {
        const topology: Topology<Direction> = ConnectNRules.getTopology(config);
        const shape: TopologicShape<Direction> = ConnectNRules.getShape(config, topology);
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
        const gameStateWithTable: SimpleGameStateWithTable<FourStatePiece> =
            new SimpleGameStateWithTable(board, 0);
        return new TopologicGameStateWithTable(topology, shape, gameStateWithTable);
    }

    private getTopology(config: ConnectNConfig): Topology<Direction> { // TODO DELETE
        return topologyMap.get(config.topology).get();
    }

    private getShape(config: ConnectNConfig, topology: Topology<Direction>): TopologicShape<Direction> { // TODO DELETE
        switch (config.shape) {
            case 'SQUARE': {
                return new RectangleShape(config.boardSize, config.boardSize, topology);
            } case 'HEXAGON': {
                return new HexagonShape(config.boardSize, topology);
            } case 'TORUS': {
                return new TorusShape(config.boardSize, config.boardSize, topology);
            } default: {
                Utils.expectToBe(config.shape, 'TRIANGLE');
                return new TriangleShape(config.boardSize, topology);
            }
        }
    }

    public override getGameStatus(
        node: GameNode<ConnectNMove, TopologicGameState<FourStatePiece, Direction>>,
        config: ConnectNConfig,
    ): GameStatus {
        const state: TopologicGameState<FourStatePiece, Direction> = node.gameState;
        const victoriousCoord: Coord[] = ConnectNRules.getVictoriousCoords(state, config);
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
