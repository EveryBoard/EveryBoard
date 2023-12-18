import { MGPMap } from '../utils/MGPMap';
import { Player } from './Player';

export class PlayerMap<T extends NonNullable<unknown>> extends MGPMap<Player, T> {

    public static of<T extends NonNullable<unknown>>(playerZeroValue: T, playerOneValue: T): MGPMap<Player, T> {
        return new MGPMap<Player, T>([
            { key: Player.ZERO, value: playerZeroValue },
            { key: Player.ONE, value: playerOneValue },
        ]);
    }
}
