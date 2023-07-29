import { JSONValue } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { MGPFallible } from '../utils/MGPFallible';
import { Coord } from './Coord';
import { Localized } from '../utils/LocaleUtils';
import { Encoder } from '../utils/Encoder';
import { Vector } from './Vector';

export abstract class BaseDirection extends Vector {

    public override readonly x: 0|1|-1;

    public override readonly y: 0|1|-1;

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
    public override toString(): string {
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

export abstract class DirectionFactory<T extends BaseDirection> {

    public abstract all: ReadonlyArray<T>;

    public from(x: number, y: number): MGPFallible<T> {
        for (const dir of this.all) {
            if (dir.x === x && dir.y === y) return MGPFallible.success(dir);
        }
        return MGPFallible.failure('Invalid x and y in direction construction');
    }
    public fromDelta(dx: number, dy: number): MGPFallible<T> {
        if (dx === 0 && dy === 0) {
            return MGPFallible.failure('Empty delta for direction');
        } else if (Math.abs(dx) === Math.abs(dy) ||
                   dx === 0 ||
                   dy === 0)
        {
            return this.from(Math.sign(dx), Math.sign(dy));
        }
        return MGPFallible.failure(DirectionFailure.DIRECTION_MUST_BE_LINEAR());
    }
    public fromMove(start: Coord, end: Coord): MGPFallible<T> {
        return this.fromDelta(end.x - start.x, end.y - start.y);
    }
    public fromString(str: string): MGPFallible<T> {
        switch (str) {
            case 'UP': return this.from(0, -1);
            case 'RIGHT': return this.from(1, 0);
            case 'DOWN': return this.from(0, 1);
            case 'LEFT': return this.from(-1, 0);
            case 'UP_LEFT': return this.from(-1, -1);
            case 'UP_RIGHT': return this.from(1, -1);
            case 'DOWN_LEFT': return this.from(-1, 1);
            case 'DOWN_RIGHT': return this.from(1, 1);
            default: return MGPFallible.failure(`Invalid direction string ${str}`);
        }
    }
    public fromInt(int: number): MGPFallible<T> {
        switch (int) {
            case 0: return this.from(0, -1);
            case 1: return this.from(1, 0);
            case 2: return this.from(0, 1);
            case 3: return this.from(-1, 0);
            case 4: return this.from(-1, -1);
            case 5: return this.from(1, -1);
            case 6: return this.from(-1, 1);
            case 7: return this.from(1, 1);
            default: return MGPFallible.failure(`Invalid int direction: ${int}`);
        }
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

    public static readonly DIAGONALS: ReadonlyArray<Direction> = [
        Direction.UP_RIGHT,
        Direction.DOWN_RIGHT,
        Direction.DOWN_LEFT,
        Direction.UP_LEFT,
    ];
    public static readonly ORTHOGONALS: ReadonlyArray<Direction> = [
        Direction.UP,
        Direction.RIGHT,
        Direction.DOWN,
        Direction.LEFT,
    ];
    public static readonly encoder: Encoder<Direction> = Encoder.fromFunctions(
        (dir: Direction): string => {
            return dir.toString();
        },
        (encoded: JSONValue): Direction => {
            assert(typeof encoded === 'string', 'Invalid encoded direction');
            const fromString: MGPFallible<Direction> = Direction.factory.fromString(encoded as string);
            return fromString.get();
        },
    );
    private constructor(x: 0|1|-1, y: 0|1|-1) {
        super(x, y);
    }
    public isDiagonal(): boolean {
        return (this.x !== 0) && (this.y !== 0);
    }
    public getOpposite(): Direction {
        const opposite: MGPFallible<Direction> = Direction.factory.from(-this.x, -this.y);
        return opposite.get();
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

            public override from(x: number, y: number): MGPFallible<Orthogonal> {
                if (x === 0 && y === -1) return MGPFallible.success(Orthogonal.UP);
                if (x === 1 && y === 0) return MGPFallible.success(Orthogonal.RIGHT);
                if (x === 0 && y === 1) return MGPFallible.success(Orthogonal.DOWN);
                if (x === -1 && y === 0) return MGPFallible.success(Orthogonal.LEFT);
                return MGPFallible.failure('Invalid orthogonal from x and y');
            }
        };
    public static readonly ORTHOGONALS: ReadonlyArray<Orthogonal> = Orthogonal.factory.all;

    public static readonly encoder: Encoder<Orthogonal> = Encoder.fromFunctions(
        (dir: Orthogonal): string => {
            return dir.toString();
        },
        (encoded: JSONValue): Orthogonal => {
            assert(typeof encoded === 'string', 'Invalid encoded orthogonal');
            const fromString: MGPFallible<Orthogonal> = Orthogonal.factory.fromString(encoded as string);
            return fromString.get();
        },
    );

    private constructor(x: 0|1|-1, y: 0|1|-1) {
        super(x, y);
    }
    public getOpposite(): Orthogonal {
        const opposite: MGPFallible<Orthogonal> = Orthogonal.factory.from(-this.x, -this.y);
        return opposite.get();
    }
    public rotateClockwise(): Orthogonal {
        const rotated: MGPFallible<Orthogonal> = Orthogonal.factory.from(-this.y, this.x);
        return rotated.get();
    }
}

export class DirectionFailure {

    public static readonly DIRECTION_MUST_BE_LINEAR: Localized = () => $localize`You must move in a straight line! You can only move orthogonally or diagonally!`;
}
