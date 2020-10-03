import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";
import { KamisadoBoard } from "./KamisadoBoard";
import { KamisadoColor } from "./KamisadoColor";
import { KamisadoPiece } from "./KamisadoPiece";

export class KamisadoPartSlice extends GamePartSlice {
    public readonly colorToPlay: KamisadoColor;
    public constructor(turn: number, colorToPlay: KamisadoColor, board: ReadonlyArray<ReadonlyArray<number>>) {
        super(ArrayUtils.copyBiArray(board), turn);
        this.colorToPlay = colorToPlay;
    }

    public static EMPTY: number = -1;
    public static getStartingSlice(): KamisadoPartSlice {
        return new KamisadoPartSlice(0, KamisadoColor.ANY, ArrayUtils.mapBiArray(KamisadoBoard.INITIAL, p => p.getValue()));
    }

    public getPieceAt(x: number, y: number): KamisadoPiece {
        return KamisadoPiece.of(this.getBoardByXY(x, y));
    }
    public isEmptyAt(x: number, y: number): boolean {
        return this.getPieceAt(x, y).equals(KamisadoPiece.NONE);
    }
}