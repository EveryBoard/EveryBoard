import { Coord } from './Coord';
import { GameState } from './GameState';
import { HexaBoard } from './HexaBoard';

export class HexagonalGameState<P, B extends HexaBoard<P>> extends GameState<Coord, P> {

    constructor(turn: number, public readonly board: B) {
        super(turn);
        if (board == null) {
            throw new Error('TODO: fuck you');
        }
    }
    public getBoardAt(coord: Coord): P | null {
        throw new Error('TODO');
    }
    public getNullable(coord: Coord): P {
        throw new Error('TODO');
    }
}
