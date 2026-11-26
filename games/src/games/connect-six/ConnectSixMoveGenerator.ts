import { Set } from '@everyboard/lib';

import { MoveGenerator } from '../../jscaip/AI/AI';
import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { Direction } from '../../jscaip/direction/Direction';
import { TopologicGameState } from '../../jscaip/state/TopologicGameState';

import { ConnectSixMove } from './ConnectSixMove';
import { ConnectSixConfig, ConnectSixNode } from './ConnectSixRules';

export class ConnectSixMoveGenerator
    extends MoveGenerator<ConnectSixMove, TopologicGameState<FourStatePiece, Direction>, ConnectSixConfig>
{

    public override getListMoves(node: ConnectSixNode, config: ConnectSixConfig): ConnectSixMove[] {
        if (node.gameState.turn === 0) {
            return this.getFirstMove(node.gameState);
        } else {
            return this.getListDrops(node, config);
        }
    }

    private getFirstMove(state: TopologicGameState<FourStatePiece, Direction>): ConnectSixMove[] {
        const centers: Coord[] = state.getCenters();
        const center: Coord = centers[0];
        return [
            ConnectSixMove.of([center]),
        ];
    }

    private getListDrops(node: ConnectSixNode, config: ConnectSixConfig): ConnectSixMove[] {
        const availableFirstCoords: Set<Coord> = this.getUsefulCoordsMap(node.gameState);
        let moves: Set<Set<Coord>> = availableFirstCoords.map(
            (coord: Coord) => new Set([coord]),
        );
        let remainingDrops: number = config.dropAfterFirstTurn - 1;
        while (remainingDrops > 0) {
            moves = moves.flatMap(
                (ongoingMove: Set<Coord>) => this.getBiggerMove(node.gameState, ongoingMove, availableFirstCoords),
            );
            remainingDrops--;
        }
        return moves.map(
            (coords: Set<Coord>) => new ConnectSixMove(coords),
        ).toList();
    }

    private getBiggerMove(
        state: TopologicGameState<FourStatePiece, Direction>,
        ongoingMove: Set<Coord>,
        initialCoords: Set<Coord>,
    ): Set<Set<Coord>> {
        const ongoingMoveNeighbors: Set<Coord> = ongoingMove.flatMap(
            (coord: Coord) => this.getImmediateEmptyNeighbors(state, coord),
        );
        const possiblesNextDrops: Set<Coord> = initialCoords
            .union(ongoingMoveNeighbors)
            .filter((coord: Coord) => ongoingMove.contains(coord) === false);
        return possiblesNextDrops.map(
            (coord: Coord) => ongoingMove.union(new Set([coord])),
        );
    }

    /**
     * This function returns the set of coords that are empty but have occupied neighbors
     */
    private getUsefulCoordsMap(state: TopologicGameState<FourStatePiece, Direction>): Set<Coord> {
        let usefulCoord: Set<Coord> = new Set();
        const coordsAndContents: { coord: Coord; content: FourStatePiece }[] = state.getCoordsAndContents();
        const playerCoordsAndContents: { coord: Coord; content: FourStatePiece }[] = coordsAndContents
            .filter((value: { coord: Coord; content: FourStatePiece }) => value.content.isPlayer());
        const playerCoords: Coord[] = playerCoordsAndContents
            .map((value: { coord: Coord; content: FourStatePiece }) => value.coord);
        for (const playerCoord of playerCoords) {
            usefulCoord = usefulCoord.union(
                this.getImmediateEmptyNeighbors(state, playerCoord),
            );
        }
        return usefulCoord.filter((c: Coord) => state.getPieceAt(c).equals(FourStatePiece.EMPTY));
    }

    private getImmediateEmptyNeighbors(state: TopologicGameState<FourStatePiece, Direction>, coord: Coord): Set<Coord> {
        return state.getTopology()
            .getNeighbors(coord)
            .filter((c: Coord) => state.isOnBoard(c))
            .filter((c: Coord) => state.getPieceAt(c).equals(FourStatePiece.EMPTY));
    }

}
