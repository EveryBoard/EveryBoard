/* eslint-disable max-lines-per-function */
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { GameState } from '../../state/GameState';
import { GameStatus } from '../../GameStatus';
import { GameNode } from '../GameNode';
import { Move } from '../../Move';
import { Rules } from '../../Rules';
import { NoConfig } from '../../RulesConfigUtil';

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

    public constructor() {
        super();
    }

    public override getInitialState(): GameStateMock {
        return GameStateMock.getInitialState();
    }

    public override applyLegalMove(_move: MoveMock,
                                   _state: GameStateMock,
                                   _config: NoConfig,
                                   _info: void)
    : GameStateMock
    {
        throw new Error('RulesMock.applyLegalMove method not implemented.');
    }

    public isLegal(move: MoveMock, state: GameStateMock): MGPValidation {
        throw new Error('RulesMock.isLegal method not implemented.');
    }

    public override getGameStatus(node: MockNode): GameStatus {
        throw new Error('RulesMock.getGameStatus method not implemented.');
    }
}

describe('GameNode', () => {

    let rules: RulesMock;

    describe('printDot', () => {

        let treeRoot: GameNode<MoveMock, GameStateMock>;
        let terminalNode: MockNode;
        let consoleLogBuffer: string[];
        let getGameStatusSpy: jasmine.Spy;

        beforeEach(() => {
            GameNode.ID = 0;
            rules = new RulesMock();

            const move: MoveMock = new MoveMock(1);
            const optionalMove: MGPOptional<MoveMock> = MGPOptional.of(move);
            const otherMove: MoveMock = new MoveMock(2);
            const optionalOtherMove: MGPOptional<MoveMock> = MGPOptional.of(otherMove);

            const stateAtTurn0: GameStateMock = new GameStateMock(0);
            const stateAtTurn1: GameStateMock = new GameStateMock(1);
            const stateAtTurn2: GameStateMock = new GameStateMock(2);
            const stateAtTurn3: GameStateMock = new GameStateMock(3);

            treeRoot = new GameNode(stateAtTurn0);
            const optionalTreeRoot: MGPOptional<MockNode> = MGPOptional.of(treeRoot);
            const child: MockNode = new MockNode(stateAtTurn1, optionalTreeRoot, optionalMove);
            treeRoot.addChild(child);

            const otherChild: MockNode = new MockNode(stateAtTurn1, optionalTreeRoot, optionalOtherMove);
            treeRoot.addChild(otherChild);

            const grandChild: MockNode = new MockNode(stateAtTurn2, MGPOptional.of(child), optionalMove);
            child.addChild(grandChild);

            terminalNode = new MockNode(stateAtTurn3, MGPOptional.of(grandChild), optionalMove);
            grandChild.addChild(terminalNode);

            getGameStatusSpy = spyOn(rules, 'getGameStatus');
            getGameStatusSpy.and.callFake((node: MockNode) => {
                if (node.gameState.turn === 3) return GameStatus.ZERO_WON;
                else return GameStatus.ONGOING;
            });

            consoleLogBuffer = [];
            spyOn(console, 'log').and.callFake((line: string) => {
                consoleLogBuffer.push(line);
            });
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

        it('should color nodes based on game status (Player.ZERO)', () => {
            // Given a terminal game node where Player.ZERO wins
            getGameStatusSpy.and.callFake((node: MockNode) => {
                return GameStatus.ZERO_WON;
            });
            // When printing it
            terminalNode.printDot(rules);
            // Then it should have printed the node with the player color
            const expectedOutput: string[] = [
                'digraph G {',
                '    node_0 [label="#3: 4", style=filled, fillcolor="#994d00"];',
                '}',
            ];
            expect(consoleLogBuffer).toEqual(expectedOutput);
        });

        it('should color nodes based on game status (Player.ONE)', () => {
            // Given a terminal game node where Player.ZERO wins
            getGameStatusSpy.and.callFake((node: MockNode) => {
                return GameStatus.ONE_WON;
            });
            // When printing it
            terminalNode.printDot(rules);
            // Then it should have printed the node with the player color
            const expectedOutput: string[] = [
                'digraph G {',
                '    node_0 [label="#3: 4", style=filled, fillcolor="#ffc34d"];',
                '}',
            ];
            expect(consoleLogBuffer).toEqual(expectedOutput);
        });

        it('should color nodes based on game status (draw)', () => {
            // Given a terminal game node where Player.ZERO wins
            getGameStatusSpy.and.callFake((node: MockNode) => {
                return GameStatus.DRAW;
            });
            // When printing it
            terminalNode.printDot(rules);
            // Then it should have printed the node in grey
            const expectedOutput: string[] = [
                'digraph G {',
                '    node_0 [label="#3: 4", style=filled, fillcolor="grey"];',
                '}',
            ];
            expect(consoleLogBuffer).toEqual(expectedOutput);
        });

    });

});
