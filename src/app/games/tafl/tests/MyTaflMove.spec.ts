/* eslint-disable max-lines-per-function */
import { Coord } from '@everyboard/games';
import { MGPFallible } from '@everyboard/lib';

import { TaflMove } from '../TaflMove';

export class MyTaflMove extends TaflMove {

    public static from(start: Coord, end: Coord): MGPFallible<MyTaflMove> {
        return MGPFallible.success(new MyTaflMove(start, end));
    }

    public getMaximalDistance(): number {
        return 9;
    }
}
