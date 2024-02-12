import { MGPMap } from '../utils/MGPMap';
import { MGPOptional } from '../utils/MGPOptional';
import { Player } from './Player';
import { PlayerNumberTable } from './PlayerNumberTable';

export class PlayerMap<T extends NonNullable<unknown>> extends MGPMap<Player, T> {

    public static of<T extends NonNullable<unknown>>(playerZeroValue: T, playerOneValue: T): PlayerMap<T> {
        const map: MGPMap<Player, T> = new MGPMap([
            { key: Player.ZERO, value: playerZeroValue },
            { key: Player.ONE, value: playerOneValue },
        ]);
        return map;
    }

}

export class PlayerNumberMap {

    public static of(playerZeroValue: number, playerOneValue: number): PlayerNumberMap {
        const map: MGPMap<Player, number> = new MGPMap([
            { key: Player.ZERO, value: playerZeroValue },
            { key: Player.ONE, value: playerOneValue },
        ]);
        return new PlayerNumberMap(map);
    }

    private constructor(private readonly map: MGPMap<Player, number>) {}

    public makeImmutable(): void {
        return this.map.makeImmutable();
    }

    public equals(other: PlayerNumberMap): boolean {
        return this.map.equals(other.map);
    }

    public getCopy(): PlayerNumberMap {
        return new PlayerNumberMap(this.map.getCopy());
    }

    public get(player: Player): number {
        return this.map.get(player).get();
    }

    public put(player: Player, value: number): number {
        return this.map.put(player, value).get();
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

}
