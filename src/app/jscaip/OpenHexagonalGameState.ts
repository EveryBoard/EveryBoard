import { Comparable } from '../utils/Comparable';
import { ReversibleMap } from '../utils/MGPMap';
import { MGPSet } from '../utils/MGPSet';
import { Coord } from './Coord';
import { GameState } from './GameState';
import { HexagonalUtils } from './HexagonalUtils';

type Scale = {
    width: number,
    height: number,
}
export abstract class OpenHexagonalGameState<T extends NonNullable<Comparable>> extends GameState {

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
        return this.pieces.listKeys();
    }
    public computeScale(): Scale {
        let minWidth: number = Number.MAX_SAFE_INTEGER;
        let maxWidth: number = Number.MIN_SAFE_INTEGER;
        let minHeight: number = Number.MAX_SAFE_INTEGER;
        let maxHeight: number = Number.MIN_SAFE_INTEGER;
        for (const coord of this.pieces.listKeys()) {
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
    public getOccupiedNeighbors(coord: Coord): MGPSet<Coord> {
        const neighbors: MGPSet<Coord> = new MGPSet(HexagonalUtils.getNeighbors(coord));
        return neighbors.filter((neighbor: Coord) => {
            return this.pieces.get(neighbor).isPresent();
        });
    }
    public getGroups(): MGPSet<MGPSet<Coord>> {
        const visited: MGPSet<Coord> = new MGPSet();
        const groups: MGPSet<MGPSet<Coord>> = new MGPSet();
        this.pieces.forEach((itemToVisit: {key: Coord, value: T}) => {
            if (visited.contains(itemToVisit.key) === false) {
                // We will visit all reachable occupied neighbors of this coord
                const group: MGPSet<Coord> = new MGPSet();
                const toVisit: MGPSet<Coord> = new MGPSet([itemToVisit.key]);
                while (toVisit.hasElements()) {
                    const coord: Coord = toVisit.getAnyElement().get();
                    toVisit.remove(coord);
                    visited.add(coord);
                    group.add(coord);
                    toVisit.addAll(this.getOccupiedNeighbors(coord).filter((neighbor: Coord) =>
                        visited.contains(neighbor) === false));
                }
                groups.add(group);
            }
        });
        return groups;
    }
}
