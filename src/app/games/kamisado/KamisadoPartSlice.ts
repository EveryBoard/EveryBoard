import { ArrayUtils, NumberTable } from "src/app/collectionlib/arrayutils/ArrayUtils";
import { Coord } from "src/app/jscaip/coord/Coord";
import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { KamisadoBoard } from "./KamisadoBoard";
import { KamisadoColor } from "./KamisadoColor";
import { MGPOptional } from "src/app/collectionlib/mgpoptional/MGPOptional";

export class KamisadoPartSlice extends GamePartSlice {

<<<<<<< HEAD
    public readonly colorToPlay: KamisadoColor; // The color that needs to be played next

    public readonly coordToPlay: MGPOptional<Coord>; // The next coord that has to be played

    public readonly alreadyPassed: boolean; // Did a PASS move have been performed on the last turn?

    public constructor(turn: number, colorToPlay: KamisadoColor, coordToPlay: MGPOptional<Coord>, alreadyPassed: boolean, board: NumberTable) {
=======
    public constructor(turn: number,
                       // The color that needs to be played next
                       public readonly colorToPlay: KamisadoColor,
                       // The next coord that has to be played
                       public readonly coordToPlay: MGPOptional<Coord>,
                       // Did a PASS move have been performed on the last turn?
                       public readonly alreadyPassed: boolean, board: ReadonlyArray<ReadonlyArray<number>>) {
>>>>>>> 217d3a34e76b09075b752b86152ccca23d7a7c36
        super(ArrayUtils.copyBiArray(board), turn);
    }
    public static getInitialSlice(): KamisadoPartSlice {
        return new KamisadoPartSlice(0, KamisadoColor.ANY, MGPOptional.empty(), false, ArrayUtils.mapBiArray(KamisadoBoard.INITIAL, p => p.getValue()));
    }
}
