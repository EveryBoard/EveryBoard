import { MGPFallible, MGPOptional, Set, Utils } from '@everyboard/lib';

import { RulesConfig } from '../../../config/RulesConfig';
import { GameNode } from '../../../jscaip/AI/GameNode';
import { Coord } from '../../../jscaip/Coord';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { GameStatus } from '../../../jscaip/GameStatus';
import { Orthogonal } from '../../../jscaip/Orthogonal';
import { Player } from '../../../jscaip/Player';
import { PlayerOrNone } from '../../../jscaip/Player';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { ConfigurableRules } from '../../../jscaip/Rules';
import { RulesFailure } from '../../../jscaip/RulesFailure';
import { TableUtils } from '../../../jscaip/TableUtils';
import { Direction } from '../../../jscaip/direction/Direction';
import { EightDirection } from '../../../jscaip/direction/EightDirection';
import { HexaDirection } from '../../../jscaip/direction/HexaDirection';
import { TriangularDirection } from '../../../jscaip/direction/TriangularDirection';
import { HexagonShape } from '../../../jscaip/shape/HexagonShape';
import { RectangleShape } from '../../../jscaip/shape/RectangleShape';
import { TopologicShape } from '../../../jscaip/shape/TopologicShape';
import { TorusShape } from '../../../jscaip/shape/TorusShape';
import { TriangleShape } from '../../../jscaip/shape/TriangleShape';
import { SimpleGameStateWithTable } from '../../../jscaip/state/SimpleGameStateWithTable';
import { TriangularCheckerBoard } from '../../../jscaip/state/TriangularCheckerBoard';
import { Topology } from '../../../jscaip/topology/Topology';
import { TopologyID, topologyMap } from '../../../jscaip/topology/topologyMap';
import { Debug } from '../../../utils/Debug';
import { Localized } from '../../../utils/LocaleUtils';

import { ReversiFailure } from './ReversiFailure';
import { ReversiMove } from './ReversiMove';
import { ReversiState } from './ReversiState';

export type ReversiLegalityInformation = Set<Coord>;

export class ReversiMoveWithSwitched {

    public constructor(public readonly move: ReversiMove,
                       public readonly switched: number,
    ) {
    }
}

export class ReversiNode extends GameNode<ReversiMove, ReversiState<Direction>> {}

export const ReversiTopologyNamer: Record<TopologyID, Localized> = {
    'SQUARE (4)': () => $localize`Square (4)`,
    'SQUARE (8)': () => $localize`Square (8)`,
    'HEXAGON': () => $localize`Hexagon`,
    'TRIANGLE': () => $localize`Triangle`,
};

export type ReversiShapeEnum = 'SQUARE' | 'HEXAGON' | 'TRIANGLE' | 'TORUS';

export const ReversiShapes: Record<ReversiShapeEnum, Localized> = {
    'SQUARE': () => $localize`Square`,
    'HEXAGON': () => $localize`Hexagon`,
    'TRIANGLE': () => $localize`Triangle`,
    'TORUS': () => $localize`Torus`,
};

export type ReversiConfig = RulesConfig & {

    topology: TopologyID;

    shape: ReversiShapeEnum;

    boardSize: number;

};

