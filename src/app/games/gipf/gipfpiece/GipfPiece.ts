import { Encoder } from "src/app/jscaip/encoder";
import { Player } from "src/app/jscaip/player/Player";

export class GipfPiece {
    public static encoder: Encoder<GipfPiece> = new class extends Encoder<GipfPiece> {
        public encode(piece: GipfPiece): number {
            if (piece.isDouble) {
                return piece.player.value * 2 + 1;
            } else {
                return piece.player.value * 2;
            }
        }
        public decode(encoded: number): GipfPiece {
            let player: Player;
            let isDouble: boolean;
            if (encoded % 2 === 1) {
                isDouble = true;
                player = Player.of((encoded-1)/2);
            } else {
                isDouble = false;
                player = Player.of(encoded/2);
            }
            switch (player) {
                case Player.ZERO:
                    if (isDouble) {
                        return GipfPiece.PLAYER_ZERO_DOUBLE;
                    } else {
                        return GipfPiece.PLAYER_ZERO_SIMPLE;
                    }
                case Player.ONE:
                    if (isDouble) {
                        return GipfPiece.PLAYER_ONE_DOUBLE;
                    } else {
                        return GipfPiece.PLAYER_ONE_SIMPLE;
                    }

                case Player.NONE:
                    return GipfPiece.EMPTY;
            }
        }
    }
    public static EMPTY = new GipfPiece(Player.NONE, false);
    public static PLAYER_ZERO_SIMPLE = new GipfPiece(Player.ZERO, false);
    public static PLAYER_ZERO_DOUBLE = new GipfPiece(Player.ZERO, true);
    public static PLAYER_ONE_SIMPLE = new GipfPiece(Player.ONE, false);
    public static PLAYER_ONE_DOUBLE = new GipfPiece(Player.ONE, true);
    private constructor(public player: Player, public isDouble: boolean) {
    }
}
