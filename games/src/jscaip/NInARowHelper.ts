import { MGPMap, MGPOptional, Set, Utils } from '@everyboard/lib';

import { BoardValue } from './AI/BoardValue';
import { Coord } from './Coord';
import { Player, PlayerOrNone } from './Player';
import { Direction } from './direction/Direction';
import { GameStateWithCoords } from './state/GameStateWithCoords';

export abstract class NInARowHelper<T extends NonNullable<unknown>, D extends Direction> {

    private readonly axes: ReadonlyArray<D>;

    public constructor(
        private readonly getOwner: (piece: T, state?: GameStateWithCoords<T>) => PlayerOrNone,
        private readonly N: number,
        private readonly directions: ReadonlyArray<D>,
    ) {
        const axes: D[] = [];
        for (const direction of this.directions) {
            if (axes.includes(direction) || axes.includes(direction.getOpposite())) {
                continue;
            } else {
                axes.push(direction);
            }
        }
        this.axes = axes;
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

        const freeSpaceByDirs: MGPMap<D, Coord[]> = new MGPMap();
        const alliesByDirs: MGPMap<D, Coord[]> = new MGPMap();

        for (const dir of this.directions) {
            const freeSpaceAndAllies: { freeSpaces: Coord[]; alignedPlayers: Coord[] } =
                this.getNumberOfFreeSpacesAndPlayers(state, coord, dir, player);
            freeSpaceByDirs.set(dir, freeSpaceAndAllies.freeSpaces);
            alliesByDirs.set(dir, freeSpaceAndAllies.alignedPlayers);
        }
        const score: number = this.getScoreFromDirectionAlliesAndFreeSpaces(alliesByDirs, freeSpaceByDirs);
        return score * player.getScoreModifier();
    }

    private getScoreFromDirectionAlliesAndFreeSpaces(
        alliesByDirs: MGPMap<D, Coord[]>,
        freeSpaceByDirs: MGPMap<D, Coord[]>,
    ): number {
        let score: number = 0;
        for (const axis of this.axes) {
            // for each pair of opposite directions
            const directionAllies: Coord[] = alliesByDirs.get(axis).get();
            const oppositeDirectionAllies: Coord[] = alliesByDirs.get(axis.getOpposite()).get();
            const lineAllies: number = new Set([
                ...directionAllies,
                ...oppositeDirectionAllies,
            ]).size();
            if (this.N <= lineAllies + 1) {
                return Number.POSITIVE_INFINITY;
            }
            const directionFreeSpaces: Coord[] = freeSpaceByDirs.get(axis).get();
            const oppositeDirectionFreeSpaces: Coord[] = freeSpaceByDirs.get(axis.getOpposite()).get();
            const lineFreeSpaces: number = new Set([
                ...directionFreeSpaces,
                ...oppositeDirectionFreeSpaces,
            ]).size();
            if (this.N <= lineFreeSpaces + 1) {
                score += 2 + lineFreeSpaces - this.N;
            }
        }
        return score;
    }

    private getNumberOfFreeSpacesAndPlayers(state: GameStateWithCoords<T>,
                                            i: Coord,
                                            dir: D,
                                            player: Player,
    ) : { freeSpaces: Coord[]; alignedPlayers: Coord[] } {
        /**
         * for a square at the coord i, containing 'player'
         * we go through the board from this coord in the direction dir
         * and until a maximal distance of N cases
         */
        const freeSpaces: Coord[] = []; // the number of aligned free square
        const alignedPlayers: Coord[] = []; // the number of aligned players
        let allPlayersAreSideBySide: boolean = true;
        let coord: MGPOptional<Coord> = this.getNextCoord(i, dir);
        let testedCoords: number = 1;
        const opponent: Player = player.getOpponent();
        while (
            coord.isPresent() &&
            state.isOnBoard(coord.get()) &&
            testedCoords < this.N &&
            coord.equalsValue(i) === false
        ) {
            // while we're on the board
            const currentSpace: T = state.getPieceAt(coord.get());
            const currentOwner: PlayerOrNone = this.getOwner(currentSpace, state);
            if (currentOwner === opponent) {
                return { freeSpaces, alignedPlayers };
            }
            if (currentOwner === player && allPlayersAreSideBySide) {
                alignedPlayers.push(coord.get());
            } else {
                allPlayersAreSideBySide = false; // we stop counting the allies on this line
            }
            // as soon as there is a free space
            if (currentOwner !== opponent && currentOwner !== player) {
                freeSpaces.push(coord.get());
            }
            coord = this.getNextCoord(coord.get(), dir);
            testedCoords++;
        }
        return { freeSpaces, alignedPlayers };
    }

    protected getNextCoord(coord: Coord, dir: Direction, distance: number = 1): MGPOptional<Coord> {
        return MGPOptional.of(coord.getNext(dir, distance));
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
