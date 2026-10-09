/* eslint-disable max-lines-per-function */
import { MGPFallible } from '@everyboard/lib';

import { Coord } from '../../../jscaip/Coord';
import { TaflMove } from '../TaflMove';

export class MyTaflMove extends TaflMove {

    public static from(start: Coord, end: Coord): MGPFallible<MyTaflMove> {
        return MGPFallible.success(new MyTaflMove(start, end));
    }

    public getMaximalDistance(): number {
        return 9;
    }
}
