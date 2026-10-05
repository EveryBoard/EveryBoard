import { NInARowHelper } from './NInARowHelper';
import { Ordinal } from './Ordinal';
import { PlayerOrNone } from './Player';
import { GameStateWithCoords } from './state/GameStateWithCoords';

export class OrdinalNInARowHelper<T extends NonNullable<unknown>> extends NInARowHelper<T, Ordinal> {

    public constructor(
        getOwner: (piece: T, state?: GameStateWithCoords<T>) => PlayerOrNone,
        N: number,
    ) {
        super(getOwner, N, Ordinal.ORDINALS);
    }

}
