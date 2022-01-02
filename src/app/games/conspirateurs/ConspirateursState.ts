import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class ConspirateursState extends GameStateWithTable<Player> {

    public static readonly WIDTH: number = 17;

    public static readonly HEIGHT: number = 17;

    public static readonly CENTRAL_ZONE_TOP_LEFT: Coord = new Coord(4, 6);

    public static readonly CENTRAL_ZONE_BOTTOM_RIGHT: Coord = new Coord(12, 10);

    private static readonly SHELTERS_INDICES: readonly number[] = [0, 1, 3, 5, 7, 8, 9, 11, 13, 15, 16];

    public static ALL_SHELTERS: Coord[] =
        new MGPSet(ConspirateursState.SHELTERS_INDICES.flatMap((xOrY: number) => [
            new Coord(xOrY, 0),
            new Coord(xOrY, ConspirateursState.HEIGHT-1),
            new Coord(0, xOrY),
            new Coord(ConspirateursState.WIDTH-1, xOrY),
        ])).getCopy();

    public static getInitialState(): ConspirateursState {
        const board: Player[][] = ArrayUtils.createTable(ConspirateursState.WIDTH,
                                                         ConspirateursState.HEIGHT,
                                                         Player.NONE);
        return new ConspirateursState(board, 0);
    }
    public isShelter(coord: Coord): boolean {
        if (coord.x === 0 || coord.x === ConspirateursState.WIDTH-1) {
            return ConspirateursState.SHELTERS_INDICES.some((y: number) => coord.y === y);
        } else if (coord.y === 0 || coord.y === ConspirateursState.HEIGHT-1) {
            return ConspirateursState.SHELTERS_INDICES.some((x: number) => coord.x === x);
        } else {
            return false;
        }
    }
    public isCentralZone(coord: Coord): boolean {
        return coord.x >= ConspirateursState.CENTRAL_ZONE_TOP_LEFT.x &&
            coord.x <= ConspirateursState.CENTRAL_ZONE_BOTTOM_RIGHT.x &&
            coord.y >= ConspirateursState.CENTRAL_ZONE_TOP_LEFT.y &&
            coord.y <= ConspirateursState.CENTRAL_ZONE_BOTTOM_RIGHT.y;
    }
    public isDropPhase(): boolean {
        return this.turn < 40;
    }
}
