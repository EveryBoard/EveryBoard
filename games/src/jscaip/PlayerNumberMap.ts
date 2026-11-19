import { MGPOptional } from '@everyboard/lib';

import { Player } from './Player';
import { PlayerMap } from './PlayerMap';
import { PlayerNumberTable } from './PlayerNumberTable';

export class PlayerNumberMap extends PlayerMap<number> {

    public static of(playerZeroValue: number, playerOneValue: number): PlayerNumberMap {
        return new PlayerNumberMap(playerZeroValue, playerOneValue);
    }

    public add(player: Player, value: number): MGPOptional<number> {
        const oldValue: number = this.get(player);
        return this.map.put(player, oldValue + value);
    }

    public subtract(player: Player, value: number): MGPOptional<number> {
        const oldValue: number = this.get(player);
        return this.map.put(player, oldValue - value);
    }

    public toTable(): PlayerNumberTable {
        return PlayerNumberTable.ofSingle(
            this.get(Player.ZERO),
            this.get(Player.ONE),
        );
    }

    public override getCopy(): PlayerNumberMap {
        return PlayerNumberMap.of(this.get(Player.ZERO), this.get(Player.ONE));
    }

}
