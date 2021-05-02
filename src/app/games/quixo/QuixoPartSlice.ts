import { ArrayUtils } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/player/Player';
import { QuixoMove } from './QuixoMove';

export class QuixoPartSlice extends GamePartSlice {
    public static getInitialSlice(): QuixoPartSlice {
        const initialBoard: number[][] = ArrayUtils.createBiArray(5, 5, Player.NONE.value);
        return new QuixoPartSlice(initialBoard, 0);
    }
    public applyLegalMove(move: QuixoMove): QuixoPartSlice {
        const newBoard: number[][] = this.getCopiedBoard();
        const newTurn : number = this.turn + 1;
        let currentCoordToFill: Coord = move.coord;
        let nextCoordToSlide: Coord = move.coord.getNext(move.direction);
        while (nextCoordToSlide.isInRange(5, 5)) {
            newBoard[currentCoordToFill.y][currentCoordToFill.x] = newBoard[nextCoordToSlide.y][nextCoordToSlide.x];
            currentCoordToFill = currentCoordToFill.getNext(move.direction);
            nextCoordToSlide = nextCoordToSlide.getNext(move.direction);
        }
        newBoard[currentCoordToFill.y][currentCoordToFill.x] = this.getCurrentPlayer().value;
        return new QuixoPartSlice(newBoard, newTurn);
    }
}
