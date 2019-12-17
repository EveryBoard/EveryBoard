import {GamePartSlice} from '../../jscaip/GamePartSlice';
import { Coord } from 'src/app/jscaip/Coord';

export enum Pawn {
    BLACK = 0, WHITE, EMPTY
}

export class GoPartSlice extends GamePartSlice {

    protected board: Pawn[][];

    private koCoord: Coord;

    private captured: number[];

    public constructor(board: Pawn[][], captured: number[], turn: number, koCoord: Coord) {
        super(board, turn);
        this.captured = captured;
        this.koCoord = koCoord;
    }

    public getKoCoordCopy(): Coord {
        return this.koCoord.getCopy();
    }

    public getCapturedCopy(): number[] {
        return [this.captured[0], this.captured[1]];
    }

    public getCopy(): GoPartSlice {
        let koCoordCopy: Coord = this.koCoord.getCopy();
        let capturedCopy: number[] = GamePartSlice.copyArray(this.captured);
        let boardCopy: Pawn[][] = this.getCopiedBoard();
        return new GoPartSlice(boardCopy, capturedCopy, this.turn, koCoordCopy);
    }

    public static getStartingBoard(): Pawn[][] {
        return GamePartSlice.createBiArray(GoPartSlice.WIDTH, GoPartSlice.HEIGHT, Pawn.EMPTY);
    }

    public static readonly WIDTH: number = 19;

    public static readonly HEIGHT: number = 19;
}