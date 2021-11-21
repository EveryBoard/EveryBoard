import { Coord } from 'src/app/jscaip/Coord';
import { TaflMove } from '../TaflMove';

export class MyTaflMove extends TaflMove {

    public static from(start: Coord, end: Coord): MyTaflMove {
        return new MyTaflMove(start, end);
    }
    public getWidth(): number {
        return 19;
    }
}
