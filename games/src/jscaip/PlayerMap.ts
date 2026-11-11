import { MGPMap } from '@everyboard/lib';

import { Player } from './Player';

export class PlayerMap<T extends NonNullable<unknown>> {

    public static ofValues<U extends NonNullable<unknown>>(playerZeroValue: U, playerOneValue: U): PlayerMap<U> {
        return new PlayerMap(playerZeroValue, playerOneValue);
    }

    protected readonly map: MGPMap<Player, T>;

    protected constructor(playerZeroValue: T, playerOneValue: T) {
        this.map = new MGPMap([
            { key: Player.ZERO, value: playerZeroValue },
            { key: Player.ONE, value: playerOneValue },
        ]);
    }

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

    public set(player: Player, value: T): void {
        this.map.put(player, value);
    }

    public replace(player: Player, value: T): T {
        return this.map.replace(player, value);
    }

    public getCopy(): PlayerMap<T> {
        return new PlayerMap(this.get(Player.ZERO), this.get(Player.ONE));
    }

}
