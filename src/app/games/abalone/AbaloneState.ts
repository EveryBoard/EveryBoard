import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { AbaloneRules } from './AbaloneRules';

export class AbaloneState extends GameStateWithTable<FourStatePiece> {

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(9, 9) &&
               AbaloneRules.get().getInitialState().getPieceAt(coord) !== FourStatePiece.UNREACHABLE;
    }

    public isPiece(coord: Coord): boolean {
        const piece: FourStatePiece = this.getPieceAt(coord);
        return piece.isPlayer();
    }

    public getScores(): [number, number] {
        const scores: [number, number] = [14, 14];
        for (let y: number = 0; y < 9; y++) {
            for (let x: number = 0; x < 9; x++) {
                if (this.getPieceAtXY(x, y) === FourStatePiece.ZERO) {
                    scores[1] = scores[1] - 1;
                }
                if (this.getPieceAtXY(x, y) === FourStatePiece.ONE) {
                    scores[0] = scores[0] - 1;
                }
            }
        }
        return scores;
    }
}
