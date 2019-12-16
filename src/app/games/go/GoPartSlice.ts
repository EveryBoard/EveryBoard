import {GamePartSlice} from '../../jscaip/GamePartSlice';
import { Coord } from 'src/app/jscaip/Coord';

export class GoPartSlice extends GamePartSlice  {

    public static readonly EMPTY: number = 0;

    public static readonly BLACK: number = 1;

    public static readonly WHITE: number = 2;

    protected board: number[][];

    private koCoord: Coord;

    public getKoCoord(): Coord {
        return this.koCoord.getCopy();
}

    public getBoardCopy(): number[][] {
        return GamePartSlice.copyBiArray(this.board);
    }

    public getCopy(): GoPartSlice {
        let copy: GoPartSlice = new GoPartSlice();
        copy.koCoord = this.koCoord.getCopy();
        copy.board = this.getBoardCopy();
        return copy;
    }
}