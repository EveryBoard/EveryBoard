import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { TriangularGameState } from 'src/app/jscaip/TriangularGameState';

export class SaharaState extends TriangularGameState<FourStatePiece> {

    public static HEIGHT: number = 6;

    public static WIDTH: number = 11;

    public static getInitialState(): SaharaState {
        const N: FourStatePiece = FourStatePiece.UNREACHABLE;
        const O: FourStatePiece = FourStatePiece.ZERO;
        const X: FourStatePiece = FourStatePiece.ONE;
        const _: FourStatePiece = FourStatePiece.EMPTY;
        const board: FourStatePiece[][] = [
            [N, N, O, X, _, _, _, O, X, N, N],
            [N, _, _, _, _, _, _, _, _, _, N],
            [X, _, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, _, _, _, N],
            [N, N, X, O, _, _, _, X, O, N, N],
        ];
        return new SaharaState(board, 0);
    }
}
