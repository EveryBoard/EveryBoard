// import { NumberEncoder } from 'src/app/jscaip/Encoder';
// import { Player } from 'src/app/jscaip/Player';

// export class GipfPiece {
//     public static encoder: NumberEncoder<GipfPiece> = new class extends NumberEncoder<GipfPiece> {
//         public maxValue(): number {
//             // Double piece of player 1 is encoded into 3
//             return 3;
//         }
//         public encodeNumber(piece: GipfPiece): number {
//             return piece.player.value;
//         }
//         public decodeNumber(encoded: number): GipfPiece {
//             const player: Player = Player.of(encoded);
//             return GipfPiece.ofPlayer(player);
//         }
//     }
//     public static EMPTY: GipfPiece = new GipfPiece(Player.NONE);
//     public static NONE: GipfPiece = new GipfPiece()
//     public static PLAYER_ZERO: GipfPiece = new GipfPiece(Player.ZERO);
//     public static PLAYER_ONE: GipfPiece = new GipfPiece(Player.ONE);
//     public static ofPlayer(player: Player): GipfPiece {
//         if (player === Player.ZERO) {
//             return GipfPiece.PLAYER_ZERO;
//         } else if (player === Player.ONE) {
//             return GipfPiece.PLAYER_ONE;
//         } else {
//             return GipfPiece.EMPTY;
//         }
//     }
//     public equals(other: GipfPiece): boolean {
//         return this === other;
//     }
//     private constructor(public player: Player) {
//     }
// }
