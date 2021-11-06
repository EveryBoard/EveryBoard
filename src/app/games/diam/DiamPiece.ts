import { Player } from 'src/app/jscaip/Player';

export class DiamPiece {
    public static EMPTY: DiamPiece = new DiamPiece(Player.NONE, false);
    public static ZERO_FIRST: DiamPiece = new DiamPiece(Player.ZERO, false);
    public static ZERO_SECOND: DiamPiece = new DiamPiece(Player.ZERO, true);
    public static ONE_FIRST: DiamPiece = new DiamPiece(Player.ONE, false);
    public static ONE_SECOND: DiamPiece = new DiamPiece(Player.ONE, true);

    private constructor(public readonly owner: Player,
                        public readonly otherPieceType: boolean) {
    }
}

