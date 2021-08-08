import { assert, JSONValue } from 'src/app/utils/utils';
import { ComparableObject } from '../utils/Comparable';
import { MGPCanFail } from '../utils/MGPCanFail';
import { Coord } from './Coord';
import { Encoder } from './Encoder';


export class Vector implements ComparableObject {
    public equals(other: Vector): boolean {
        return this.x === other.x && this.y === other.y;
    }
    public constructor(public readonly x: number,
                       public readonly y: number) {}
}

abstract class AbstractDirection extends Vector {
    public readonly x: -1|0|1;
    public readonly y: -1|0|1;
}

export abstract class DirectionFactory<T extends AbstractDirection> {

    public abstract all: ReadonlyArray<NonNullable<T>>;

    public of(x: number, y: number): MGPCanFail<T> {
        for (const dir of this.all) {
            if (dir.x === x && dir.y === y) return MGPCanFail.success(dir);
        }
        return MGPCanFail.failure('Invalid x and y in direction construction');
    }
    public fromDelta(dx: number, dy: number): MGPCanFail<T> {
        if (dx === 0 && dy === 0) {
            return MGPCanFail.failure('Empty delta for direction');
        } else if (Math.abs(dx) === Math.abs(dy) ||
                   dx === 0 ||
                   dy === 0)
        {
            return this.of(Math.sign(dx), Math.sign(dy));
        }
        return MGPCanFail.failure('Invalid delta for direction');
    }
    public fromMove(start: Coord, end: Coord): MGPCanFail<T> {
        return this.fromDelta(end.x - start.x, end.y - start.y);
    }
    public fromString(str: string): MGPCanFail<T> {
        switch (str) {
            case 'UP': return this.of(0, -1);
            case 'RIGHT': return this.of(1, 0);
            case 'DOWN': return this.of(0, 1);
            case 'LEFT': return this.of(-1, 0);
            case 'UP_LEFT': return this.of(-1, -1);
            case 'UP_RIGHT': return this.of(1, -1);
            case 'DOWN_LEFT': return this.of(-1, 1);
            case 'DOWN_RIGHT': return this.of(1, 1);
            default: return MGPCanFail.failure('Invalid string direction');
        }
    }
    public fromInt(int: number): MGPCanFail<T> {
        switch (int) {
            case 0: return this.of(0, -1);
            case 1: return this.of(1, 0);
            case 2: return this.of(0, 1);
            case 3: return this.of(-1, 0);
            case 4: return this.of(-1, -1);
            case 5: return this.of(1, -1);
            case 6: return this.of(-1, 1);
            case 7: return this.of(1, 1);
            default: return MGPCanFail.failure('Invalid int direction');
        }
    }
}

export abstract class BaseDirection extends AbstractDirection {
    public readonly x: 0|1|-1;
    public readonly y: 0|1|-1;
    public isDown(): boolean {
        return this.y === 1;
    }
    public isUp(): boolean {
        return this.y === -1;
    }
    public isLeft(): boolean {
        return this.x === -1;
    }
    public isRight(): boolean {
        return this.x === 1;
    }
    public toInt(): number {
        if (this.x === 0 && this.y === -1) return 0;
        if (this.x === 1 && this.y === 0) return 1;
        if (this.x === 0 && this.y === 1) return 2;
        if (this.x === -1 && this.y === 0) return 3;
        if (this.x === -1 && this.y === -1) return 4;
        if (this.x === 1 && this.y === -1) return 5;
        if (this.x === -1 && this.y === 1) return 6;
        else return 7;
    }
    public toString(): string {
        if (this.x === 0 && this.y === -1) return 'UP';
        if (this.x === 1 && this.y === 0) return 'RIGHT';
        if (this.x === 0 && this.y === 1) return 'DOWN';
        if (this.x === -1 && this.y === 0) return 'LEFT';
        if (this.x === -1 && this.y === -1) return 'UP_LEFT';
        if (this.x === 1 && this.y === -1) return 'UP_RIGHT';
        if (this.x === -1 && this.y === 1) return 'DOWN_LEFT';
        else return 'DOWN_RIGHT';
    }
}

export class DirectionEncoder extends Encoder<Direction> {

