import { MGPMap } from '../utils/MGPMap';
import { MGPOptional } from '../utils/MGPOptional';
import { Player } from './Player';
import { PlayerNumberTable } from './PlayerNumberTable';

export class PlayerMap<T extends NonNullable<unknown>> {

    public static ofValues<U extends NonNullable<unknown>>(playerZeroValue: U, playerOneValue: U): PlayerMap<U> {
        const map: MGPMap<Player, U> = new MGPMap([
            { key: Player.ZERO, value: playerZeroValue },
            { key: Player.ONE, value: playerOneValue },
        ]);
        return new PlayerMap(map);
    }

    protected constructor(protected readonly map: MGPMap<Player, T>) {}

    public makeImmutable(): void {
        return this.map.makeImmutable();
    }

    public equals(other: PlayerMap<T>): boolean {
        return this.map.equals(other.map);
    }

    public get(player: Player): T {
        return this.map.get(player).get();
    }

    public put(player: Player, value: T): T {
        return this.map.put(player, value).get();
    }

}

export class PlayerNumberMap extends PlayerMap<number> {

    public static of(playerZeroValue: number, playerOneValue: number): PlayerNumberMap {
        const map: MGPMap<Player, number> = new MGPMap([
            { key: Player.ZERO, value: playerZeroValue },
            { key: Player.ONE, value: playerOneValue },
        ]);
        return new PlayerNumberMap(map);
    }

    public add(player: Player, value: number): MGPOptional<number> {
        const oldValue: number = this.get(player);
        return this.map.put(player, oldValue + value);
    }

    public toTable(): PlayerNumberTable {
        return PlayerNumberTable.ofSingle(
            this.get(Player.ZERO),
            this.get(Player.ONE),
        );
    }

    public getCopy(): PlayerNumberMap {
        return new PlayerNumberMap(this.map.getCopy());
    }

}
