import { MGPFallible, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { EnumConfig } from '../../config/EnumConfig';
import { NumberConfig } from '../../config/NumberConfig';
import { RulesConfigDescription } from '../../config/RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from '../../config/RulesConfigDescriptionLocalizable';
import { GameNode } from '../../jscaip/AI/GameNode';
import { Coord, CoordFailure } from '../../jscaip/Coord';
import { Direction } from '../../jscaip/Direction';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { GameStatus } from '../../jscaip/GameStatus';
import { ConfigurableRules } from '../../jscaip/Rules';
import { RulesFailure } from '../../jscaip/RulesFailure';
import { TableUtils } from '../../jscaip/TableUtils';
import { TopologicNInARowHelper } from '../../jscaip/TopologicNInARowHelper';
import { HexagonalShape } from '../../jscaip/shape/HexagonalShape';
import { RectangularShape } from '../../jscaip/shape/RectangularShape';
import { TopologicShape } from '../../jscaip/shape/Shape';
import { TorusShape } from '../../jscaip/shape/TorusShape';
import { TriangularShape } from '../../jscaip/shape/TriangularShape';
import { SimpleGameStateWithTable } from '../../jscaip/state/SimpleGameStateWithTable';
import { TopologicGameState } from '../../jscaip/state/TopologicGameState';
import { TopologicGameStateWithTable } from '../../jscaip/state/TopologicGameStateWithTable';
import { Topology } from '../../jscaip/topology/Topology';
import { TopologyID, topologyMap } from '../../jscaip/topology/topologyMap';
import { Localized } from '../../utils/LocaleUtils';
import { MGPValidators } from '../../utils/MGPValidator';

import { ConnectNFailure } from './ConnectNFailure';
import { ConnectNMove } from './ConnectNMove';

export class ConnectNNode extends GameNode<ConnectNMove, TopologicGameState<FourStatePiece>> {}

export const TopologyNamer: Record<TopologyID, Localized> = {
    'SQUARE (4)': () => $localize`Square (4)`,
    'SQUARE (8)': () => $localize`Square (8)`,
    'HEXAGONAL': () => $localize`Hexagonal`,
    'TRIANGULAR': () => $localize`Triangular`,
};

export type ShapeEnum = 'SQUARE' | 'HEXAGONAL' | 'TRIANGULAR' | 'TORIC';

export const Shapes: Record<ShapeEnum, Localized> = {
    'SQUARE': () => $localize`Square`,
    'HEXAGONAL': () => $localize`Hexagonal`,
    'TRIANGULAR': () => $localize`Triangular`,
    'TORIC': () => $localize`Toric`,
};

export type ConnectNConfig = {

    n: number;

    dropAfterFirstTurn: number;

    topology: TopologyID;

    shape: ShapeEnum;

    boardSize: number;

}

export class ConnectNRules extends ConfigurableRules<ConnectNMove,
                                                     TopologicGameState<FourStatePiece>,
                                                     ConnectNConfig>
{
    private static singleton: MGPOptional<ConnectNRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<ConnectNConfig> =
        new RulesConfigDescription<ConnectNConfig>({
            name: (): string => $localize`Default`,
            config: {
                n: new NumberConfig(6, () => $localize`N`, MGPValidators.range(3, 10)),
                dropAfterFirstTurn: new NumberConfig(2, () => $localize`Drop after first turn`, MGPValidators.range(2, 10)),
                boardSize: new NumberConfig(19, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 100)),
                topology: new EnumConfig('SQUARE (8)', () => $localize`Space shape`, TopologyNamer),
                shape: new EnumConfig('SQUARE', () => $localize`Board shape`, Shapes),
            },
        });

    public static get(): ConnectNRules {
        if (ConnectNRules.singleton.isAbsent()) {
            ConnectNRules.singleton = MGPOptional.of(new ConnectNRules());
        }
        return ConnectNRules.singleton.get();
    }

    public static getVictoriousCoords(state: TopologicGameState<FourStatePiece>, config: ConnectNConfig): Coord[] {
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
                                   state: TopologicGameState<FourStatePiece>,
    ): TopologicGameState<FourStatePiece> {
        const player: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        let resultingState: TopologicGameState<FourStatePiece> = state;
        for (const coord of move.coords) {
            resultingState = resultingState.withPieceAt(coord, player);
        }
        return resultingState.incrementTurn();
    }

    public override isLegal(move: ConnectNMove,
                            state: TopologicGameState<FourStatePiece>,
                            config: ConnectNConfig,
    ): MGPFallible<void> {
        if (state.turn === 0 && move.coords.size() > 1) {
            return MGPFallible.failure(ConnectNFailure.FIRST_TURN_MEANS_ONE_MOVE());
        }
        if (state.turn > 0 && move.coords.size() !== config.dropAfterFirstTurn) {
            return MGPFallible.failure(ConnectNFailure.YOU_MUST_PLAY_EXACTLY(config.dropAfterFirstTurn));
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

    public override getInitialState(config: ConnectNConfig): TopologicGameState<FourStatePiece> {
        const topology: Topology<Direction> = this.getTopology(config);
        const shape: TopologicShape<Direction> = this.getShape(config, topology);
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

    private getTopology(config: ConnectNConfig): Topology<Direction> {
        return topologyMap.get(config.topology).get();
    }

    private getShape(config: ConnectNConfig, topology: Topology<Direction>): TopologicShape<Direction> {
        switch (config.shape) {
            case 'SQUARE': {
                return new RectangularShape(config.boardSize, config.boardSize, topology);
            } case 'HEXAGONAL': {
                return new HexagonalShape(config.boardSize, topology);
            } case 'TORIC': {
                return new TorusShape(config.boardSize, config.boardSize, topology);
            } default: {
                Utils.expectToBe(config.shape, 'TRIANGULAR');
                return new TriangularShape(config.boardSize, topology);
            }
        }
    }

    public override getGameStatus(
        node: GameNode<ConnectNMove, TopologicGameState<FourStatePiece>>,
        config: ConnectNConfig,
    ): GameStatus {
        const state: TopologicGameState<FourStatePiece> = node.gameState;
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

    private isBoardFull(state: TopologicGameState<FourStatePiece>): boolean {
        return state
            .getAllCoords()
            .filter((coord: Coord) => {
                return state.getPieceAt(coord).isPlayer() === false;
            }).length === 0;
    }

}
