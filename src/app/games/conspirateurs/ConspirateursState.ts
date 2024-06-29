import { Coord } from 'src/app/jscaip/Coord';
import { Set } from '@everyboard/lib';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { PlayerOrNoneGameStateWithTable } from 'src/app/jscaip/state/PlayerOrNoneGameStateWithTable';

export class ConspirateursState extends PlayerOrNoneGameStateWithTable {

    public static readonly WIDTH: number = 17;

    public static readonly HEIGHT: number = 17;

    public static readonly CENTRAL_ZONE_TOP_LEFT: Coord = new Coord(4, 6);

    public static readonly CENTRAL_ZONE_BOTTOM_RIGHT: Coord = new Coord(12, 10);

    private static readonly SHELTERS_INDICES: readonly number[] = [0, 1, 3, 5, 7, 8, 9, 11, 13, 15, 16];

    public static ALL_SHELTERS: Coord[] =
        new Set(ConspirateursState.SHELTERS_INDICES.flatMap((xOrY: number) => [
            new Coord(xOrY, 0),
            new Coord(xOrY, ConspirateursState.HEIGHT-1),
            new Coord(0, xOrY),
            new Coord(ConspirateursState.WIDTH-1, xOrY),
        ])).toList();

    public isShelter(coord: Coord): boolean {
        if (this.isVerticalEdge(coord)) {
            return ConspirateursState.SHELTERS_INDICES.some((y: number) => coord.y === y);
        } else if (this.isHorizontalEdge(coord)) {
            return ConspirateursState.SHELTERS_INDICES.some((x: number) => coord.x === x);
        } else {
            return false;
        }
    }

    public isCentralZone(coord: Coord): boolean {
        return ConspirateursState.CENTRAL_ZONE_TOP_LEFT.x <= coord.x &&
            coord.x <= ConspirateursState.CENTRAL_ZONE_BOTTOM_RIGHT.x &&
            ConspirateursState.CENTRAL_ZONE_TOP_LEFT.y <= coord.y &&
            coord.y <= ConspirateursState.CENTRAL_ZONE_BOTTOM_RIGHT.y;
    }

    public isDropPhase(): boolean {
        return this.turn < 40;
    }

    public getSidePieces(): PlayerNumberMap {
        if (this.turn % 2 === 0) {
            return PlayerNumberMap.of(
                20 - (this.turn / 2),
                20 - (this.turn / 2),
            );
        } else {
            // Player 0 plays on even turn, so has one less piece on odd turns
            return PlayerNumberMap.of(
                20 - ((this.turn - 1) / 2) - 1,
                20 - ((this.turn - 1) / 2),
            );
        }
    }
}
