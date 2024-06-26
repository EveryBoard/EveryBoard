import { GameStateWithTable } from 'src/app/jscaip/state/GameStateWithTable';
import { Table } from 'src/app/jscaip/TableUtils';
import { Utils } from '@everyboard/lib';
import { DiamPiece } from './DiamPiece';

export class DiamState extends GameStateWithTable<DiamPiece> {

    public static WIDTH: number = 8;

    public static HEIGHT: number = 4;

    public static ofRepresentation(representation: DiamPiece[][], turn: number): DiamState {
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
        Utils.assert(pieces.every((remaining: number) => 0 <= remaining),
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
