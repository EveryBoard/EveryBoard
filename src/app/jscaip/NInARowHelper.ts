import { assert } from '../utils/assert';
import { MGPMap } from '../utils/MGPMap';
import { Coord } from './Coord';
import { Direction } from './Direction';
import { GameStateWithTable } from './GameStateWithTable';
import { Player, PlayerOrNone } from './Player';

export class NInARowHelper {

    public static readonly VERBOSE: boolean = false;

    public static getSquareScore<T>(
        state: GameStateWithTable<T>,
        coord: Coord,
        getOwner: (piece: T) => PlayerOrNone,
        N: number,
        isInRange: (coord: Coord) => boolean,
    ): number
    {
        let score: number = 0; // final result, count the theoretical victorys possibility

        const piece: T = state.getPieceAt(coord);
        const ally: Player = getOwner(piece) as Player;
        assert(ally.isPlayer(), 'getSquareScore should not be called with PlayerOrNone.NONE piece');
        const opponent: Player = ally.getOpponent();

        const distByDirs: MGPMap<Direction, number> = new MGPMap();
        const alliesByDirs: MGPMap<Direction, number> = new MGPMap();

        for (const dir of Direction.DIRECTIONS) {
            const tmpData: [number, number] = NInARowHelper.getNumberOfFreeSpacesAndAllies(
                state,
                coord,
                dir,
                opponent,
                ally,
                N,
                isInRange,
                getOwner,
            );
            distByDirs.set(dir, tmpData[0]);
            alliesByDirs.set(dir, tmpData[1]);
        }

        for (const dir of [Direction.UP, Direction.UP_RIGHT, Direction.RIGHT, Direction.DOWN_RIGHT]) {
            // for each pair of opposite directions
            const lineAllies: number = alliesByDirs.get(dir).get() + alliesByDirs.get(dir.getOpposite()).get();
            if (lineAllies + 1 > N) {
                return ally.getVictoryValue();
            }

            const lineDist: number = distByDirs.get(dir).get() + distByDirs.get(dir.getOpposite()).get();
            if (lineDist === 3) {
                score += 2;
            } else if (lineDist > 3) {
                score += lineDist - 2;
            }
        }
        return score * ally.getScoreModifier();
    }
    public static getNumberOfFreeSpacesAndAllies<T>(
        state: GameStateWithTable<T>,
        i: Coord,
        dir: Direction,
        opponent: Player,
        ally: Player,
        N: number,
        isInRange: (coord: Coord) => boolean,
        getOwner: (piece: T) => PlayerOrNone)
    : [number, number]
    {
        /*
        * for a square i(iX, iY) containing an ally
        * we go through the board from i in the direction dir(dX, dY)
        * and until a maximal distance of N cases
        */

        let freeSpaces: number = 0; // the number of aligned free square
        let allies: number = 0; // the number of alligned allies
        let allAlliesAreSideBySide: boolean = true;
        let coord: Coord = new Coord(i.x + dir.x, i.y + dir.y);
        while (isInRange(coord) && freeSpaces !== N) {
            // while we're on the board
            const currentSpace: T = state.getPieceAt(coord);
            if (getOwner(currentSpace) === opponent) {
                return [freeSpaces, allies];
            }
            if (getOwner(currentSpace) === ally && allAlliesAreSideBySide) {
                allies++;
            } else {
                allAlliesAreSideBySide = false; // we stop counting the allies on this line
            }
            // as soon as there is a hole
            if (currentSpace !== opponent && currentSpace !== ally) {
                // TODO: this condition was not there before, check that it makes sense (but the body was there)
                freeSpaces++;
            }
            coord = coord.getNext(dir);
        }
        return [freeSpaces, allies];
    }
}
