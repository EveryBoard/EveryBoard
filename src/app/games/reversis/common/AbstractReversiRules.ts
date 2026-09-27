import { MGPFallible, MGPOptional, Set, Utils } from '@everyboard/lib';

import { EnumConfig } from '../../../components/wrapper-components/rules-configuration/EnumConfig';
import { NumberConfig } from '../../../components/wrapper-components/rules-configuration/NumberConfig';
import { RulesConfigDescription } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescriptionLocalizable';
import { GameNode } from '../../../jscaip/AI/GameNode';
import { Coord } from '../../../jscaip/Coord';
import { Direction } from '../../../jscaip/Direction';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { GameStatus } from '../../../jscaip/GameStatus';
import { Ordinal } from '../../../jscaip/Ordinal';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { ConfigurableRules } from '../../../jscaip/Rules';
import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { RulesFailure } from '../../../jscaip/RulesFailure';
import { TableUtils } from '../../../jscaip/TableUtils';
import { HexagonalShape } from '../../../jscaip/shape/HexagonalShape';
import { RectangularShape } from '../../../jscaip/shape/RectangularShape';
import { TopologicShape } from '../../../jscaip/shape/Shape';
import { TorusShape } from '../../../jscaip/shape/TorusShape';
import { TriangularShape } from '../../../jscaip/shape/TriangularShape';
import { SimpleGameStateWithTable } from '../../../jscaip/state/SimpleGameStateWithTable';
import { Topology } from '../../../jscaip/topology/Topology';
import { TopologyID, topologyMap } from '../../../jscaip/topology/topologyMap';
import { Debug } from '../../../utils/Debug';
import { Localized } from '../../../utils/LocaleUtils';
import { MGPValidators } from '../../../utils/MGPValidator';

import { ReversiFailure } from './ReversiFailure';
import { ReversiMove } from './ReversiMove';
import { ReversiState } from './ReversiState';

export type ReversiLegalityInformation = Coord[];

export class ReversiMoveWithSwitched {

    public constructor(public readonly move: ReversiMove,
                       public readonly switched: number,
    ) {
    }
}

export class ReversiNode extends GameNode<ReversiMove, ReversiState> {}

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

export type ReversiConfig = RulesConfig & {

    topology: TopologyID;

    shape: ShapeEnum;

    boardSize: number;
};

