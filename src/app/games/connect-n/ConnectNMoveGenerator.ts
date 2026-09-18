import { Set } from '@everyboard/lib';

import { MoveGenerator } from '../../jscaip/AI/AI';
import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { TopologicGameState } from '../../jscaip/state/TopologicGameState';
import { ConnectNMove } from '../connect-n/ConnectNMove';

import { ConnectNConfig, ConnectNNode } from './ConnectNRules';

export class ConnectNMoveGenerator
    extends MoveGenerator<ConnectNMove, TopologicGameState<FourStatePiece>, ConnectNConfig>
{

    public override getListMoves(node: ConnectNNode, config: ConnectNConfig): ConnectNMove[] {
        if (node.gameState.turn === 0) {
            return this.getFirstMove(node.gameState);
        } else {
            return this.getListDrops(node, config);
        }
    }

    private getFirstMove(state: TopologicGameState<FourStatePiece>): ConnectNMove[] {
        const centers: Coord[] = state.getCenters();
        const center: Coord = centers[0];
        return [
            ConnectNMove.of([center]),
        ];
    }

    private getListDrops(node: ConnectNNode, config: ConnectNConfig): ConnectNMove[] {
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
            (coords: Set<Coord>) => new ConnectNMove(coords),
        ).toList();
    }

    private getBiggerMove(
        state: TopologicGameState<FourStatePiece>,
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
    private getUsefulCoordsMap(state: TopologicGameState<FourStatePiece>): Set<Coord> {
        let usefulCoord: Set<Coord> = new Set();
        const coordsAndContents: { coord: Coord; content: FourStatePiece }[] = state.getCoordsAndContents();
        const playerCoordsAndContents: { coord: Coord; content: FourStatePiece }[] = coordsAndContents
            .filter((value: { coord: Coord; content: FourStatePiece }) => value.content.isPlayer());
        const playerCoords: Coord[] = playerCoordsAndContents
            .map((value: { coord: Coord; content: FourStatePiece }) => value.coord);
        for (const playerCoord of playerCoords) {
            usefulCoord = usefulCoord.union(
                this.getNeighboringCoords(state, playerCoord),
            );
        }
        return usefulCoord.filter((c: Coord) => state.getPieceAt(c).equals(FourStatePiece.EMPTY));
    }

    /**
     * mark the space neighboring coord as "space that have an occupied neighbor"
     * @param coord the coord to add to this map
     */
    private getNeighboringCoords(
        state: TopologicGameState<FourStatePiece>,
        coord: Coord,
    ): Set<Coord> {
        return new Set([
            ...this.getImmediateEmptyNeighbors(state, coord),
        ]);
    }

    private getImmediateEmptyNeighbors(state: TopologicGameState<FourStatePiece>, coord: Coord): Set<Coord> {
        return state.getTopology()
            .getNeighbors(coord)
            .filter((c: Coord) => state.isOnBoard(c))
            .filter((c: Coord) => state.getPieceAt(c).equals(FourStatePiece.EMPTY));
    }

}
