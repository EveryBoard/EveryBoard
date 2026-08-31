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
        let remainingDrops: number = config.dropAfterFirstTurn;
        while (remainingDrops > 0) {
            console.log('we now have moves of size', config.dropAfterFirstTurn - remainingDrops, 'have that much', moves.size(), moves.toList().map((set: Set<Coord>) => set.toString()))
            moves = moves.flatMap(
                (ongoingMove: Set<Coord>) => this.getBiggerMove(node.gameState, ongoingMove, availableFirstCoords),
            );
            remainingDrops--;
        }
        moves = moves.filter((m: Set<Coord>) => m.size() === 2); // TODO: assert uselessness and kill
        return moves.map(
            (coords: Set<Coord>) => new ConnectNMove(coords),
        ).toList();
    }

    private getBiggerMove(
        state: TopologicGameState<FourStatePiece>,
        ongoingMove: Set<Coord>,
        initialCoords: Set<Coord>,
    ): Set<Set<Coord>> {
        const ongoingMoveNeighbors: Coord[] = ongoingMove.toList().flatMap(
            (coord: Coord) => this.getImmediateEmptyNeighbors(state, coord),
        );
        const possiblesNextDrops: Set<Coord> = initialCoords.unionList(ongoingMoveNeighbors);
        console.log('our possibles choices are in this list of size', possiblesNextDrops.size())
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
        const usefulDistance: number = 1; // At two, it's already too much calculation for the minimax sadly
        let neighboringCoords: Set<Coord> = new Set([
            ...this.getImmediateEmptyNeighbors(state, coord),
        ]);
        for (let i: number = 1; i < usefulDistance; i++) {
            neighboringCoords = new Set(
                neighboringCoords.toList()
                    .flatMap((c: Coord) => this.getImmediateEmptyNeighbors(state, c)),
            );
        }
        return neighboringCoords;
    }

    private getImmediateEmptyNeighbors(state: TopologicGameState<FourStatePiece>, coord: Coord): Coord[] {
        console.log('jaaj kzzk', coord.toString(), state.getTopology().getNeighbors(coord))
        return state.getTopology()
            .getNeighbors(coord)
            .filter((c: Coord) => state.isOnBoard(c))
            .filter((c: Coord) => state.getPieceAt(c).equals(FourStatePiece.EMPTY));
    }

}
