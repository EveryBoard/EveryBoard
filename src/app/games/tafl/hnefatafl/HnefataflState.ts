import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { TaflState } from '../TaflState';
import { TaflConfig } from '../TaflConfig';

export class HnefataflState extends TaflState {

    public static getInitialState(rulesConfig: TaflConfig): HnefataflState {
        const _: TaflPawn = TaflPawn.UNOCCUPIED;
        let I: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
        let D: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
        let K: TaflPawn = TaflPawn.PLAYER_ONE_KING;
        if (rulesConfig.invaderStarts === false) {
            I = TaflPawn.PLAYER_ONE_PAWN;
            D = TaflPawn.PLAYER_ZERO_PAWN;
            K = TaflPawn.PLAYER_ZERO_KING;
        }
        const board: Table<TaflPawn> = [
            [_, _, _, I, I, I, I, I, _, _, _],
            [_, _, _, _, _, I, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [I, _, _, _, _, D, _, _, _, _, I],
            [I, _, _, _, D, D, D, _, _, _, I],
            [I, I, _, D, D, K, D, D, _, I, I],
            [I, _, _, _, D, D, D, _, _, _, I],
            [I, _, _, _, _, D, _, _, _, _, I],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, I, _, _, _, _, _],
            [_, _, _, I, I, I, I, I, _, _, _],
        ];
        return new HnefataflState(board, 0);
    }
    public of(board: Table<TaflPawn>, turn: number): this {
        return new HnefataflState(board, turn) as this;
    }
}
