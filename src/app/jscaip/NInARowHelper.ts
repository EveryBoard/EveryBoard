import { MGPMap, Utils } from '@everyboard/lib';

import { BoardValue } from './AI/BoardValue';
import { Coord } from './Coord';
import { Direction } from './Direction';
import { Player, PlayerOrNone } from './Player';
import { GameStateWithCoords } from './state/GameStateWithCoords';

export abstract class NInARowHelper<T extends NonNullable<unknown>, D extends Direction> {

    private axes: ReadonlyArray<D> | undefined;

    public constructor(
        private readonly getOwner: (piece: T, state?: GameStateWithCoords<T>) => PlayerOrNone,
        private readonly N: number,
    ) {
    }

    protected abstract getDirections(): ReadonlyArray<D>;

    /**
     * AXES are the half of a direction
     * So [left, right] would return only [left] or [right], arbitrarly,
     * as a vector and it's opposite are seen as identical
     */
    protected getAxes(): ReadonlyArray<D> {
        if (this.axes === undefined) {
            const axes: D[] = [];
            for (const direction of this.getDirections()) {
                if (axes.includes(direction) || axes.includes(direction.getOpposite())) {
                    continue;
                } else {
                    axes.push(direction);
                }
            }
            this.axes = axes;
        }
        return this.axes;
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

        const freeSpaceByDirs: MGPMap<D, number> = new MGPMap();
        const alliesByDirs: MGPMap<D, number> = new MGPMap();

        for (const dir of this.getDirections()) {
            const freeSpaceAndAllies: [number, number] = this.getNumberOfFreeSpacesAndAllies(state, coord, dir, player);
            freeSpaceByDirs.set(dir, freeSpaceAndAllies[0]);
            alliesByDirs.set(dir, freeSpaceAndAllies[1]);
        }
        const score: number = this.getScoreFromDirectionAlliesAndFreeSpaces(alliesByDirs, freeSpaceByDirs);
        return score * player.getScoreModifier();
    }

    public getScoreFromDirectionAlliesAndFreeSpaces(
        alliesByDirs: MGPMap<D, number>,
        freeSpaceByDirs: MGPMap<D, number>,
    ): number {
        let score: number = 0;
        for (const axe of this.getAxes()) {
            // for each pair of opposite directions
            const directionAllies: number = alliesByDirs.get(axe).get();
            const oppositeDirectionAllies: number = alliesByDirs.get(axe.getOpposite()).get();
            const lineAllies: number = directionAllies + oppositeDirectionAllies;
            if (this.N <= lineAllies + 1) {
                return Number.POSITIVE_INFINITY;
            }
            const directionFreeSpaces: number = freeSpaceByDirs.get(axe).get();
            const oppositeDirectionFreeSpaces: number = freeSpaceByDirs.get(axe.getOpposite()).get();
            const lineFreeSpaces: number = directionFreeSpaces + oppositeDirectionFreeSpaces;
            if (this.N <= lineFreeSpaces + 1) {
                score += 2 + lineFreeSpaces - this.N;
            }
        }
        return score;
    }

    public getNumberOfFreeSpacesAndAllies(state: GameStateWithCoords<T>,
                                          i: Coord,
                                          dir: D,
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
        let coord: Coord = this.getNextCoord(i, dir);
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
            coord = this.getNextCoord(coord, dir);
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
                if (BoardValue.isVictoryValue(squareScore)) {
                    coords.push(coord);
                }
            }
        }
        return coords;
    }

}
