import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Table } from 'src/app/utils/ArrayUtils';
import { DiamPiece } from './DiamPiece';

export class DiamState extends GameStateWithTable<DiamPiece> {
    public static WIDTH: number = 8;

    public static HEIGHT: number = 4;

    public static getInitialState(): DiamState {
        const _: DiamPiece = DiamPiece.EMPTY;
        const board: Table<DiamPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        return new DiamState(board, [4, 4, 4, 4], 0);
    }

    public static pieceIndex(piece: DiamPiece): 0 | 1 | 2 | 3 {
        switch (piece) {
            case DiamPiece.ZERO_FIRST: return 0;
            case DiamPiece.ZERO_SECOND: return 1;
            case DiamPiece.ONE_FIRST: return 2;
            case DiamPiece.ONE_SECOND: return 3;
        }
    }

    public constructor(board: Table<DiamPiece>,
                       public readonly remainingPieces: Readonly<[number, number, number, number]>,
                       turn: number) {
        super(board, turn);
    }
    public getRemainingPiecesOf(piece: DiamPiece): number {
        return this.remainingPieces[DiamState.pieceIndex(piece)];
    }
    public getStackHeight(x: number): number {
        let size: number = 0;
        for (let y: number = 3; y >= 0; y--) {
            if (this.getPieceAtXY(x, y) === DiamPiece.EMPTY) {
                break;
            }
            size++;
        }
        return size;
    }
}
