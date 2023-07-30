import { Encoder } from 'src/app/utils/Encoder';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';

export class DiamPiece {
    public static encoder: Encoder<DiamPiece> = Encoder.tuple(
        [PlayerOrNone.encoder, Encoder.identity<boolean>()],
        (piece: DiamPiece): [PlayerOrNone, boolean] => [piece.owner, piece.otherPieceType],
        (fields: [PlayerOrNone, boolean]): DiamPiece => DiamPiece.of(fields[0], fields[1]),
    );

    public static EMPTY: DiamPiece = new DiamPiece(PlayerOrNone.NONE, false);
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

    public static of(player: PlayerOrNone, otherPieceType: boolean): DiamPiece {
        if (player === Player.ZERO) {
            if (otherPieceType) return DiamPiece.ZERO_SECOND;
            return DiamPiece.ZERO_FIRST;
        } else if (player === Player.ONE) {
            if (otherPieceType) return DiamPiece.ONE_SECOND;
            return DiamPiece.ONE_FIRST;
        }
        return DiamPiece.EMPTY;
    }
    private constructor(public readonly owner: PlayerOrNone,
                        public readonly otherPieceType: boolean) {
    }
    public toString(): string {
        return `DiamPiece(${this.owner}, ${this.otherPieceType})`;
    }
    public equals(other: DiamPiece): boolean {
        return this === other;
    }
}
