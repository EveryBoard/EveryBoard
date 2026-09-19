import { Set, ReversibleMap } from '@everyboard/lib';

import { Coord } from '../Coord';
import { CoordSet } from '../CoordSet';
import { HexagonalUtils } from '../HexagonalUtils';

import { GameState } from './GameState';

type Scale = {
    width: number;
    height: number;
}

export abstract class OpenHexagonalGameState<T extends NonNullable<unknown>> extends GameState {

    public readonly width: number;

    public readonly height: number;

    public constructor(public pieces: ReversibleMap<Coord, T>, turn: number) {
        super(turn);
        const scale: Scale = this.computeScale();
        this.width = scale.width;
        this.height = scale.height;
        this.pieces.makeImmutable();
    }
    public getPieces(): ReversibleMap<Coord, T> {
        return this.pieces;
    }
    public getPieceCoords(): Coord[] {
        return this.pieces.getKeyList();
    }
    public computeScale(): Scale {
        let minWidth: number = Number.POSITIVE_INFINITY;
        let maxWidth: number = Number.NEGATIVE_INFINITY;
        let minHeight: number = Number.POSITIVE_INFINITY;
        let maxHeight: number = Number.NEGATIVE_INFINITY;
        for (const coord of this.pieces.getKeyList()) {
            minWidth = Math.min(coord.x, minWidth);
            maxWidth = Math.max(coord.x, maxWidth);
            minHeight = Math.min(coord.y, minHeight);
            maxHeight = Math.max(coord.y, maxHeight);
        }
        return {
            width: maxWidth + 1 - minWidth,
            height: maxHeight + 1 - minHeight,
        };
    }
    public isOnBoard(coord: Coord): boolean {
        return this.pieces.containsKey(coord);
    }
    public getOccupiedNeighbors(coord: Coord): CoordSet {
        const neighbors: CoordSet = new CoordSet(HexagonalUtils.getNeighbors(coord));
        return neighbors.filter((neighbor: Coord) => {
            return this.pieces.get(neighbor).isPresent();
        });
    }
    public getGroups(): Set<CoordSet> {
        let visited: CoordSet = new CoordSet();
        let groups: Set<CoordSet> = new Set();
        for (const coord of this.pieces.getKeyList()) {
            if (visited.contains(coord) === false) {
                // We will visit all reachable occupied neighbors of this coord
                let group: CoordSet = new CoordSet();
                let toVisit: CoordSet = new CoordSet([coord]);
                while (toVisit.hasElements()) {
                    const nextCoord: Coord = toVisit.getAnyElement().get();
                    toVisit = toVisit.removeElement(nextCoord);
                    visited = visited.addElement(nextCoord);
                    group = group.addElement(nextCoord);
                    const occupiedNeighboors: CoordSet = this.getOccupiedNeighbors(nextCoord);
                    const unvisitedOccupiedNeighboors: CoordSet = occupiedNeighboors
                        .filter((neighbor: Coord) => visited.contains(neighbor) === false);
                    toVisit = toVisit.union(unvisitedOccupiedNeighboors);
                }
                groups = groups.addElement(group);
            }
        }
        return groups;
    }
}
