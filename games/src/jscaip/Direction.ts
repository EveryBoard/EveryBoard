import { Vector } from '@everyboard/games';

import { Localized } from '../utils/LocaleUtils';


export abstract class Direction extends Vector {

    public declare readonly x: number;

    public declare readonly y: number;

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

    public abstract getAngle(): number;

    public abstract getOpposite(): this;

}

export class DirectionFailure {

    public static readonly DIRECTION_MUST_BE_LINEAR: Localized = () => $localize`You must move in a straight line! You can only move orthogonally or diagonally!`;

}