@Debug.log
export class TopologicReversiRules extends ConfigurableRules<ReversiMove,
                                                             ReversiState,
                                                             ReversiConfig,
                                                             ReversiLegalityInformation>
{
    private static singleton: MGPOptional<TopologicReversiRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<ReversiConfig> =
        new RulesConfigDescription<ReversiConfig>({
            name: (): string => $localize`Default`,
            config: {
                n: new NumberConfig(6, () => $localize`N`, MGPValidators.range(3, 10)),
                dropAfterFirstTurn: new NumberConfig(2, () => $localize`Drop after first turn`, MGPValidators.range(2, 10)),
                boardSize: new NumberConfig(19, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 100)),
                topology: new EnumConfig('SQUARE (8)', () => $localize`Space shape`, TopologyNamer),
                shape: new EnumConfig('SQUARE', () => $localize`Board shape`, Shapes),
            },
        });

    public static get(): TopologicReversiRules {
        if (TopologicReversiRules.singleton.isAbsent()) {
            TopologicReversiRules.singleton = MGPOptional.of(new TopologicReversiRules());
        }
        return TopologicReversiRules.singleton.get();
    }

    public override getRulesConfigDescription(): RulesConfigDescription<ReversiConfig> {
        return TopologicReversiRules.RULES_CONFIG_DESCRIPTION;
    }

    public override getInitialState(config: ReversiConfig): ReversiState {
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
        return new ReversiState(topology, shape, gameStateWithTable);
    } // TODO: create getSimpleGameStateWithTable in parent class and reuse it in Reversi

    private getTopology(config: ReversiConfig): Topology<Direction> {
        return topologyMap.get(config.topology).get();
    }

    private getShape(config: ReversiConfig, topology: Topology<Direction>): TopologicShape<Direction> {
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

    public override applyLegalMove(move: ReversiMove,
                                   state: ReversiState,
                                   _: ReversiConfig,
                                   info: ReversiLegalityInformation)
    : ReversiState
    {
        const turn: number = state.turn;
        const player: Player = state.getCurrentPlayer();
        const board: PlayerOrNone[][] = state.getCopiedBoard();
        if (move.equals(ReversiMove.PASS)) { // if the player pass
            const sameBoardDifferentTurn: ReversiState =
                new ReversiState(board, turn + 1);
            return sameBoardDifferentTurn;
        }
        for (const s of info) {
            board[s.y][s.x] = player;
        }
        board[move.coord.y][move.coord.x] = player;
        const resultingState: ReversiState = new ReversiState(board, turn + 1);
        return resultingState;
    }

    public getAllSwitchedCoords(
        move: ReversiMove,
        player: Player,
        state: ReversiState,
        config: ReversiConfig,
    ): Coord[] {
        // try the move, do it if legal, and return the switched pieces
        const switcheds: Coord[] = [];
        const opponent: Player = player.getOpponent();

        // const boardMode: BoardMode = this.getBoardMode(config);
        for (const direction of state.getTopology().getDirections()) {
            // const firstSpace: Coord = boardMode.getNextCoord(move.coord, direction, state);
            const optionalFirstSpace: MGPOptional<Coord> = state.getShape().getNextCoord(move.coord, direction, 1);
            if (optionalFirstSpace.isPresent()) {
                const firstSpace: Coord = optionalFirstSpace.get();
                if (state.hasPieceAt(firstSpace, FourStatePiece.ofPlayer(opponent))) {
                    // let's test this direction
                    const switchedInDir: Coord[] = this.getSandwicheds(player, direction, firstSpace, state, config);
                    for (const switched of switchedInDir) {
                        switcheds.push(switched);
                    }
                }
            }
        }
        return switcheds;
    }

    public getSandwicheds(capturer: Player,
                          direction: Ordinal,
                          start: Coord,
                          state: ReversiState,
                          config: ReversiConfig,
    ) : Coord[] {
        /**
          * expected that 'start' is in range, and is captured
          * if we don't reach another capturer, returns []
          * else : return all the coord between start and the first 'capturer' found (exluded)
          */
        const sandwichedsCoord: Coord[] = [start]; // here we know it in range and captured
        let testedCoord: MGPOptional<Coord> = state.getShape().getNextCoord(start, direction, 1);
        while (
            testedCoord.isPresent() &&
            state.isOnBoard(testedCoord.get()) &&
            testedCoord.equalsValue(start) === false
        ) {
            const testedCoordContent: PlayerOrNone = state.getPieceAt(testedCoord.get()).getPlayer();
            if (testedCoordContent === capturer) {
                // we found a sandwicher, in range, in this direction
                return sandwichedsCoord;
            } else if (testedCoordContent.isNone()) {
                // we found the emptyness before a capturer, so there won't be a next space
                return [];
            } else {
                // we found a switched/captured
                sandwichedsCoord.push(testedCoord.get()); // we add it
                testedCoord = state.getShape().getNextCoord(start, direction, 1);
            }
        }
        return []; // we found the end of the board before we found the new piece like 'searchedPawn'
    }

    public isGameEnded(state: ReversiState, config: ReversiConfig): boolean {
        return this.playerCanOnlyPass(state, config) &&
               this.nextPlayerCanOnlyPass(state, config);
    }

    public override getGameStatus(node: ReversiNode, config: ReversiConfig): GameStatus {
        const state: ReversiState = node.gameState;
        const gameIsEnded: boolean = this.isGameEnded(state, config);
        if (gameIsEnded === false) {
            return GameStatus.ONGOING;
        }
        const scores: PlayerNumberMap = state.countScore();
        const diff: number = scores.get(Player.ONE) - scores.get(Player.ZERO);
        if (diff < 0) {
            return GameStatus.ZERO_WON;
        }
        if (diff > 0) {
            return GameStatus.ONE_WON;
        }
        return GameStatus.DRAW;
    }

    public playerCanOnlyPass(state: ReversiState, config: ReversiConfig): boolean {
        const currentPlayerChoices: ReversiMoveWithSwitched[] = this.getListMoves(state, config);
        // if the current player cannot start, then the part is ended
        return (currentPlayerChoices.length === 1) &&
                currentPlayerChoices[0].move.equals(ReversiMove.PASS);
    }

    public nextPlayerCanOnlyPass(reversiState: ReversiState, config: ReversiConfig): boolean {
        const nextBoard: PlayerOrNone[][] = reversiState.getCopiedBoard();
        const nextTurn: number = reversiState.turn + 1;
        const nextState: ReversiState = new ReversiState(nextBoard, nextTurn);
        return this.playerCanOnlyPass(nextState, config);
    }

    public getListMoves(state: ReversiState, config: ReversiConfig): ReversiMoveWithSwitched[] {
        const moves: ReversiMoveWithSwitched[] = [];
        const player: Player = state.getCurrentPlayer();
        const opponent: Player = state.getCurrentOpponent();
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            if (state.getPieceAt(coord).equals(FourStatePiece.EMPTY)) {
                // For each empty spaces
                const opponentNeighbors: Set<Coord> = state.getNeighboringPawnLike(opponent, coord);
                if (opponentNeighbors.size() > 0) {
                    // if one of the 8 neighboring space is an opponent then, there could be a switch,
                    // and hence a legal move
                    const move: ReversiMove = new ReversiMove(coord.x, coord.y);
                    const result: Coord[] = this.getAllSwitchedCoords(move, player, state, config);
                    if (result.length > 0) {
                        // there was switched piece and hence, a legal move
                        for (const switched of result) {
                            Utils.assert(
                                player !== state.getPieceAt(switched).getPlayer(),
                                switched + 'was already switched!',
                            );
                        }
                        moves.push(new ReversiMoveWithSwitched(move, result.length));
                    }
                }
            }
        }
        if (moves.length === 0) {
            // When the user cannot move, their only move is to pass, which they cannot do otherwise
            // The board remains unchanged, only the turn changed, and the move is a "pass"
            moves.push(new ReversiMoveWithSwitched(ReversiMove.PASS, 0));
        }
        return moves;
    }

    public override isLegal(move: ReversiMove, state: ReversiState, config: ReversiConfig)
    : MGPFallible<ReversiLegalityInformation>
    {
        if (move.equals(ReversiMove.PASS)) { // if the player passes
            // let's check that pass is a legal move right now
            // if there was no choice but to pass, then passing is legal!
            // else, passing was illegal
            if (this.playerCanOnlyPass(state, config)) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(RulesFailure.CANNOT_PASS());
            }
        }
        if (state.getPieceAt(move.coord).isPlayer()) {
            return MGPFallible.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }
        const switched: Coord[] = this.getAllSwitchedCoords(move, state.getCurrentPlayer(), state, config);
        if (switched.length === 0) {
            return MGPFallible.failure(ReversiFailure.NO_ELEMENT_SWITCHED());
        } else {
            return MGPFallible.success(switched);
        }
    }

    public countUnsandwichableDirections(state: ReversiState, coord: Coord): number {
        let unsandwichableDirectionsCount: number = 0;
        for (const direction of state.getTopology().getDirections()) {
            const neighbor: MGPOptional<Coord> = state.getShape().getNextCoord(coord, direction, 1);
            const oppositeNeigbhro: MGPOptional<Coord> = state.getShape().getNextCoord(coord, direction, -1);
            if (neighbor.isAbsent() || oppositeNeigbhro.isAbsent()) {
                unsandwichableDirectionsCount += 1; // Will get counted twice of course
            }
        }
        return unsandwichableDirectionsCount / 2;
    }

}
