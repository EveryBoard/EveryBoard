import { Set } from '@everyboard/lib';

import { MoveGenerator } from '../../jscaip/AI/AI';
import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { TopologicGameState } from '../../jscaip/TopologicGameState';
import { ConnectSixMove, ConnectSixFirstMove, ConnectSixDrops } from '../connect-six/ConnectSixMove';

import { ConnectNConfig, ConnectNNode } from './ConnectNRules';

export class ConnectNMoveGenerator
    extends MoveGenerator<ConnectSixMove, TopologicGameState<FourStatePiece>, ConnectNConfig>
{

    public override getListMoves(node: ConnectNNode, _config: ConnectNConfig): ConnectSixMove[] {
        if (node.gameState.turn === 0) {
            return this.getFirstMove(node.gameState);
        } else {
            return this.getListDrops(node);
        }
    }

    private getFirstMove(state: TopologicGameState<FourStatePiece>): ConnectSixFirstMove[] {
        const centers: Coord[] = state.getCenters();
        const center: Coord = centers[0];
        return [
            ConnectSixFirstMove.of(center),
        ];
    }

    private getListDrops(node: ConnectNNode): ConnectSixMove[] {
        const availableFirstCoords: Set<Coord> = this.getUsefulCoordsMap(node.gameState);
        const moves: ConnectSixDrops[] = [];
        for (const firstCoord of availableFirstCoords) {
            for (const secondCoord of availableFirstCoords) {
                try { // Prevents to check everytime if first and second coord are identical
                    const newMove: ConnectSixDrops = ConnectSixDrops.of(firstCoord, secondCoord);
                    moves.push(newMove);
                } catch {
                    continue;
                }
            } // TODO: check that (a, b) and (b, a) are only passed once
        }
        return new Set(moves).toList(); // Removes duplicates
    }

    // private getAvailableCoords(state: TopologicGameState<FourStatePiece>): Coord[] {
    //     const usefulCoord: Set<Coord> = this.getUsefulCoordsMap(state);
    //     const availableCoords: Coord[] = [];
    //     for (const coordAndContent of state.getCoordsAndContents()) {
    //         const coord: Coord = coordAndContent.coord;
    //         if (usefulCoord.contains(coord) && coordAndContent.content.equals(FourStatePiece.EMPTY)) {
    //             availableCoords.push(coord);
    //         }
    //     }
    //     return availableCoords;
    // }

    /**
     * This function returns the set of coords that are empty but have occupied neighbors
     */
    private getUsefulCoordsMap(state: TopologicGameState<FourStatePiece>): Set<Coord> {
        let usefulCoord: Set<Coord> = new Set();
        const playerCoords: Coord[] = state
            .getCoordsAndContents()
            .filter((value: { coord: Coord, content: FourStatePiece }) => value.content.isPlayer())
            .map((value: { coord: Coord, content: FourStatePiece }) => value.coord);
        for (const playerCoord of playerCoords) {
            usefulCoord = usefulCoord.intersection(
                this.getNeighboringEmptyCoords(state, playerCoord),
            );
        }
        return usefulCoord;
    }

    /**
     * mark the space neighboring coord as "space that have an occupied neighbor"
     * @param coord the coord to add to this map
     */
    private getNeighboringEmptyCoords(
        state: TopologicGameState<FourStatePiece>,
        coord: Coord,
    ): Set<Coord> {
        const usefulDistance: number = 1; // At two, it's already too much calculation for the minimax sadly
        let neighboringCoords: Set<Coord> = new Set([
            ...state.getTopology().getNeighbors(coord),
        ]);
        for (let i: number = 1; i < usefulDistance; i++) {
            neighboringCoords = new Set(
                neighboringCoords.toList()
                    .flatMap((c: Coord) => state.getTopology().getNeighbors(c))
                    .filter((c: Coord) => state.isNotOnBoard(c))
                    .filter((c: Coord) => state.getPieceAt(c).equals(FourStatePiece.EMPTY)),
            );
        }
        return neighboringCoords;
    }

}
