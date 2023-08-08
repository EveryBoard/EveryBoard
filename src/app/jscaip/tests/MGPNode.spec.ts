import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { GameState } from '../GameState';
import { GameStatus } from '../GameStatus';
import { GameNode } from '../MGPNode';
import { Move } from '../Move';
import { Rules } from '../Rules';

class GameStateMock extends GameState {

    public static getInitialState(): GameStateMock {
        return new GameStateMock(0);
    }
}
class MoveMock extends Move {

    public constructor(private readonly x: number) {
        super();
    }

    public override toString(): string {
        return 'MoveMock';
    }
    public equals(other: this): boolean {
        return this.x === other.x;
    }
}

class MockNode extends GameNode<MoveMock, GameStateMock> {}

class RulesMock extends Rules<MoveMock, GameStateMock> {

    public applyLegalMove(move: MoveMock, state: GameStateMock, info: void): GameStateMock {
        throw new Error('RulesMock.applyLegalMove method not implemented.');
    }
    public isLegal(move: MoveMock, state: GameStateMock): MGPValidation {
        throw new Error('RulesMock.isLegal method not implemented.');
    }
    public getGameStatus(node: MockNode): GameStatus {
        throw new Error('RulesMock.getGameStatus method not implemented.');
    }
}

describe('GameNode', () => {

    let rules: RulesMock;

    describe('printDot', () => {

        let treeRoot: GameNode<MoveMock, GameStateMock>;
        let terminalNode: MockNode;
        let consoleLogBuffer: string[];
        beforeEach(() => {
            rules = new RulesMock(GameStateMock);

            const move: MoveMock = new MoveMock(1);
            const otherMove: MoveMock = new MoveMock(2);

            treeRoot = new GameNode(new GameStateMock(0));
            const child: MockNode =
                new GameNode(new GameStateMock(1), MGPOptional.of(treeRoot), MGPOptional.of(move));
            treeRoot.addChild(move, child);

            const otherChild: MockNode =
                new GameNode(new GameStateMock(1), MGPOptional.of(treeRoot), MGPOptional.of(otherMove));
            treeRoot.addChild(otherMove, otherChild);

            const grandChild: MockNode =
                new GameNode(new GameStateMock(2), MGPOptional.of(child), MGPOptional.of(move));
            child.addChild(move, grandChild);

            terminalNode = new GameNode(new GameStateMock(3), MGPOptional.of(grandChild), MGPOptional.of(move));
            grandChild.addChild(move, terminalNode);

            spyOn(rules, 'getGameStatus').and.callFake((node: MockNode) => {
                if (node.gameState.turn === 3) return GameStatus.ZERO_WON;
                else return GameStatus.ONGOING;
            });

            consoleLogBuffer = [];
            spyOn(console, 'log').and.callFake((line: string) => {
                consoleLogBuffer.push(line);
            });

            GameNode.ID = 0;
        });
        it('should output a DOT representation of the node tree on standard output', () => {
            // Given a tree of game nodes
            // When printing it
            treeRoot.printDot(rules);
            // Then it should have printed the expected DOT graph
            const expectedOutput: string[] = [
                'digraph G {',
                '    node_0 [label="#0: 0", style=filled, fillcolor="white"];',
                '    node_0 -> node_1 [label="MoveMock"];',
                '    node_1 [label="#1: 1", style=filled, fillcolor="white"];',
                '    node_1 -> node_2 [label="MoveMock"];',
                '    node_2 [label="#2: 3", style=filled, fillcolor="white"];',
                '    node_2 -> node_3 [label="MoveMock"];',
                '    node_3 [label="#3: 4", style=filled, fillcolor="#994d00"];',
                '    node_0 -> node_4 [label="MoveMock"];',
                '    node_4 [label="#1: 2", style=filled, fillcolor="white"];',
                '}',
            ];
            expect(consoleLogBuffer).toEqual(expectedOutput);
        });
        it('should print with extra label if needed', () => {
            // Given a tree of game nodes
            // When printing it with a specific label
            terminalNode.printDot(rules, (node: MockNode) => 'foo');
            // Then it should have printed the tree with the extra label
            const expectedOutput: string[] = [
                'digraph G {',
                '    node_0 [label="#3: 4 - foo", style=filled, fillcolor="#994d00"];',
                '}',
            ];
            expect(consoleLogBuffer).toEqual(expectedOutput);
        });
        it('should limit print depth to the provided max level', () => {
            // Given a tree of game nodes
            // When printing it up to depth 1
            treeRoot.printDot(rules, undefined, 1);
            // Then it should have only printed the relevant nodes
            const expectedOutput: string[] = [
                'digraph G {',
                '    node_0 [label="#0: 0", style=filled, fillcolor="white"];',
                '    node_0 -> node_1 [label="MoveMock"];',
                '    node_1 [label="#1: 1", style=filled, fillcolor="white"];',
                '    node_0 -> node_2 [label="MoveMock"];',
                '    node_2 [label="#1: 2", style=filled, fillcolor="white"];',
                '}',
            ];
            expect(consoleLogBuffer).toEqual(expectedOutput);
        });
    });
});
