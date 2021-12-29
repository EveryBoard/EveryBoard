import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class ConspirateursState extends GameStateWithTable<Player> {

    public static readonly WIDTH: number = 17;

    public static readonly HEIGHT: number = 17;

    private static readonly SHELTERS_INDICES: readonly number[] = [0, 1, 3, 5, 7, 8, 9, 11, 13, 15, 16];

    public static ALL_SHELTERS: Coord[] =
        ConspirateursState.SHELTERS_INDICES.flatMap((xOrY: number) => [
            new Coord(xOrY, 0),
            new Coord(xOrY, ConspirateursState.HEIGHT-1),
            new Coord(0, xOrY),
            new Coord(ConspirateursState.WIDTH-1, xOrY),
        ]);

    public static getInitialState(): ConspirateursState {
        const board: Player[][] = ArrayUtils.createTable(ConspirateursState.WIDTH,
                                                         ConspirateursState.HEIGHT,
                                                         Player.NONE);
        return new ConspirateursState(board, 0);
    }
    public isCentralZone(coord: Coord): boolean {
        return coord.x >= 4 && coord.x <= 12 && coord.y >= 6 && coord.y <= 10;
    }
    public isDropPhase(): boolean {
        return this.turn < 40;
    }
}
