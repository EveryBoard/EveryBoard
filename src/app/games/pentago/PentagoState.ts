import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { RectangularGameState } from 'src/app/jscaip/RectangularGameState';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { PentagoMove } from './PentagoMove';

export class PentagoState extends RectangularGameState<Player> {

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
    public static getInitialState(): PentagoState {
        const initialBoard: Table<Player> = ArrayUtils.createBiArray(6, 6, Player.NONE);
        return new PentagoState(initialBoard, 0);
    }
    public readonly neutralBlocks: number[];

    public constructor(board: Table<Player>, turn: number) {
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
    private getBlockNeutrality(blockIndex: number): boolean {
        const center: Coord = PentagoState.getBlockCenter(blockIndex);
        const initialUp: Player = this.getBoardAt(center.getNext(Direction.UP, 1));
        const initialDiagonal: Player = this.getBoardAt(center.getNext(Direction.UP_LEFT, 1));
        // Testing edges
        if (this.getBoardAt(center.getNext(Direction.RIGHT, 1)) !== initialUp ||
            this.getBoardAt(center.getNext(Direction.DOWN, 1)) !== initialUp ||
            this.getBoardAt(center.getNext(Direction.LEFT, 1)) !== initialUp)
        {
            return false;
        }
        // Testing corners
        return this.getBoardAt(center.getNext(Direction.UP_RIGHT, 1)) === initialDiagonal &&
               this.getBoardAt(center.getNext(Direction.DOWN_RIGHT, 1)) === initialDiagonal &&
               this.getBoardAt(center.getNext(Direction.DOWN_LEFT, 1)) === initialDiagonal;
    }
    public static getBlockCenter(blockIndex: number): Coord {
        const cx: number = 1 + (blockIndex % 2 === 0 ? 0 : 3);
        const cy: number = 1 + (blockIndex < 2 ? 0 : 3);
        return new Coord(cx, cy);
    }
    public applyLegalDrop(move: PentagoMove): PentagoState {
        const newBoard: Player[][] = this.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x] = this.getCurrentPlayer();
        return new PentagoState(newBoard, this.turn);
    }
    public applyLegalMove(move: PentagoMove): PentagoState {
        const postDropState: PentagoState = this.applyLegalDrop(move);
        const newBoard: Player[][] = postDropState.getCopiedBoard();
        if (move.blockTurned.isPresent()) {
            const blockCenter: Coord = PentagoState.getBlockCenter(move.blockTurned.get());
            if (move.turnedClockwise) {
                for (const translation of PentagoState.ROTATION_MAP) {
                    const oldCoord: Coord = translation[0].getNext(blockCenter);
                    const newCoord: Coord = translation[1].getNext(blockCenter);
                    const oldValue: Player = postDropState.getBoardAt(oldCoord);
                    newBoard[newCoord.y][newCoord.x] = oldValue;
                }
            } else {
                for (const translation of PentagoState.ROTATION_MAP) {
                    const oldCoord: Coord = translation[1].getNext(blockCenter);
                    const newCoord: Coord = translation[0].getNext(blockCenter);
                    const oldValue: Player = postDropState.getBoardAt(oldCoord);
                    newBoard[newCoord.y][newCoord.x] = oldValue;
                }
            }
        }
        return new PentagoState(newBoard, this.turn + 1);
    }
    public blockIsNeutral(blockIndex: number): boolean {
        return this.neutralBlocks.includes(blockIndex);
    }
}
