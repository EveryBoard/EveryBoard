import { MGPMap, Utils } from '@everyboard/lib';

import { BoardValue } from './AI/BoardValue';
import { Coord } from './Coord';
import { Direction } from './Direction';
import { Ordinal } from './Ordinal';
import { Player, PlayerOrNone } from './Player';
import { GameStateWithTable } from './state/GameStateWithTable';
import { TopologicGameState } from './state/TopologicGameState';

export class AbstractNInARowHelper<T extends NonNullable<unknown>, D extends Direction = Ordinal> {

    private readonly doubleDirections: Set<D>;

    public constructor(private readonly getOwner: (piece: T, state?: GameStateWithTable<T>) => PlayerOrNone,
                       private readonly N: number,
                       private readonly directions: ReadonlyArray<D>)
    {
        // The aim of this loop is to count down and up as only one "double direction"
        const doubleDirections: D[] = [];
        for (const direction of directions) {
            if (doubleDirections.includes(direction) || doubleDirections.includes(direction.getOpposite())) {
                continue;
            } else {
                doubleDirections.push(direction);
            }
        }
        this.doubleDirections = new Set(doubleDirections);
    }

    public getBoardValue(state: GameStateWithTable<T>): BoardValue {
        let score: number = 0;
        for (const coordAndContent of state.getCoordsAndContents()) {
            const piece: T = coordAndContent.content;
            const coord: Coord = coordAndContent.coord;
            if (this.getOwner(piece, state).isPlayer()) {
                const squareScore: number = this.getSquareScore(state, coord);
                if (BoardValue.isVictoryValue(squareScore)) {
                    return BoardValue.of(squareScore);
                } else {
                    score += squareScore;
                }
            }
        }
        return BoardValue.of(score);
    }

    public getSquareScore(state: GameStateWithTable<T>, coord: Coord): number {
        const piece: T = state.getPieceAt(coord);
        const ally: Player = this.getOwner(piece, state) as Player;
        Utils.assert(ally.isPlayer(), 'getSquareScore should not be called with PlayerOrNone.NONE piece');

        const freeSpaceByDirs: MGPMap<D, number> = new MGPMap();
        const alliesByDirs: MGPMap<D, number> = new MGPMap();

        for (const dir of this.directions) {
            const freeSpaceAndAllies: [number, number] = this.getNumberOfFreeSpacesAndAllies(state, coord, dir, ally);
            freeSpaceByDirs.set(dir, freeSpaceAndAllies[0]);
            alliesByDirs.set(dir, freeSpaceAndAllies[1]);
        }
        const score: number = this.getScoreFromDirectionAlliesAndFreeSpaces(alliesByDirs, freeSpaceByDirs);
        return score * ally.getScoreModifier();
    }

    public getSquareScoreWithTopology(state: TopologicGameState<T>, coord: Coord): number {
        const piece: T = state.getPieceAt(coord);
        const ally: Player = this.getOwner(piece) as Player;
        Utils.assert(ally.isPlayer(), 'getSquareScore should not be called with PlayerOrNone.NONE piece');

        const freeSpaceByDirs: MGPMap<D, number> = new MGPMap();
        const alliesByDirs: MGPMap<D, number> = new MGPMap();

        for (const dir of this.directions) {
            const freeSpaceAndAllies: [number, number] =
                this.getNumberOfFreeSpacesAndAlliesWithTopology(state, coord, dir, ally);
            freeSpaceByDirs.set(dir, freeSpaceAndAllies[0]);
            alliesByDirs.set(dir, freeSpaceAndAllies[1]);
        }
        const score: number = this.getScoreFromDirectionAlliesAndFreeSpaces(alliesByDirs, freeSpaceByDirs);
        return score * ally.getScoreModifier();
    }

    public getScoreFromDirectionAlliesAndFreeSpaces(alliesByDirs: MGPMap<D, number>,
                                                    freeSpaceByDirs: MGPMap<D, number>)
    : number
    {
        let score: number = 0;
        for (const dir of this.doubleDirections) {
            // for each pair of opposite directions
            const directionAllies: number = alliesByDirs.get(dir).get();
            const oppositeDirectionAllies: number = alliesByDirs.get(dir.getOpposite()).get();
            const lineAllies: number = directionAllies + oppositeDirectionAllies;
            if (this.N <= lineAllies + 1) {
                return Number.POSITIVE_INFINITY;
            }
            const directionFreeSpaces: number = freeSpaceByDirs.get(dir).get();
            const oppositeDirectionFreeSpaces: number = freeSpaceByDirs.get(dir.getOpposite()).get();
            const lineFreeSpaces: number = directionFreeSpaces + oppositeDirectionFreeSpaces;
            if (this.N <= lineFreeSpaces + 1) {
                score += 2 + lineFreeSpaces - this.N;
            }
        }
        return score;
    }

