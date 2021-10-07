import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { KamisadoBoard } from './KamisadoBoard';
import { KamisadoColor } from './KamisadoColor';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { KamisadoPiece } from './KamisadoPiece';

export class KamisadoState extends GameStateWithTable<KamisadoPiece> {

    public constructor(turn: number,
                       // The color that needs to be played next
                       public readonly colorToPlay: KamisadoColor,
                       // The next coord that has to be played
                       public readonly coordToPlay: MGPOptional<Coord>,
                       // Did a PASS move have been performed on the last turn?
                       public readonly alreadyPassed: boolean,
                       board: Table<KamisadoPiece>)
    {
        super(ArrayUtils.copyBiArray(board), turn);
    }
    public static getInitialState(): KamisadoState {
        return new KamisadoState(0,
                                 KamisadoColor.ANY,
                                 MGPOptional.empty(),
                                 false,
                                 KamisadoBoard.INITIAL);
    }
}
