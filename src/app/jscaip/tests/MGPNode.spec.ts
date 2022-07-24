import { MGPFallible } from 'src/app/utils/MGPFallible';
import { GameState } from '../GameState';
import { MGPNode } from '../MGPNode';
import { Minimax } from '../Minimax';
import { Move } from '../Move';
import { NodeUnheritance } from '../NodeUnheritance';
import { GameStatus, Rules } from '../Rules';

class GameStateMock extends GameState {

    public static getInitialState(): GameStateMock {
        return new GameStateMock(0);
    }
}
class MoveMock extends Move {
    public toString(): string {
        throw new Error('g Method not implemented.');
    }
    public equals(o: this): boolean {
        throw new Error('f Method not implemented.');
    }
}
class RulesMock extends Rules<MoveMock, GameStateMock> {
    public applyLegalMove(move: MoveMock, state: GameStateMock, info: void): GameStateMock {
        throw new Error('e Method not implemented.');
    }
    public isLegal(move: MoveMock, state: GameStateMock): MGPFallible<void> {
        throw new Error('d Method not implemented.');
    }
    public getGameStatus(node: MGPNode<RulesMock, MoveMock, GameStateMock>): GameStatus {
        throw new Error('c Method not implemented.');
    }
}
class MockMinimax extends Minimax<MoveMock, GameStateMock> {
    public getListMoves(node: MGPNode<RulesMock, MoveMock, GameStateMock>): MoveMock[] {
        throw new Error('b Method not implemented.');
    }
    public getBoardValue(node: MGPNode<RulesMock, MoveMock, GameStateMock>): NodeUnheritance {
        return new NodeUnheritance(0);
    }
}

describe('MGPNode', () => {
    it(`should not calculate twice the same node's value for one given minimax`, () => {
        // Given a node who'se value has already been calculated
        const state: GameState = new GameStateMock(0);
        const node: MGPNode<RulesMock, MoveMock, GameStateMock> = new MGPNode(state);
        const rules: RulesMock = new RulesMock(GameStateMock);
        const minimax: MockMinimax = new MockMinimax(rules, 'mock minimax');
        node.getOwnValue(minimax);

        // When recalculating it
        spyOn(minimax, 'getBoardValue').and.callThrough();
        node.getOwnValue(minimax);

        // Then minimax.getBoardValue should not have been called a second time
        expect(minimax.getBoardValue).not.toHaveBeenCalled();
    });
});
