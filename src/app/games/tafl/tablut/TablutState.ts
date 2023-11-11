import { TaflPawn } from '../TaflPawn';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflState } from '../TaflState';
import { TaflConfig } from '../TaflConfig';

export class TablutState extends TaflState {

    public static getInitialState(config: TaflConfig): TablutState {
        const _: TaflPawn = TaflPawn.UNOCCUPIED;
        let I: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
        let D: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
        let K: TaflPawn = TaflPawn.PLAYER_ONE_KING;
        if (config.invaderStarts === false) {
            I = TaflPawn.PLAYER_ONE_PAWN;
            D = TaflPawn.PLAYER_ZERO_PAWN;
            K = TaflPawn.PLAYER_ZERO_KING;
        }
        const board: Table<TaflPawn> = [
            [_, _, _, I, I, I, _, _, _],
            [_, _, _, _, I, _, _, _, _],
            [_, _, _, _, D, _, _, _, _],
            [I, _, _, _, D, _, _, _, I],
            [I, I, D, D, K, D, D, I, I],
            [I, _, _, _, D, _, _, _, I],
            [_, _, _, _, D, _, _, _, _],
            [_, _, _, _, I, _, _, _, _],
            [_, _, _, I, I, I, _, _, _],
        ];

        return new TablutState(board, 0);
    }

    public of(board: Table<TaflPawn>, turn: number): this {
        return new TablutState(board, turn) as this;
    }

}
