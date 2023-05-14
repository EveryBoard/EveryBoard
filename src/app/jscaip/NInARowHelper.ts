import { assert } from '../utils/assert';
import { MGPMap } from '../utils/MGPMap';
import { Coord } from './Coord';
import { Direction } from './Direction';
import { GameStateWithTable } from './GameStateWithTable';
import { MGPNode } from './MGPNode';
import { Player, PlayerOrNone } from './Player';
import { SCORE } from './SCORE';

export class NInARowHelper<T> {

    public constructor(public isInRange: (coord: Coord) => boolean,
                       public getOwner: (piece: T) => PlayerOrNone,
                       public N: number)
    {
    }
    public getSquareScore(state: GameStateWithTable<T>, coord: Coord): number {
        const piece: T = state.getPieceAt(coord);
        const ally: Player = this.getOwner(piece) as Player;
        assert(ally.isPlayer(), 'getSquareScore should not be called with PlayerOrNone.NONE piece');

        const freeSpaceByDirs: MGPMap<Direction, number> = new MGPMap();
        const alliesByDirs: MGPMap<Direction, number> = new MGPMap();

        for (const dir of Direction.DIRECTIONS) {
            const freeSpaceAndAllies: [number, number] = this.getNumberOfFreeSpacesAndAllies(state, coord, dir, ally);
            freeSpaceByDirs.set(dir, freeSpaceAndAllies[0]);
            alliesByDirs.set(dir, freeSpaceAndAllies[1]);
        }
        const score: number = this.getScoreFromDirectionAlliesAndFreeSpaces(alliesByDirs, freeSpaceByDirs);
        return score * ally.getScoreModifier();
    }
    public getScoreFromDirectionAlliesAndFreeSpaces(alliesByDirs: MGPMap<Direction, number>,
                                                    freeSpaceByDirs: MGPMap<Direction, number>)
    : number
    {
        let score: number = 0;
        for (const dir of [Direction.UP, Direction.UP_RIGHT, Direction.RIGHT, Direction.DOWN_RIGHT]) {
            // for each pair of opposite directions
            const directionAllies: number = alliesByDirs.get(dir).get();
            const oppositeDirectionAllies: number = alliesByDirs.get(dir.getOpposite()).get();
            const lineAllies: number = directionAllies + oppositeDirectionAllies;
            if (lineAllies + 1 >= this.N) {
                return Number.MAX_SAFE_INTEGER;
            }
            const directionFreeSpaces: number = freeSpaceByDirs.get(dir).get();
            const oppositeDirectionFreeSpaces: number = freeSpaceByDirs.get(dir.getOpposite()).get();
            const lineFreeSpaces: number = directionFreeSpaces + oppositeDirectionFreeSpaces;
            if (lineFreeSpaces + 1 >= this.N) {
                score += 2 + lineFreeSpaces - this.N;
            }
        }
        return score;
    }
    public getNumberOfFreeSpacesAndAllies(state: GameStateWithTable<T>,
                                          i: Coord,
                                          dir: Direction,
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
        while (this.isInRange(coord) && testedCoords < this.N) {
            // while we're on the board
            const currentSpace: T = state.getPieceAt(coord);
            if (this.getOwner(currentSpace) === opponent) {
                return [freeSpaces, allies];
            }
            if (this.getOwner(currentSpace) === ally && allAlliesAreSideBySide) {
                allies++;
            } else {
                allAlliesAreSideBySide = false; // we stop counting the allies on this line
            }
            // as soon as there is a hole
            if (currentSpace !== opponent && currentSpace !== ally) {
                freeSpaces++;
            }
            coord = coord.getNext(dir);
            testedCoords++;
        }
        return [freeSpaces, allies];
    }
    public getVictoriousCoord(state: GameStateWithTable<T>): Coord[] {
        const coords: Coord[] = [];
        for (const coordAndContents of state.getCoordsAndContents()) {
            if (this.getOwner(coordAndContents[1]).isPlayer()) {
                const coord: Coord = coordAndContents[0];
                const squareScore: number = this.getSquareScore(state, coord);
                if (MGPNode.getScoreStatus(squareScore) === SCORE.VICTORY) {
                    if (squareScore === Player.ZERO.getVictoryValue() ||
                        squareScore === Player.ONE.getVictoryValue())
                    {
                        coords.push(coord);
                    }
                }
            }
        }
        return coords;
    }
}
