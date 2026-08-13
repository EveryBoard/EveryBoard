import { MGPFallible } from '@everyboard/lib';

import { Coord } from './Coord';
import { Direction, DirectionFailure } from './Direction';

// TODO: SNOW BALL PR "One class per file" ?
export abstract class DirectionFactory<T extends Direction> {

    public abstract all: ReadonlyArray<T>;

    public from(x: number, y: number): MGPFallible<T> {
        for (const dir of this.all) {
            if (dir.x === x && dir.y === y) return MGPFallible.success(dir);
        }
        return MGPFallible.failure('Invalid x or y in direction construction');
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
