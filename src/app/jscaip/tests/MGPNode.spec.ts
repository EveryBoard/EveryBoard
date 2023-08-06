import { GameState } from '../GameState';
import { Move } from '../Move';

class GameStateMock extends GameState {

    public static getInitialState(): GameStateMock {
        return new GameStateMock(0);
    }
}
class MoveMock extends Move {

    public override toString(): string {
        return 'MoveMock';
    }
    public equals(other: this): boolean {
        throw new Error('MoveMock.equals method not implemented.');
    }
}
