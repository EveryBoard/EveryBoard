import { ArrayUtils, NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { KamisadoBoard } from './KamisadoBoard';
import { KamisadoColor } from './KamisadoColor';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';

export class KamisadoPartSlice extends GamePartSlice {
    public constructor(turn: number,
                       // The color that needs to be played next
                       public readonly colorToPlay: KamisadoColor,
                       // The next coord that has to be played
                       public readonly coordToPlay: MGPOptional<Coord>,
                       // Did a PASS move have been performed on the last turn?
                       public readonly alreadyPassed: boolean,
                       board: NumberTable) {
        super(ArrayUtils.copyBiArray(board), turn);
    }
    public static getInitialSlice(): KamisadoPartSlice {
        return new KamisadoPartSlice(0, KamisadoColor.ANY, MGPOptional.empty(), false, ArrayUtils.mapBiArray(KamisadoBoard.INITIAL, (p) => p.getValue()));
    }
}
