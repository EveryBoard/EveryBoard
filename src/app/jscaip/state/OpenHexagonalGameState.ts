import { Set, ReversibleMap } from '@everyboard/lib';
import { Coord } from '../Coord';
import { GameState } from './GameState';
import { HexagonalUtils } from '../HexagonalUtils';
import { CoordSet } from '../CoordSet';

type Scale = {
    width: number,
    height: number,
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
        let minWidth: number = Number.MAX_SAFE_INTEGER;
        let maxWidth: number = Number.MIN_SAFE_INTEGER;
        let minHeight: number = Number.MAX_SAFE_INTEGER;
        let maxHeight: number = Number.MIN_SAFE_INTEGER;
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
        this.pieces.forEach((itemToVisit: {key: Coord, value: T}) => {
            if (visited.contains(itemToVisit.key) === false) {
                // We will visit all reachable occupied neighbors of this coord
                let group: CoordSet = new CoordSet();
                let toVisit: CoordSet = new CoordSet([itemToVisit.key]);
                while (toVisit.hasElements()) {
                    const coord: Coord = toVisit.getAnyElement().get();
                    toVisit = toVisit.removeElement(coord);
                    visited = visited.addElement(coord);
                    group = group.addElement(coord);
                    toVisit = toVisit.union(this.getOccupiedNeighbors(coord).filter((neighbor: Coord) =>
                        visited.contains(neighbor) === false));
                }
                groups = groups.addElement(group);
            }
        });
        return groups;
    }
}
