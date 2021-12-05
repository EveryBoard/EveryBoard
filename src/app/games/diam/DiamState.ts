import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Table } from 'src/app/utils/ArrayUtils';
import { assert, Utils } from 'src/app/utils/utils';
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
    public static fromRepresentation(representation: DiamPiece[][], turn: number): DiamState {
        const board: Table<DiamPiece> = representation.reverse();
        const pieces: [number, number, number, number] = [4, 4, 4, 4];
        for (let y: number = 0; y < DiamState.HEIGHT; y++) {
            for (let x: number = 0; x < DiamState.WIDTH; x++) {
                const piece: DiamPiece = board[y][x];
                if (board[y][x] !== DiamPiece.EMPTY) {
                    pieces[DiamState.pieceIndex(piece)]--;
                }
            }
        }
        assert(pieces.every((remaining: number) => remaining >= 0),
               'Invalid DiamState representation uses too many pieces');
        return new DiamState(board, pieces, turn);
    }
    public static pieceIndex(piece: DiamPiece): number {
        switch (piece) {
            case DiamPiece.ZERO_FIRST: return 0;
            case DiamPiece.ZERO_SECOND: return 1;
            case DiamPiece.ONE_FIRST: return 2;
            default:
                Utils.expectToBe(piece, DiamPiece.ONE_SECOND);
                return 3;
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
        for (let y: number = 0; y < DiamState.HEIGHT; y++) {
            if (this.getPieceAtXY(x, y) === DiamPiece.EMPTY) {
                break;
            }
            size++;
        }
        return size;
    }
}
