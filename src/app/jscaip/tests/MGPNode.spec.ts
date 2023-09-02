import { MGPValidation } from 'src/app/utils/MGPValidation';
import { GameState } from '../GameState';
import { MGPNode } from '../MGPNode';
import { Minimax } from '../Minimax';
import { Move } from '../Move';
import { BoardValue } from '../BoardValue';
import { Rules } from '../Rules';
import { GameStatus } from '../GameStatus';
import { MGPOptional } from 'src/app/utils/MGPOptional';

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
class RulesMock extends Rules<MoveMock, GameStateMock> {

    public applyLegalMove(move: MoveMock, state: GameStateMock, info: void): GameStateMock {
        throw new Error('RulesMock.applyLegalMove method not implemented.');
    }
    public isLegal(move: MoveMock, state: GameStateMock): MGPValidation {
        throw new Error('RulesMock.isLegal method not implemented.');
    }
    public getGameStatus(node: MGPNode<RulesMock, MoveMock, GameStateMock>): GameStatus {
        throw new Error('RulesMock.getGameStatus method not implemented.');
    }
}
class MockMinimax extends Minimax<MoveMock, GameStateMock> {
    public getListMoves(node: MGPNode<RulesMock, MoveMock, GameStateMock>): MoveMock[] {
        throw new Error('MockMinimax.getListMoves method not implemented.');
    }
    public getBoardValue(node: MGPNode<RulesMock, MoveMock, GameStateMock>): BoardValue {
        return new BoardValue(0);
    }
}

describe('MGPNode', () => {
    it(`should not calculate twice the same node's value for one given minimax`, () => {
        // Given a node who'se value has already been calculated
        const state: GameState = new GameStateMock(0);
        const node: MGPNode<RulesMock, MoveMock, GameStateMock> = new MGPNode(state);
        const rules: RulesMock = new RulesMock(GameStateMock, {});
        const minimax: MockMinimax = new MockMinimax(rules, 'mock minimax');
        node.getOwnValue(minimax);

        // When recalculating it
        spyOn(minimax, 'getBoardValue').and.callThrough();
        node.getOwnValue(minimax);

        // Then minimax.getBoardValue should not have been called a second time
        expect(minimax.getBoardValue).not.toHaveBeenCalled();
    });
    describe('toString', () => {
        it('should show node turn', () => {
            // Given a node
            const state: GameState = new GameStateMock(0);
            const node: MGPNode<RulesMock, MoveMock, GameStateMock> = new MGPNode(state);
            // When calling toString
            const stringified: string = node.myToString();
            // Then it should contain the node number
            expect(stringified).toBe('InitialNode: 0');
        });
        it('should not show last move when absent', () => {
            // Given a node with a parent but no last move
            const parentState: GameState = new GameStateMock(0);
            const parentNode: MGPNode<RulesMock, MoveMock, GameStateMock> = new MGPNode(parentState);
            const state: GameState = new GameStateMock(1);
            const node: MGPNode<RulesMock, MoveMock, GameStateMock> = new MGPNode(state, MGPOptional.of(parentNode));
            // When calling toString
            const stringified: string = node.myToString();
            // Then it should not show last move
            expect(stringified).toBe('Node:  1 ');
        });
        it('should show last move when present', () => {
            // Given a node with a parent and last move
            const parentState: GameState = new GameStateMock(0);
            const parentNode: MGPNode<RulesMock, MoveMock, GameStateMock> = new MGPNode(parentState);
            const state: GameState = new GameStateMock(1);
            const node: MGPNode<RulesMock, MoveMock, GameStateMock> =
                new MGPNode(state, MGPOptional.of(parentNode), MGPOptional.of(new MoveMock()));
            // When calling toString
            const stringified: string = node.myToString();
            // Then it should show the last move
            expect(stringified).toBe('Node:  > MoveMock> 1 ');
        });
    });
});
