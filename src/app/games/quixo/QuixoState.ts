import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { QuixoMove } from './QuixoMove';

export type QuixoConfig = {
    width: number,
    height: number,
};

export class QuixoState extends GameStateWithTable<PlayerOrNone> {

    public applyLegalMove(move: QuixoMove): QuixoState {
        const newBoard: PlayerOrNone[][] = this.getCopiedBoard();
        const newTurn : number = this.turn + 1;
        let currentCoordToFill: Coord = move.coord;
        let nextCoordToSlide: Coord = move.coord.getNext(move.direction);
        while (this.isOnBoard(nextCoordToSlide)) {
            newBoard[currentCoordToFill.y][currentCoordToFill.x] = newBoard[nextCoordToSlide.y][nextCoordToSlide.x];
            currentCoordToFill = currentCoordToFill.getNext(move.direction);
            nextCoordToSlide = nextCoordToSlide.getNext(move.direction);
        }
        newBoard[currentCoordToFill.y][currentCoordToFill.x] = this.getCurrentPlayer();
        return new QuixoState(newBoard, newTurn);
    }

}