@Debug.log
export abstract class TopologicReversiRules
    extends ConfigurableRules<ReversiMove,
                              ReversiState<Direction>,
                              ReversiConfig,
                              ReversiLegalityInformation>
{

    public override getInitialState(config: ReversiConfig): ReversiState<Direction> {
        const topology: Topology<Direction> = this.getTopology(config);
        const shape: TopologicShape<Direction> = this.getShape(config, topology);
        let maxX: number = 0;
        let maxY: number = 0;
        for (const coord of shape.getAllCoords()) {
            maxX = Math.max(maxX, coord.x);
            maxY = Math.max(maxY, coord.y);
        }
        let board: FourStatePiece[][] =
            TableUtils.create(maxX + 1, maxY + 1, FourStatePiece.UNREACHABLE);
        for (const coord of shape.getAllCoords()) {
            board[coord.y][coord.x] = FourStatePiece.EMPTY;
        }
        board = this.fillInitialPiece(config, board);
        const gameStateWithTable: SimpleGameStateWithTable<FourStatePiece> =
            new SimpleGameStateWithTable(board, 0);
        return new ReversiState(topology, shape, gameStateWithTable);
    } // TODO: create getSimpleGameStateWithTable in parent class and reuse it in Reversi

    private fillInitialPiece(config: ReversiConfig, board: FourStatePiece[][]): FourStatePiece[][] {
        const topology: Topology<Direction> = this.getTopology(config);
        const shape: TopologicShape<Direction> = this.getShape(config, topology);
        const centers: Coord[] = shape.getCenters();
        switch (config.topology) {
            case 'HEXAGON':
                return this.getInitialHexagonalBoard(
                    topology,
                    shape,
                    centers,
                    board,
                );
            case 'SQUARE (4)':
                return this.getInitialSquareBoard(
                    centers,
                    shape as TopologicShape<Orthogonal>,
                    board,
                );
            case 'SQUARE (8)':
                return this.getInitialSquareBoard(
                    centers,
                    shape as TopologicShape<EightDirection>,
                    board,
                );
            default:
                Utils.expectToBe(config.topology, 'TRIANGLE');
                return this.getInitialTriangularBoard(
                    shape as TopologicShape<TriangularDirection>,
                    centers,
                    board,
                );
        }
    }

    private getInitialSquareBoard(
        centers: Coord[],
        shape: TopologicShape<EightDirection | Orthogonal>,
        board: FourStatePiece[][],
    ): FourStatePiece[][] {
        const upLeft: Coord = centers[0];
        if (centers.length === 1) {
            centers.push(
                shape.getNextCoord(upLeft, EightDirection.RIGHT, 1).get(),
                shape.getNextCoord(upLeft, EightDirection.DOWN, 1).get(),
                shape.getNextCoord(upLeft, EightDirection.DOWN_RIGHT, 1).get(),
            );
        }
        for (const center of centers) {
            const evenCoord: boolean = (center.x + center.y) % 2 === 0;
            const pieceToPut: FourStatePiece = evenCoord ? FourStatePiece.ZERO : FourStatePiece.ONE;
            board[center.y][center.x] = pieceToPut;
        }
        return board;
    }

    private getInitialHexagonalBoard(
        topology: Topology<HexaDirection>,
        shape: TopologicShape<HexaDirection>,
        centers: Coord[],
        board: FourStatePiece[][],
    ): FourStatePiece[][] {
        let evenDirection: boolean = false;
        for (const direction of topology.getDirections()) {
            const pieceToPut: FourStatePiece = evenDirection ? FourStatePiece.ZERO : FourStatePiece.ONE;
            const coord: Coord = shape.getNextCoord(centers[0], direction, 1).get();
            board[coord.y][coord.x] = pieceToPut;
            evenDirection = !evenDirection;
        }
        return board;
    }

    private getInitialTriangularBoard(
        shape: TopologicShape<TriangularDirection>,
        centers: Coord[],
        board: FourStatePiece[][],
    ): FourStatePiece[][] {
        const baseCenter: Coord = centers[0];
        console.log(baseCenter.toString());
        console.table(board);
        if (centers.length === 1) {
            let mirror: Coord;
            if (TriangularCheckerBoard.isSpaceDark(baseCenter)) {
                mirror = new Coord(baseCenter.x, baseCenter.y - 1);
            } else {
                mirror = new Coord(baseCenter.x, baseCenter.y + 1);
            }
            centers.push(
                mirror,
                mirror.getNext(EightDirection.RIGHT, 1),
                mirror.getNext(EightDirection.LEFT, 1),
                baseCenter.getNext(EightDirection.RIGHT, 1),
                baseCenter.getNext(EightDirection.LEFT, 1),
            );
            console.log(centers);
        };
        for (const center of centers) {
            const isUpward: boolean = TriangularCheckerBoard.isSpaceDark(center);
            const pieceToPut: FourStatePiece = isUpward ? FourStatePiece.ZERO : FourStatePiece.ONE;
            board[center.y][center.x] = pieceToPut;
        }
        return board;
    }

    private getTopology(config: ReversiConfig): Topology<Direction> {
        return topologyMap.get(config.topology).get();
    }

    private getShape<DIR extends Direction>(config: ReversiConfig, topology: Topology<DIR>): TopologicShape<DIR> {
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

    public override applyLegalMove(move: ReversiMove,
                                   state: ReversiState<Direction>,
                                   _: ReversiConfig,
                                   info: ReversiLegalityInformation)
    : ReversiState<Direction> {
        const turn: number = state.turn;
        const player: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        const board: FourStatePiece[][] = state.getCopiedBoard();
        if (move.equals(ReversiMove.PASS)) { // if the player pass
            const sameGameStateDifferentTurn: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable(board, turn + 1);
            return new ReversiState(state.getTopology(), state.getShape(), sameGameStateDifferentTurn);
        }
        for (const s of info) {
            board[s.y][s.x] = player;
        }
        board[move.coord.y][move.coord.x] = player;
        const resultingGameState: SimpleGameStateWithTable<FourStatePiece> =
            new SimpleGameStateWithTable(board, turn + 1);
        return new ReversiState(state.getTopology(), state.getShape(), resultingGameState);
    }

    public getAllSwitchedCoords<DIR extends Direction>(
        move: ReversiMove,
        player: Player,
        state: ReversiState<DIR>,
    ): Set<Coord> {
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
                    const switchedInDir: Coord[] = this.getSandwicheds(player, direction, firstSpace, state);
                    for (const switched of switchedInDir) {
                        switcheds.push(switched);
                    }
                }
            }
        }
        return new Set(switcheds);
    }

    public getSandwicheds<DIR extends Direction>(
        capturer: Player,
        direction: DIR,
        start: Coord,
        state: ReversiState<DIR>,
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
                testedCoord = state.getShape().getNextCoord(testedCoord.get(), direction, 1);
            }
        }
        return []; // we found the end of the board before we found the new piece like 'searchedPawn'
    }

    public isGameEnded<DIR extends Direction>(state: ReversiState<DIR>): boolean {
        return this.playerCanOnlyPass(state) &&
               this.nextPlayerCanOnlyPass(state);
    }

    public override getGameStatus(node: ReversiNode): GameStatus {
        const state: ReversiState<Direction> = node.gameState;
        const gameIsEnded: boolean = this.isGameEnded(state);
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

    public playerCanOnlyPass(state: ReversiState<Direction>): boolean {
        const currentPlayerChoices: ReversiMoveWithSwitched[] = this.getListMoves(state);
        // if the current player cannot start, then the part is ended
        return (currentPlayerChoices.length === 1) &&
                currentPlayerChoices[0].move.equals(ReversiMove.PASS);
    }

    public nextPlayerCanOnlyPass<DIR extends Direction>(state: ReversiState<DIR>): boolean {
        const nextBoard: FourStatePiece[][] = state.getCopiedBoard();
        const nextTurn: number = state.turn + 1;
        const nextState: ReversiState<DIR> = new ReversiState(
            state.getTopology(),
            state.getShape(),
            new SimpleGameStateWithTable(nextBoard, nextTurn),
        );
        return this.playerCanOnlyPass(nextState);
    }

    public getListMoves<DIR extends Direction>(state: ReversiState<DIR>): ReversiMoveWithSwitched[] {
        const moves: ReversiMoveWithSwitched[] = [];
        const player: Player = state.getCurrentPlayer();
        const opponent: Player = state.getCurrentOpponent();
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            if (state.getPieceAt(coord).equals(FourStatePiece.EMPTY)) {
                // For each empty spaces
                const opponentNeighbors: Set<Coord> = state.getNeighboringPawnLike(opponent, coord);
                console.log(coord.toString(), 'has', opponentNeighbors.map((c: Coord) => c.toString()));
                if (opponentNeighbors.size() > 0) {
                    // if one of the neighboring space is an opponent then, there could be a switch,
                    // and hence a legal move
                    const move: ReversiMove = new ReversiMove(coord.x, coord.y);
                    const result: Set<Coord> = this.getAllSwitchedCoords(move, player, state);
                    if (result.size() > 0) {
                        // there was switched piece and hence, a legal move
                        for (const switched of result) {
                            Utils.assert(
                                player !== state.getPieceAt(switched).getPlayer(),
                                switched + 'was already switched!',
                            );
                        }
                        moves.push(new ReversiMoveWithSwitched(move, result.size()));
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

    public override isLegal(move: ReversiMove, state: ReversiState<Direction>)
    : MGPFallible<ReversiLegalityInformation>
    {
        if (move.equals(ReversiMove.PASS)) { // if the player passes
            // let's check that pass is a legal move right now
            // if there was no choice but to pass, then passing is legal!
            // else, passing was illegal
            if (this.playerCanOnlyPass(state)) {
                return MGPFallible.success(new Set());
            } else {
                return MGPFallible.failure(RulesFailure.CANNOT_PASS());
            }
        }
        if (state.getPieceAt(move.coord).isPlayer()) {
            return MGPFallible.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }
        const switched: Set<Coord> = this.getAllSwitchedCoords(move, state.getCurrentPlayer(), state);
        if (switched.size() === 0) {
            return MGPFallible.failure(ReversiFailure.NO_ELEMENT_SWITCHED());
        } else {
            return MGPFallible.success(switched);
        }
    }

    public countUnsandwichableDirections(state: ReversiState<Direction>, coord: Coord): number {
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
