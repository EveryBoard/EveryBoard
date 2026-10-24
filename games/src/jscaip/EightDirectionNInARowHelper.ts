import { EightDirection } from './direction/EightDirection';
import { NInARowHelper } from './NInARowHelper';
import { PlayerOrNone } from './Player';
import { GameStateWithCoords } from './state/GameStateWithCoords';

export class EightDirectionNInARowHelper<T extends NonNullable<unknown>> extends NInARowHelper<T, EightDirection> {

    public constructor(
        getOwner: (piece: T, state?: GameStateWithCoords<T>) => PlayerOrNone,
        N: number,
    ) {
        super(getOwner, N, EightDirection.EIGHT_DIRECTIONS);
    }

}
