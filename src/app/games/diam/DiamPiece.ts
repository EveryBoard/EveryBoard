import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { Player } from 'src/app/jscaip/Player';

export class DiamPiece {
    public static encoder: NumberEncoder<DiamPiece> = NumberEncoder.tuple(
        [Player.numberEncoder, NumberEncoder.booleanEncoder],
        (piece: DiamPiece): [Player, boolean] => [piece.owner, piece.otherPieceType],
        (fields: [Player, boolean]): DiamPiece => DiamPiece.of(fields[0], fields[1]),
    );

    public static EMPTY: DiamPiece = new DiamPiece(Player.NONE, false);
    public static ZERO_FIRST: DiamPiece = new DiamPiece(Player.ZERO, false);
    public static ZERO_SECOND: DiamPiece = new DiamPiece(Player.ZERO, true);
    public static ONE_FIRST: DiamPiece = new DiamPiece(Player.ONE, false);
    public static ONE_SECOND: DiamPiece = new DiamPiece(Player.ONE, true);

    public static PLAYER_PIECES: DiamPiece[] = [
        DiamPiece.ZERO_FIRST,
        DiamPiece.ZERO_SECOND,
        DiamPiece.ONE_FIRST,
        DiamPiece.ONE_SECOND,
    ];

    public static of(player: Player, otherPieceType: boolean): DiamPiece {
        if (player === Player.ZERO) {
            if (otherPieceType) return DiamPiece.ZERO_SECOND;
            return DiamPiece.ZERO_FIRST;
        } else if (player === Player.ONE) {
            if (otherPieceType) return DiamPiece.ONE_SECOND;
            return DiamPiece.ONE_FIRST;
        }
        return DiamPiece.EMPTY;
    }
    private constructor(public readonly owner: Player,
                        public readonly otherPieceType: boolean) {
    }

    public toString(): string {
        return `DiamPiece(${this.owner}, ${this.otherPieceType})`;
    }
}

