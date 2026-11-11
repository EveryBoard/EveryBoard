import { ArrayUtils, MGPOptional } from '@everyboard/lib';

import { Player } from './Player';
import { PlayerMap } from './PlayerMap';

export class PlayerNumberTable extends PlayerMap<ReadonlyArray<number>> {

    public constructor(playerZero: ReadonlyArray<number> = [], playerOne: ReadonlyArray<number> = []) {
        super(playerZero, playerOne);
    }

    public static of(playerZero: ReadonlyArray<number>, playerOne: ReadonlyArray<number>): PlayerNumberTable {
        return new PlayerNumberTable(playerZero, playerOne);
    }

    public static ofSingle(playerZero: number, playerOne: number): PlayerNumberTable {
        return PlayerNumberTable.of([playerZero], [playerOne]);
    }

    public add(player: Player, index: number, value: number): MGPOptional<readonly number[]> {
        const list: number[] = ArrayUtils.copy(this.get(player));
        list[index] += value;
        return MGPOptional.of(this.put(player, list));
    }

    public override set(player: Player, value: ReadonlyArray<number>): void {
        this.put(player, value);
    }

    public concat(other: PlayerNumberTable): PlayerNumberTable {
        return PlayerNumberTable.of(
            this.get(Player.ZERO).concat(other.get(Player.ZERO)),
            this.get(Player.ONE).concat(other.get(Player.ONE)),
        );
    }

}
