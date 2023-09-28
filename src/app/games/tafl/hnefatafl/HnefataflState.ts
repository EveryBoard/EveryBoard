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
// //////////////////////////////////////////////////////////////////////
//       //       DUMB LINEAR TAFL       //      SMART LINEAR TAFL     //
// //////////////////////////////////////////////////////////////////////
//  7x7  // (1)                         // (1)                         //
//       //        . . . X . . .        //        . . . X . . .        //
//       //        . . . X . . .        //        . . . X . . .        //
//       //        . . . O . . .        //        . . . O . . .        //
//       //        X X O O O X X        //        X X O O O X X        //
//       //        . . . O . . .        //        . . . O . . .        //
//       //        . . . X . . .        //        . . . X . . .        //
//       //        . . . X . . .        //        . . . X . . .        //
//       //                             //                             //
// //////////////////////////////////////////////////////////////////////
//       //                             // (2)                         //
//  9x9  //                             //      . . . X X X . . .      //
//       //                             //      . . . . X . . . .      //
//       //                             //      . . . . O . . . .      //
//       //                             //      X . . . O . . . X      //
//       //                             //      X X O O O O O X X      //
//       //                             //      X . . . O . . . X      //
//       //                             //      . . . . O . . . .      //
//       //                             //      . . . . X . . . .      //
//       //                             //      . . . X X X . . .      //
//       //                             //                             //
// //////////////////////////////////////////////////////////////////////
//       //                             // (3)                         //
// 11x11 //                             //    . . . X X X X X . . .    //
//       //                             //    . . . . . X . . . . .    //
//       //                             //    . . . . . O . . . . .    //
//       //                             //    X . . . . O . . . . X    //
//       //                             //    X . . . . O . . . . X    //
//       //                             //    X X O O O O O O O X X    //
//       //                             //    X . . . . O . . . . X    //
//       //                             //    X . . . . O . . . . X    //
//       //                             //    . . . . . O . . . . .    //
//       //                             //    . . . . . X . . . . .    //
//       //                             //    . . . X X X X X . . .    //
//       //                             //                             //
// //////////////////////////////////////////////////////////////////////
//       // (2)                         // (4)                         //
// 13x13 //  . . . . . . X . . . . . .  //  . . . X X X X X X X . . .  //
//       //  . . . . . . X . . . . . .  //  . . . . . . X . . . . . .  //
//       //  . . . . . . X . . . . . .  //  . . . . . . O . . . . . .  //
//       //  . . . . . . X . . . . . .  //  X . . . . . O . . . . . X  //
//       //  . . . . . . O . . . . . .  //  X . . . . . O . . . . . X  //
//       //  . . . . . . O . . . . . .  //  X . . . . . O . . . . . X  //
//       //  X X X X O O O O O X X X X  //  X X O O O O O O O O O X X  //
//       //  . . . . . . O . . . . . .  //  X . . . . . O . . . . . X  //
//       //  . . . . . . O . . . . . .  //  X . . . . . O . . . . . X  //
//       //  . . . . . . X . . . . . .  //  X . . . . . O . . . . . X  //
//       //  . . . . . . X . . . . . .  //  X . . . . . O . . . . . X  //
//       //  . . . . . . X . . . . . .  //  . . . . . . X . . . . . .  //
//       //  . . . . . . X . . . . . .  //  . . . X X X X X X X . . .  //
//       //                             //                             //
// //////////////////////////////////////////////////////////////////////

// Minimal pattern evolutions for Attacker
//
//
// 2a                   2b
// . . . X . X . . .    . . . X . . .
//                      . . . X . . .
//
// 4a                   4b
// . . . X X X . . .    . . . . . X . . . . .
// . . . . X . . . .    . . . . . X . . . . .
//                      . . . . . X . . . . .
//                      . . . . . X . . . . .

// 6a                       6b                       6c       6d       6e       6f
// . . . X X X X X . . .    . . . . X X X . . . .    that     X X X    X X X    X . X
// . . . . . X . . . . .    . . . . . X . . . . .    too      X X X    X . X    X X X
//                          . . . . . X . . . . .    long              . X .    . X .
//                          . . . . . X . . . . .    6 line
