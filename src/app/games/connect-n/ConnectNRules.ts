import { MGPFallible, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { EnumConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from '../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { GameNode } from '../../jscaip/AI/GameNode';
import { Coord, CoordFailure } from '../../jscaip/Coord'; // TODO: remove as Coord might be not applicable
import { Direction } from '../../jscaip/Direction';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { GameStatus } from '../../jscaip/GameStatus';
import { NInARowHelper } from '../../jscaip/NInARowHelper';
import { Player } from '../../jscaip/Player';
import { ConfigurableRules } from '../../jscaip/Rules';
import { RulesFailure } from '../../jscaip/RulesFailure';
import { TableUtils } from '../../jscaip/TableUtils';
import { RectangularShape } from '../../jscaip/shape/RectangularShape';
import { TriangularShape } from '../../jscaip/shape/TriangularShape';
import { SimpleGameStateWithTable } from '../../jscaip/state/SimpleGameStateWithTable';
import { TopologicGameState } from '../../jscaip/state/TopologicGameState';
import { TopologicGameStateWithTable } from '../../jscaip/state/TopologicGameStateWithTable';
import { HexagonalTopology } from '../../jscaip/topology/HexagonalTopology';
import { SquareTopology } from '../../jscaip/topology/SquareTopology';
import { Topology } from '../../jscaip/topology/Topology';
import { TriangularTopology } from '../../jscaip/topology/TriangularTopology';
import { Localized } from '../../utils/LocaleUtils';
import { MGPValidators } from '../../utils/MGPValidator';
import { ConnectSixDrops, ConnectSixMove } from '../connect-six/ConnectSixMove';

export class ConnectNNode extends GameNode<ConnectSixMove, TopologicGameState<FourStatePiece>> {}

// export class ConnectNMove extends Move {

//     public override toString(): string {
//         throw new Error('TODO 0');
//     }

//     public override equals(other: this): boolean {
//         throw new Error('TODO 1');
//     }

// }

export type TopologyEnum = 'SQUARE' | 'HEXAGONAL' | 'TRIANGULAR';

export const Topologies: Record<TopologyEnum, Localized> = {
    'SQUARE': () => $localize`Square`,
    'HEXAGONAL': () => $localize`Hexagonal`,
    'TRIANGULAR': () => $localize`Triangular`,
};

export type ConnectNConfig = {

    n: number;

    topology: TopologyEnum;

}

export class ConnectNRules extends ConfigurableRules<ConnectSixMove, // TODO: no import from other games !!!
                                                     TopologicGameState<FourStatePiece>,
                                                     ConnectNConfig>
{
    private static singleton: MGPOptional<ConnectNRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<ConnectNConfig> =
        new RulesConfigDescription<ConnectNConfig>({
            name: (): string => $localize`Default`,
            config: {
                n: new NumberConfig(6, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(3, 10)),
                topology: new EnumConfig('SQUARE', () => $localize`Drop mode`, Topologies),
            },
        });

    public static get(): ConnectNRules {
        if (ConnectNRules.singleton.isAbsent()) {
            ConnectNRules.singleton = MGPOptional.of(new ConnectNRules());
        }
        return ConnectNRules.singleton.get();
    }

    public static getVictoriousCoords(state: TopologicGameState<FourStatePiece>, config: ConnectNConfig): Coord[] {
        return new NInARowHelper(
            (piece: FourStatePiece) => piece.getPlayer(),
            config.n,
        ).getVictoriousCoordWithTopology(state);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<ConnectNConfig> {
        return ConnectNRules.RULES_CONFIG_DESCRIPTION;
    }

    public override applyLegalMove(move: ConnectSixMove,
                                   state: TopologicGameState<FourStatePiece>,
    ): TopologicGameState<FourStatePiece> {
        if (move instanceof ConnectSixDrops) {
            return this.applyLegalDrops(move.getCoords(), state);
        } else {
            return this.applyLegalDrops([move.coord], state);
        }
    }

    private applyLegalDrops(coords: Coord[],
                            state: TopologicGameState<FourStatePiece>,
    ): TopologicGameState<FourStatePiece> {
        const player: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        let resultingState: TopologicGameState<FourStatePiece> = state;
        for (const coord of coords) {
            resultingState = resultingState.setPieceAt(coord, player);
        }
        return resultingState.incrementTurn();
    }

    public override isLegal(move: ConnectSixMove,
                            state: TopologicGameState<FourStatePiece>,
    ): MGPFallible<void> {
        if (move instanceof ConnectSixDrops) {
            Utils.assert(state.turn > 0, 'ConnectSixDrops should only be used after first move');
            for (const coord of move.getCoords()) {
                if (state.isNotOnBoard(coord)) {
                    return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(coord));
                }
            }
            return this.isLegalDrops(move.getCoords(), state);
        } else {
            Utils.assert(state.turn === 0, 'ConnectSixFirstMove should only be used at first move');
            if (state.isNotOnBoard(move.coord)) {
                return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(move.coord));
            }
            return MGPValidation.SUCCESS;
        }
    }

    public isLegalDrops(coords: Coord[], state: TopologicGameState<FourStatePiece>): MGPValidation {
        for (const coord of coords) {
            if (state.getPieceAt(coord).isPlayer()) {
                return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
            }
        }
        return MGPValidation.SUCCESS;
    }

    public override getInitialState(config: ConnectNConfig): TopologicGameState<FourStatePiece> {
        switch (config.topology) {
            case 'SQUARE': {
                const topology: Topology = new SquareTopology();
                return new TopologicGameStateWithTable<FourStatePiece>(
                    topology,
                    new RectangularShape(19, 19, topology),
                    new SimpleGameStateWithTable<FourStatePiece>(
                        TableUtils.create(19, 19, FourStatePiece.EMPTY),
                        0,
                    ),
                );
            } case 'HEXAGONAL': {
                // const topology: Topology = new SquareTopology();
                // return new TopologicGameStateWithTable<FourStatePiece>(
                //     topology,
                //     new ToroidalShape(19, 19, topology),
                //     new SimpleGameStateWithTable<FourStatePiece>(
                //         TableUtils.create(19, 19, FourStatePiece.EMPTY),
                //         0,
                //     ),
                // );
                const topology: HexagonalTopology = new HexagonalTopology();
                return new TopologicGameStateWithTable<FourStatePiece>(
                    topology,
                    new RectangularShape(19, 19, topology),
                    new SimpleGameStateWithTable<FourStatePiece>(
                        TableUtils.create(19, 19, FourStatePiece.EMPTY),
                        0,
                    ),
                );
            } default: {
                Utils.expectToBe(config.topology, 'TRIANGULAR');
                const topology: Topology = new TriangularTopology();
                return new TopologicGameStateWithTable<FourStatePiece>(
                    topology,
                    new TriangularShape(19),
                    new SimpleGameStateWithTable<FourStatePiece>(
                        TableUtils.create(19, 19, FourStatePiece.EMPTY),
                        0,
                    ),
                );
            }
        }
    }

    public override getGameStatus(node: GameNode<ConnectSixMove, TopologicGameState<FourStatePiece>>,
                                  config: ConnectNConfig,
    ): GameStatus {
        const state: TopologicGameState<FourStatePiece> = node.gameState;
        if (state.turn < 2) {
            return GameStatus.ONGOING;
        }
        // take the last move
        const lastMove: ConnectSixDrops = node.previousMove.get() as ConnectSixDrops;
        const currentPlayer: Player = state.getCurrentOpponent();
        for (const startCoord of lastMove.getCoords()) {
            for (const direction of state.topology.getDirections()) {
                const directionCount: number = this.countAlignedPieceOf(
                    state,
                    currentPlayer,
                    direction,
                    startCoord,
                );
                const oppositeCount: number = this.countAlignedPieceOf(
                    state,
                    currentPlayer,
                    direction.getOpposite(),
                    startCoord,
                );
                if (directionCount + 1 + oppositeCount >= config.n) {
                    return GameStatus.getVictory(currentPlayer);
                }
            }
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

    private countAlignedPieceOf(state: TopologicGameState<FourStatePiece>,
                                currentPlayer: Player,
                                direction: Direction,
                                coord: Coord,
    ): number {
        let count: number = 0;
        let testedCoord: Coord = state.getTopology().getNextCoord(coord, direction);
        while (state.hasPieceAt(testedCoord, FourStatePiece.ofPlayer(currentPlayer))) {
            testedCoord = state.getTopology().getNextCoord(testedCoord, direction);
            count++;
        }
        return count;
    }

}
