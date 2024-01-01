import { MGPMap } from '../utils/MGPMap';
import { MGPOptional } from '../utils/MGPOptional';
import { Player } from './Player';

export class PlayerMap<T extends NonNullable<unknown>> extends MGPMap<Player, T> {

}

export class PlayerNumberMap extends MGPMap<Player, number> {

    public static of(playerZeroValue: number, playerOneValue: number): PlayerNumberMap {
        return new PlayerNumberMap([
            { key: Player.ZERO, value: playerZeroValue },
            { key: Player.ONE, value: playerOneValue },
        ]);
    }

    public add(player: Player, value: number): MGPOptional<number> { // TODO: REUSE
        const oldValue: number = this.get(player).get();
        return this.put(player, oldValue + value);
    }

}
