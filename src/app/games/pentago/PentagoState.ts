import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/Player';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { PentagoMove } from './PentagoMove';

export class PentagoState extends GamePartSlice {

    public static ROTATION_MAP: [Coord, Coord][] = [
        [new Coord(-1, -1), new Coord(1, -1)],
        [new Coord(0, -1), new Coord(1, 0)],
        [new Coord(1, -1), new Coord(1, 1)],
        [new Coord(1, 0), new Coord(0, 1)],
        [new Coord(1, 1), new Coord(-1, 1)],
        [new Coord(0, 1), new Coord(-1, 0)],
        [new Coord(-1, 1), new Coord(-1, -1)],
        [new Coord(-1, 0), new Coord(0, -1)],
    ];
    public static getInitialSlice(): PentagoState {
        const _: number = Player.NONE.value;
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        return new PentagoState(initialBoard, 0);
    }
    public readonly neutralBlocks: number[];

    public constructor(board: NumberTable, turn: number) {
        super(board, turn);
        this.neutralBlocks = this.getBlocksNeutralities();
    }
    private getBlocksNeutralities(): number[] {
        const neutralBlocks: number[] = [];
        for (let i: number = 0; i < 4; i++) {
            const blockNeutrality: boolean = this.getBlockNeutrality(i);
            if (blockNeutrality) {
                neutralBlocks.push(i);
            }
        }
        return neutralBlocks;
    }
    public getPieceAt(coord: Coord): Player {
        return Player.of(this.board[coord.y][coord.x]);
    }
    private getBlockNeutrality(blockIndex: number): boolean {
        const center: Coord = PentagoState.getBlockCenter(blockIndex);
        const initialUp: Player = this.getPieceAt(center.getNext(Direction.UP, 1));
        const initialDiagonal: Player = this.getPieceAt(center.getNext(Direction.UP_LEFT, 1));
        // Testing edges
        if (this.getPieceAt(center.getNext(Direction.RIGHT, 1)) !== initialUp ||
            this.getPieceAt(center.getNext(Direction.DOWN, 1)) !== initialUp ||
            this.getPieceAt(center.getNext(Direction.LEFT, 1)) !== initialUp)
        {
            return false;
        }
        // Testing corners
        return this.getPieceAt(center.getNext(Direction.UP_RIGHT, 1)) === initialDiagonal &&
               this.getPieceAt(center.getNext(Direction.DOWN_RIGHT, 1)) === initialDiagonal &&
               this.getPieceAt(center.getNext(Direction.DOWN_LEFT, 1)) === initialDiagonal;
    }
    public static getBlockCenter(blockIndex: number): Coord {
        const cx: number = 1 + (blockIndex % 2 === 0 ? 0 : 3);
        const cy: number = 1 + (blockIndex < 2 ? 0 : 3);
        return new Coord(cx, cy);
    }
    public applyLegalDrop(move: PentagoMove): PentagoState {
        const newBoard: number[][] = this.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x] = this.getCurrentPlayer().value;
        return new PentagoState(newBoard, this.turn);
    }
    public applyLegalMove(move: PentagoMove): PentagoState {
        const postDropState: PentagoState = this.applyLegalDrop(move);
        const newBoard: number[][] = postDropState.getCopiedBoard();
        if (move.blockTurned.isPresent()) {
            const blockCenter: Coord = PentagoState.getBlockCenter(move.blockTurned.get());
            if (move.turnedClockwise) {
                for (const translation of PentagoState.ROTATION_MAP) {
                    const oldCoord: Coord = translation[0].getNext(blockCenter);
                    const newCoord: Coord = translation[1].getNext(blockCenter);
                    const oldValue: number = postDropState.getBoardAt(oldCoord);
                    newBoard[newCoord.y][newCoord.x] = oldValue;
                }
            } else {
                for (const translation of PentagoState.ROTATION_MAP) {
                    const oldCoord: Coord = translation[1].getNext(blockCenter);
                    const newCoord: Coord = translation[0].getNext(blockCenter);
                    const oldValue: number = postDropState.getBoardAt(oldCoord);
                    newBoard[newCoord.y][newCoord.x] = oldValue;
                }
            }
        }
        return new PentagoState(newBoard, this.turn + 1);
    }

}
