import { Comparable } from '../utils/Comparable';
import { MGPMap, ReversibleMap } from '../utils/MGPMap';
import { MGPSet } from '../utils/MGPSet';
import { Coord } from './Coord';
import { Vector } from './Direction';
import { GameState } from './GameState';
import { HexagonalUtils } from './HexagonalUtils';

type Scale<T extends NonNullable<Comparable>> = {
    width: number,
    height: number,
    pieces: ReversibleMap<Coord, T>,
    offset: Vector,
}
export abstract class FreeHexagonalGameState<T extends NonNullable<Comparable>> extends GameState {

    public readonly width: number;

    public readonly height: number;

    public readonly offset: Vector;

    public constructor(public readonly pieces: ReversibleMap<Coord, T>,
                       turn: number,
                       offset?: Vector) {
        super(turn);
        const scale: Scale<T> = this.computeScale();
        this.pieces = scale.pieces;
        this.width = scale.width;
        this.height = scale.height;
        this.offset = offset ?? scale.offset;
        this.pieces.makeImmutable();
    }
    public computeScale(): Scale<T> {
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
        let newPieces: ReversibleMap<Coord, T> = new ReversibleMap<Coord, T>();
        const offset: Vector = new Vector(- minWidth, - minHeight);
        if (minWidth !== 0 || minHeight !== 0) {
            for (const coord of this.pieces.listKeys()) {
                const oldValue: T = this.pieces.delete(coord);
                const newCoord: Coord = coord.getNext(offset);
                newPieces.set(newCoord, oldValue);
            }
        } else {
            newPieces = this.pieces;
        }
        return {
            width: maxWidth + 1 - minWidth,
            height: maxHeight + 1 - minHeight,
            pieces: newPieces,
            offset,
        };
    }

    public abstract isEmpty(content: T): boolean

    public isOnBoard(coord: Coord): boolean {
        return this.pieces.containsKey(coord);
    }

    public setAt(coord: Coord, piece: T): void {
        this.pieces.makeMutable();
        if (this.isEmpty(piece)) {
            this.pieces.delete(coord);
        } else {
            this.pieces.put(coord, piece);
        }
        this.pieces.makeImmutable();
    }

    public getOccupiedNeighbors(coord: Coord): MGPSet<Coord> {
        return (new MGPSet(HexagonalUtils.neighbors(coord)))
            .filter((neighbor: Coord) => this.pieces.get(neighbor).isPresent());
    }

    public getGroups(): MGPSet<MGPSet<Coord>> {
        const visited: MGPSet<Coord> = new MGPSet();
        const groups: MGPSet<MGPSet<Coord>> = new MGPSet();
        this.pieces.forEach((item: {key: Coord, value: T}) => {
            if (visited.contains(item.key) === false) {
                // We will visit all reachable occupied neighbors of this coord
                const group: MGPSet<Coord> = new MGPSet();
                const toVisit: MGPSet<Coord> = new MGPSet([item.key]);
                while (toVisit.isEmpty() === false) {
                    const coord: Coord = toVisit.getAnyElement().get();
                    toVisit.remove(coord);
                    visited.add(coord);
                    group.add(coord);
                    toVisit.union(this.getOccupiedNeighbors(coord).filter((neighbor: Coord) =>
                        visited.contains(neighbor) === false));
                }
                groups.add(group);
            }
        });
        return groups;
    }
}
