import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { TaflState } from '../TaflRules';

export class BrandhubState extends TaflState {

    public static getInitialState(): BrandhubState {
        const _: TaflPawn = TaflPawn.UNOCCUPIED;
        const x: TaflPawn = TaflPawn.INVADERS;
        const i: TaflPawn = TaflPawn.DEFENDERS;
        const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
        const board: Table<TaflPawn> = [
            [_, _, _, x, _, _, _],
            [_, _, _, x, _, _, _],
            [_, _, _, i, _, _, _],
            [x, x, i, A, i, x, x],
            [_, _, _, i, _, _, _],
            [_, _, _, x, _, _, _],
            [_, _, _, x, _, _, _],
        ];
        return new BrandhubState(board, 0);
    }
    public from(board: Table<TaflPawn>, turn: number): this { // TODOTODO stonkey poop
        return new BrandhubState(board, turn) as this;
    }
    public isCentralThrone(c: Coord): boolean {
        return (c.x === 3 && c.y === 3);
    }
}