    public encode(dir: Direction): string {
        return dir.toString();
    }
    public decode(encoded: JSONValue): Direction {
        assert(typeof encoded === 'string', 'Invalid encoded direction');
        const fromString: MGPCanFail<Direction> = Direction.factory.fromString(encoded as string);
        assert(fromString.isSuccess(), 'Invalid encoded direction');
        return fromString.get();
    }
}

export class Direction extends BaseDirection {
    public static readonly UP: Direction = new Direction(0, -1);
    public static readonly UP_RIGHT: Direction = new Direction(1, -1);
    public static readonly RIGHT: Direction = new Direction(1, 0);
    public static readonly DOWN_RIGHT: Direction = new Direction(1, 1);
    public static readonly DOWN: Direction = new Direction(0, 1);
    public static readonly DOWN_LEFT: Direction = new Direction(-1, 1);
    public static readonly LEFT: Direction = new Direction(-1, 0);
    public static readonly UP_LEFT: Direction = new Direction(-1, -1);
    public static readonly factory: DirectionFactory<Direction> =
        new class extends DirectionFactory<Direction> {
            public all: ReadonlyArray<Direction> = [
                Direction.UP,
                Direction.UP_RIGHT,
                Direction.RIGHT,
                Direction.DOWN_RIGHT,
                Direction.DOWN,
                Direction.DOWN_LEFT,
                Direction.LEFT,
                Direction.UP_LEFT,
            ];
        };
    public static readonly DIRECTIONS: ReadonlyArray<Direction> = Direction.factory.all;

    public static readonly encoder: Encoder<Direction> = new DirectionEncoder();

    private constructor(x: 0|1|-1, y: 0|1|-1) {
        super(x, y);
    }
    public isDiagonal(): boolean {
        return (this.x !== 0) && (this.y !== 0);
    }
    public getOpposite(): Direction {
        const opposite: MGPCanFail<Direction> = Direction.factory.of(-this.x, -this.y);
        assert(opposite.isSuccess(), 'Direction has no opposite, it should not happen');
        return opposite.get();
    }
}
export class OrthogonalEncoder extends Encoder<Orthogonal> {

    public encode(dir: Orthogonal): string {
        return dir.toString();
    }
    public decode(encoded: JSONValue): Orthogonal {
        assert(typeof encoded === 'string', 'Invalid encoded orthogonal');
        const fromString: MGPCanFail<Orthogonal> = Orthogonal.factory.fromString(encoded as string);
        assert(fromString.isSuccess(), 'Invalid encoded orthogonal');
        return fromString.get();
    }
}
export class Orthogonal extends BaseDirection {
    public static readonly UP: Orthogonal = new Orthogonal(0, -1);
    public static readonly RIGHT: Orthogonal = new Orthogonal(1, 0);
    public static readonly DOWN: Orthogonal = new Orthogonal(0, 1);
    public static readonly LEFT: Orthogonal = new Orthogonal(-1, 0);
    public static readonly factory: DirectionFactory<Orthogonal> =
        new class extends DirectionFactory<Orthogonal> {
            public all: ReadonlyArray<Orthogonal> = [
                Orthogonal.UP,
                Orthogonal.RIGHT,
                Orthogonal.DOWN,
                Orthogonal.LEFT,
            ];

            public of(x: number, y: number): MGPCanFail<Orthogonal> {
                if (x === 0 && y === -1) return MGPCanFail.success(Orthogonal.UP);
                if (x === 1 && y === 0) return MGPCanFail.success(Orthogonal.RIGHT);
                if (x === 0 && y === 1) return MGPCanFail.success(Orthogonal.DOWN);
                if (x === -1 && y === 0) return MGPCanFail.success(Orthogonal.LEFT);
                return MGPCanFail.failure('Invalid orthogonal from x and y');
            }
        };
    public static readonly ORTHOGONALS: ReadonlyArray<Orthogonal> = Orthogonal.factory.all;

    public static readonly encoder: Encoder<Orthogonal> = new OrthogonalEncoder();

    private constructor(x: 0|1|-1, y: 0|1|-1) {
        super(x, y);
    }
    public getOpposite(): Orthogonal {
        const opposite: MGPCanFail<Orthogonal> = Orthogonal.factory.of(-this.x, -this.y);
        assert(opposite.isSuccess(), 'Orthogonal has no opposite, it should not happen');
        return opposite.get();
    }
}
