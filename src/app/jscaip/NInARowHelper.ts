import { MGPMap, Utils, Set } from '@everyboard/lib';

import { BoardValue } from './AI/BoardValue';
import { Coord } from './Coord';
import { Direction } from './Direction';
import { Ordinal } from './Ordinal';
import { Player, PlayerOrNone } from './Player';
import { GameStateWithCoords } from './state/GameStateWithCoords';

export abstract class NInARowHelper<T extends NonNullable<unknown>, D extends Direction> {

    private doubleDirections: Set<D> | undefined;

    public constructor(
        private readonly getOwner: (piece: T, state?: GameStateWithCoords<T>) => PlayerOrNone,
        private readonly N: number,
    ) {
    }

    protected abstract getDirections(): Set<D>;

    protected getDoubleDirections(): Set<D> {
        if (this.doubleDirections === undefined) {
            const doubleDirections: D[] = [];
            for (const direction of this.getDirections()) {
                if (doubleDirections.includes(direction) || doubleDirections.includes(direction.getOpposite())) {
                    continue;
                } else {
                    doubleDirections.push(direction);
                }
            }
            this.doubleDirections = new Set(doubleDirections);
        }
        return this.doubleDirections;
    }

    public getBoardValue(state: GameStateWithCoords<T>): BoardValue {
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

    public getSquareScore(state: GameStateWithCoords<T>, coord: Coord): number {
        const piece: T = state.getPieceAt(coord);
        const player: Player = this.getOwner(piece, state) as Player;
        Utils.assert(player.isPlayer(), 'getSquareScore should not be called with PlayerOrNone.NONE piece');

        const freeSpaceByDirs: MGPMap<Ordinal, number> = new MGPMap();
        const alliesByDirs: MGPMap<Ordinal, number> = new MGPMap();

        for (const dir of this.getDirections()) {
            const freeSpaceAndAllies: [number, number] = this.getNumberOfFreeSpacesAndAllies(state, coord, dir, player);
            if (coord.x === 0) console.log('jaja', dir, 'gives', freeSpaceAndAllies)
            freeSpaceByDirs.set(dir, freeSpaceAndAllies[0]);
            alliesByDirs.set(dir, freeSpaceAndAllies[1]);
        }
        const score: number = this.getScoreFromDirectionAlliesAndFreeSpaces(alliesByDirs, freeSpaceByDirs);
        return score * player.getScoreModifier();
    }

    public getScoreFromDirectionAlliesAndFreeSpaces(
        alliesByDirs: MGPMap<Ordinal, number>,
        freeSpaceByDirs: MGPMap<Ordinal, number>,
    ): number {
        let score: number = 0;
        for (const dir of this.getDoubleDirections()) {
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

    public getNumberOfFreeSpacesAndAllies(state: GameStateWithCoords<T>,
                                          i: Coord,
                                          dir: Ordinal,
                                          player: Player,
    ) : [number, number] {
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
        const opponent: Player = player.getOpponent();
        while (state.isOnBoard(coord) && testedCoords < this.N) {
            // while we're on the board
            const currentSpace: T = state.getPieceAt(coord);
            const currentOwner: PlayerOrNone = this.getOwner(currentSpace, state);
            if (currentOwner === opponent) {
                return [freeSpaces, allies];
            }
            if (currentOwner === player && allAlliesAreSideBySide) {
                allies++;
            } else {
                allAlliesAreSideBySide = false; // we stop counting the allies on this line
            }
            // as soon as there is a free space
            if (currentOwner !== opponent && currentOwner !== player) {
                freeSpaces++;
            }
            coord = coord.getNext(dir);
            testedCoords++;
        }
        return [freeSpaces, allies];
    }

    protected getNextCoord(coord: Coord, dir: Direction, distance: number = 1): Coord {
        return coord.getNext(dir, distance);
    }

    public getVictoriousCoord(state: GameStateWithCoords<T>): Coord[] {
        const coords: Coord[] = [];
        for (const coordAndContents of state.getCoordsAndContents()) {
            if (this.getOwner(coordAndContents.content, state).isPlayer()) {
                const coord: Coord = coordAndContents.coord;
                const squareScore: number = this.getSquareScore(state, coord);
                if (coord.x === 0) console.log('value at zozo', squareScore);
                if (BoardValue.isVictoryValue(squareScore)) {
                    coords.push(coord);
                }
            }
        }
        return coords;
    }

}
