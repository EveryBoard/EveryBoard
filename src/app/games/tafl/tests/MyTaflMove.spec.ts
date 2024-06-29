/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { TaflMove } from '../TaflMove';
import { MGPFallible } from '@everyboard/lib';

export class MyTaflMove extends TaflMove {

    public static from(start: Coord, end: Coord): MGPFallible<MyTaflMove> {
        return MGPFallible.success(new MyTaflMove(start, end));
    }

    public getMaximalDistance(): number {
        return 9;
    }
}
