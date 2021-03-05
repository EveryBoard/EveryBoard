export class QuartoPiece {
    public static readonly AAAA: QuartoPiece = new QuartoPiece(0);
    public static readonly AAAB: QuartoPiece = new QuartoPiece(1);
    public static readonly AABA: QuartoPiece = new QuartoPiece(2);
    public static readonly AABB: QuartoPiece = new QuartoPiece(3);
    public static readonly ABAA: QuartoPiece = new QuartoPiece(4);
    public static readonly ABAB: QuartoPiece = new QuartoPiece(5);
    public static readonly ABBA: QuartoPiece = new QuartoPiece(6);
    public static readonly ABBB: QuartoPiece = new QuartoPiece(7);
    public static readonly BAAA: QuartoPiece = new QuartoPiece(8);
    public static readonly BAAB: QuartoPiece = new QuartoPiece(9);
    public static readonly BABA: QuartoPiece = new QuartoPiece(10);
    public static readonly BABB: QuartoPiece = new QuartoPiece(11);
    public static readonly BBAA: QuartoPiece = new QuartoPiece(12);
    public static readonly BBAB: QuartoPiece = new QuartoPiece(13);
    public static readonly BBBA: QuartoPiece = new QuartoPiece(14);
    public static readonly BBBB: QuartoPiece = new QuartoPiece(15);

    public static readonly NONE: QuartoPiece = new QuartoPiece(16);

    private constructor(public value: number) { }

    public static readonly pieces: ReadonlyArray<QuartoPiece> = [
        QuartoPiece.AAAA,
        QuartoPiece.AAAB,
        QuartoPiece.AABA,
        QuartoPiece.AABB,
        QuartoPiece.ABAA,
        QuartoPiece.ABAB,
        QuartoPiece.ABBA,
        QuartoPiece.ABBB,
        QuartoPiece.BAAA,
        QuartoPiece.BAAB,
        QuartoPiece.BABA,
        QuartoPiece.BABB,
        QuartoPiece.BBAA,
        QuartoPiece.BBAB,
        QuartoPiece.BBBA,
        QuartoPiece.BBBB,
    ];

    public static toInt(piece: QuartoPiece): number {
        return piece.value;
    }
    public static fromInt(piece: number): QuartoPiece {
        if (0 <= piece && piece <= 15) {
            return QuartoPiece.pieces[piece];
        } else if ( piece === 16) {
            return QuartoPiece.NONE;
        } else {
            throw new Error('Invalid piece (' + piece + ')');
        }
    }
}
