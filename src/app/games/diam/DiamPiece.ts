import { Player } from 'src/app/jscaip/Player';

export class DiamPiece {
    public static EMPTY: DiamPiece = new DiamPiece(Player.NONE, false);
    public static ZERO_FIRST: DiamPiece = new DiamPiece(Player.ZERO, false);
    public static ZERO_SECOND: DiamPiece = new DiamPiece(Player.ZERO, true);
    public static ONE_FIRST: DiamPiece = new DiamPiece(Player.ONE, false);
    public static ONE_SECOND: DiamPiece = new DiamPiece(Player.ONE, true);

    public static of(player: Player, otherPiece: boolean): DiamPiece {
        if (player === Player.ZERO) {
            if (otherPiece) return DiamPiece.ZERO_SECOND;
            return DiamPiece.ZERO_FIRST;
        } else if (player === Player.ONE) {
            if (otherPiece) return DiamPiece.ONE_SECOND;
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

