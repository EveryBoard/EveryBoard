import { Direction } from '../DIRECTION';

/** Hexagonal directions encoded with axial coordinates, for "flat toped" hexagons */
export class HexaDirection {
    public static readonly UP: Direction = Direction.UP;
    public static readonly UP_LEFT: Direction = Direction.LEFT;
    public static readonly UP_RIGHT: Direction = Direction.UP_RIGHT;
    public static readonly DOWN_LEFT: Direction = Direction.DOWN_LEFT;
    public static readonly DOWN_RIGHT: Direction = Direction.RIGHT;
    public static readonly DOWN: Direction = Direction.DOWN;
}
