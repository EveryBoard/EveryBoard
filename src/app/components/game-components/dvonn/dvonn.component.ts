import { AbstractGameComponent } from '../AbstractGameComponent';
import { ArrayUtils } from 'src/app/collectionlib/arrayutils/ArrayUtils';
import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { DvonnBoard } from 'src/app/games/dvonn/DvonnBoard';
import { DvonnMove } from 'src/app/games/dvonn/dvonnmove/DvonnMove';
import { DvonnPartSlice } from 'src/app/games/dvonn/DvonnPartSlice';
import { DvonnPiece } from 'src/app/games/dvonn/DvonnPiece';
import { DvonnRules } from 'src/app/games/dvonn/dvonnrules/DvonnRules';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/Player';

@Component({
    selector: 'app-dvonn',
    templateUrl: './dvonn.component.html'
})

export class DvonnComponent extends AbstractGameComponent<DvonnMove, DvonnPartSlice, LegalityStatus> {
    public rules = new DvonnRules(DvonnPartSlice.getStartingSlice(ArrayUtils.mapBiArray(DvonnBoard.getBalancedBoard(), p => p.getValue())));

    public updateBoard() {
        throw new Error("NYI");
    }

    public pass(): boolean {
        throw new Error("NYI");
    }

    public onClick(x: number, y: number): boolean {
        throw new Error("NYI");
    }

    public decodeMove(encodedMove: number): DvonnMove {
        return DvonnMove.decode(encodedMove);
    }

    public encodeMove(move: DvonnMove): number {
        return DvonnMove.encode(move);
    }

}
