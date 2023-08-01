import { MGPValidation } from 'src/app/utils/MGPValidation';
import { GameState } from '../GameState';
import { Minimax } from '../Minimax';
import { Move } from '../Move';
import { BoardValue } from '../BoardValue';
import { Rules } from '../Rules';
import { GameStatus } from '../GameStatus';

class GameStateMock extends GameState {

    public static getInitialState(): GameStateMock {
        return new GameStateMock(0);
    }
}
class MoveMock extends Move {

    public override toString(): string {
        throw new Error('MoveMock.toString method not implemented.');
    }
    public equals(other: this): boolean {
        throw new Error('MoveMock.equals method not implemented.');
    }
}
// class RulesMock extends Rules<MoveMock, GameStateMock> {
//
//     public applyLegalMove(move: MoveMock, state: GameStateMock, info: void): GameStateMock {
//         throw new Error('RulesMock.applyLegalMove method not implemented.');
//     }
//     public isLegal(move: MoveMock, state: GameStateMock): MGPValidation {
//         throw new Error('RulesMock.isLegal method not implemented.');
//     }
//     public getGameStatus(node: MGPNode<RulesMock, MoveMock, GameStateMock>): GameStatus {
//         throw new Error('RulesMock.getGameStatus method not implemented.');
//     }
// }
// class MockMinimax extends Minimax<MoveMock, GameStateMock> {
//     public getListMoves(node: MGPNode<RulesMock, MoveMock, GameStateMock>): MoveMock[] {
//         throw new Error('MockMinimax.getListMoves method not implemented.');
//     }
//     public getBoardValue(node: MGPNode<RulesMock, MoveMock, GameStateMock>): BoardValue {
//         return new BoardValue(0);
//     }
// }

// TODO describe('MGPNode', () => {
// TODO     it(`should not calculate twice the same node's value for one given minimax`, () => {
// TODO         // Given a node who'se value has already been calculated
// TODO         const state: GameState = new GameStateMock(0);
// TODO         const node: MGPNode<RulesMock, MoveMock, GameStateMock> = new MGPNode(state);
// TODO         const rules: RulesMock = new RulesMock(GameStateMock);
// TODO         const minimax: MockMinimax = new MockMinimax(rules, 'mock minimax');
// TODO         node.getOwnValue(minimax);
// TODO
// TODO         // When recalculating it
// TODO         spyOn(minimax, 'getBoardValue').and.callThrough();
// TODO         node.getOwnValue(minimax);
// TODO
// TODO         // Then minimax.getBoardValue should not have been called a second time
// TODO         expect(minimax.getBoardValue).not.toHaveBeenCalled();
// TODO     });
// TODO });
