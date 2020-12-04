import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";
import { Coord } from "src/app/jscaip/coord/Coord";
import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { KamisadoBoard } from "./KamisadoBoard";
import { KamisadoColor } from "./KamisadoColor";
import { KamisadoPiece } from "./KamisadoPiece";
import { MGPOptional } from "src/app/collectionlib/mgpoptional/MGPOptional";

export class KamisadoPartSlice extends GamePartSlice {

    public readonly colorToPlay: KamisadoColor; // The color that needs to be played next

    public readonly coordToPlay: MGPOptional<Coord>; // The next coord that has to be played

    public readonly alreadyPassed: boolean; // Did a PASS move have been performed on the last turn?

    public constructor(turn: number, colorToPlay: KamisadoColor, coordToPlay: MGPOptional<Coord>, alreadyPassed: boolean, board: ReadonlyArray<ReadonlyArray<number>>) {
        super(ArrayUtils.copyBiArray(board), turn);
        this.colorToPlay = colorToPlay;
        this.coordToPlay = coordToPlay;
        this.alreadyPassed = alreadyPassed;
    }
    public static getInitialSlice(): KamisadoPartSlice {
        return new KamisadoPartSlice(0, KamisadoColor.ANY, MGPOptional.empty(), false, ArrayUtils.mapBiArray(KamisadoBoard.INITIAL, p => p.getValue()));
    }
}
