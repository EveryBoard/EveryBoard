import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../../jscaip/Coord';
import { Table, TableUtils } from '../../jscaip/TableUtils';
import { GameStateWithTable } from '../../jscaip/state/GameStateWithTable';
import { KamisadoBoard } from './KamisadoBoard';
import { KamisadoColor } from './KamisadoColor';
import { KamisadoPiece } from './KamisadoPiece';

export class KamisadoState extends GameStateWithTable<KamisadoPiece> {

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(KamisadoBoard.SIZE, KamisadoBoard.SIZE);
    }

    public constructor(turn: number,
                       // The color that needs to be played next
                       public readonly colorToPlay: KamisadoColor,
                       // The next coord that has to be played
                       public readonly coordToPlay: MGPOptional<Coord>,
                       // Did a PASS move have been performed on the last turn?
                       public readonly alreadyPassed: boolean,
                       board: Table<KamisadoPiece>)
    {
        super(TableUtils.copy(board), turn);
    }

    public isEmptyAt(coord: Coord): boolean {
        return this.hasPieceAt(coord, KamisadoPiece.EMPTY);
    }

    public allPieceCoords(): Coord[] {
        const l: Coord[] = [];
        for (const coordAndContent of this.getCoordsAndContents()) {
            if (coordAndContent.content !== KamisadoPiece.EMPTY) {
                l.push(coordAndContent.coord);
            }
        }
        return l;
    }

}
