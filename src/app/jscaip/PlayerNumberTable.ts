import { MGPOptional } from '../utils/MGPOptional';
import { Player } from './Player';
import { ArrayUtils } from '../utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';


export class PlayerNumberTable extends MGPMap<Player, ReadonlyArray<number>> {

    public static of(playerZero: ReadonlyArray<number>, playerOne: ReadonlyArray<number>): PlayerNumberTable {
        return new PlayerNumberTable([
            { key: Player.ZERO, value: playerZero },
            { key: Player.ONE, value: playerOne },
        ]);
    }

    public static ofSingle(playerZero: number, playerOne: number): PlayerNumberTable {
        return PlayerNumberTable.of(
            [playerZero],
            [playerOne],
        );
    }

    public add(player: Player, index: number, value: number): MGPOptional<readonly number[]> {
        const list: number[] = ArrayUtils.copy(this.get(player).get());
        list[index] += value;
        return this.put(player, list);
    }

    public concat(other: PlayerNumberTable): PlayerNumberTable {
        const playerZeroStart: readonly number[] = this.get(Player.ZERO).get();
        const playerOneStart: readonly number[] = this.get(Player.ONE).get();
        const playerZeroEnd: readonly number[] = other.get(Player.ZERO).get();
        const playerOneEnd: readonly number[] = other.get(Player.ONE).get();
        return PlayerNumberTable.of(
            playerZeroStart.concat(playerZeroEnd),
            playerOneStart.concat(playerOneEnd),
        );

    }

}