    public getNumberOfFreeSpacesAndAlliesWithTopology(state: TopologicGameState<T>,
                                                      i: Coord,
                                                      dir: D,
                                                      ally: Player,
    ): [number, number] {
        /**
         * for a square at the coord i, containing an ally
         * we go through the board from this coord in the direction dir
         * and until a maximal distance of N cases
         */
        let freeSpaces: number = 0; // the number of aligned free square
        let allies: number = 0; // the number of alligned allies
        let allAlliesAreSideBySide: boolean = true;
        let coord: Coord = new Coord(i.x + dir.x, i.y + dir.y);
        let testedCoords: number = 1;
        const opponent: Player = ally.getOpponent();
        while (state.isNotOnBoard(coord) === false && testedCoords < this.N) {
            // while we're on the board
            const currentSpace: T = state.getPieceAt(coord);
            const currentOwner: PlayerOrNone = this.getOwner(currentSpace);
            if (currentOwner === opponent) {
                return [freeSpaces, allies];
            }
            if (currentOwner === ally && allAlliesAreSideBySide) {
                allies++;
            } else {
                allAlliesAreSideBySide = false; // we stop counting the allies on this line
            }
            // as soon as there is a hole
            if (currentOwner !== opponent && currentOwner !== ally) {
                freeSpaces++;
            }
            coord = coord.getNext(dir);
            testedCoords++;
        }
        return [freeSpaces, allies];
    }

    public getNumberOfFreeSpacesAndAllies(state: GameStateWithTable<T>,
                                          i: Coord,
                                          dir: D,
                                          ally: Player)
    : [number, number]
    {
        /**
         * for a square at the coord i, containing an ally
         * we go through the board from this coord in the direction dir
         * and until a maximal distance of N cases
         */
        let freeSpaces: number = 0; // the number of aligned free square
        let allies: number = 0; // the number of alligned allies
        let allAlliesAreSideBySide: boolean = true;
        let coord: Coord = new Coord(i.x + dir.x, i.y + dir.y);
        let testedCoords: number = 1;
        const opponent: Player = ally.getOpponent();
        while (state.isOnBoard(coord) && testedCoords < this.N) {
            // while we're on the board
            const currentSpace: T = state.getPieceAt(coord);
            const currentOwner: PlayerOrNone = this.getOwner(currentSpace, state);
            if (currentOwner === opponent) {
                return [freeSpaces, allies];
            }
            if (currentOwner === ally && allAlliesAreSideBySide) {
                allies++;
            } else {
                allAlliesAreSideBySide = false; // we stop counting the allies on this line
            }
            // as soon as there is a hole
            if (currentOwner !== opponent && currentOwner !== ally) {
                freeSpaces++;
            }
            coord = coord.getNext(dir);
            testedCoords++;
        }
        return [freeSpaces, allies];
    }

    public getVictoriousCoordWithTopology(state: TopologicGameState<T>): Coord[] {
        const coords: Coord[] = [];
        for (const coord of state.getAllCoords()) {
            const content: T = state.getPieceAt(coord);
            if (this.getOwner(content).isPlayer()) {
                const squareScore: number = this.getSquareScoreWithTopology(state, coord);
                if (BoardValue.isVictoryValue(squareScore)) {
                    coords.push(coord);
                }
            }
        }
        return coords;
    }

    public getVictoriousCoord(state: GameStateWithTable<T>): Coord[] {
        const coords: Coord[] = [];
        for (const coordAndContents of state.getCoordsAndContents()) {
            if (this.getOwner(coordAndContents.content, state).isPlayer()) {
                const coord: Coord = coordAndContents.coord;
                const squareScore: number = this.getSquareScore(state, coord);
                if (BoardValue.isVictoryValue(squareScore)) {
                    coords.push(coord);
                }
            }
        }
        return coords;
    }

}

export class NInARowHelper<T extends NonNullable<unknown>> extends AbstractNInARowHelper<T> {

    public constructor(getOwner: (piece: T) => PlayerOrNone,
                       N: number) {
        super(getOwner, N, Ordinal.ORDINALS);
    }

}
