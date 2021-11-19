import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { SixState } from '../SixState';
import { SixMove } from '../SixMove';
import { SixFailure } from '../SixFailure';
import { SixLegalityInformation, SixNode, SixRules } from '../SixRules';
import { SixMinimax } from '../SixMinimax';
import { Vector } from 'src/app/jscaip/Direction';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Minimax } from 'src/app/jscaip/Minimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPFallible } from 'src/app/utils/MGPFallible';

describe('SixRules', () => {

    let rules: SixRules;
    let minimaxes: Minimax<SixMove, SixState, SixLegalityInformation>[];

    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    beforeEach(() => {
        rules = new SixRules(SixState);
        minimaxes = [
            new SixMinimax(rules, 'SixMinimax'),
        ];
    });
    describe('dropping', () => {
        it('Should forbid landing/dropping on existing piece (drop)', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 4);
            const move: SixMove = SixMove.fromDrop(new Coord(1, 1));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.getReason()).toBe('Cannot land on occupied coord!');
        });
        it('Should forbid landing/dropping on existing piece (deplacement)', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 44);
            const move: SixMove = SixMove.fromDeplacement(new Coord(1, 2), new Coord(1, 1));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.getReason()).toBe('Cannot land on occupied coord!');
        });
        it('Should forbid drop after 40th turn', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ]; // Fake 40th turn, since there is not 42 stone on the board
            const state: SixState = SixState.fromRepresentation(board, 40);
            const move: SixMove = SixMove.fromDrop(new Coord(0, 1));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.getReason()).toBe('Can no longer drop after 40th turn!');
        });
        it('Should allow drop outside the current range', () => {
            const board: NumberTable = [
                [X, X, O, _, X],
                [X, X, O, _, O],
                [_, X, O, _, O],
                [_, X, O, _, X],
                [_, X, O, O, X],
            ];
            const expectedBoard: NumberTable = [
                [_, _, _, _, _, O],
                [X, X, O, _, X, _],
                [X, X, O, _, O, _],
                [_, X, O, _, O, _],
                [_, X, O, _, X, _],
                [_, X, O, O, X, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 0);
            const move: SixMove = SixMove.fromDrop(new Coord(5, -1));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.isSuccess()).toBeTrue();
            const resultingState: SixState = rules.applyLegalMove(move, state, status.get());
            const expectedState: SixState =
                SixState.fromRepresentation(expectedBoard, 1);
            expect(resultingState.pieces.equals(expectedState.pieces)).toBeTrue();
        });
        it('Should forbid dropping coord to be not connected to any piece', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, _, O],
                [X, X, O],
            ];
            const state: SixState = SixState.fromRepresentation(board, 5);
            const move: SixMove = SixMove.fromDrop(new Coord(0, 0));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.getReason()).toBe(SixFailure.MUST_DROP_NEXT_TO_OTHER_PIECE());
        });
    });
    describe('Deplacement', () => {
        it('Should forbid deplacement before 40th turn', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 0);
            const move: SixMove = SixMove.fromDeplacement(new Coord(1, 2), new Coord(3, 0));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.getReason()).toBe('Cannot do deplacement before 42th turn!');
        });
        it('Should forbid moving opponent piece', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromDeplacement(new Coord(0, 2), new Coord(2, 1));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.getReason()).toBe(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        });
        it('Should forbid moving empty piece', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromDeplacement(new Coord(0, 0), new Coord(2, 1));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.getReason()).toBe('Cannot move empty coord!');
        });
        it('Should refuse dropping piece where its only neighboor is herself last turn', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromDeplacement(new Coord(1, 2), new Coord(2, 2));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.getReason()).toBe(SixFailure.MUST_DROP_NEXT_TO_OTHER_PIECE());
        });
    });
    describe('Deconnection', () => {
        it('Should deconnect smaller group automatically', () => {
            const board: NumberTable = [
                [X, X, O, _, _],
                [X, X, O, _, _],
                [_, X, O, _, _],
                [_, X, O, _, X],
                [_, X, O, O, X],
            ];
            const expectedBoard: NumberTable = [
                [X, X, O, O],
                [X, X, O, _],
                [_, X, O, _],
                [_, X, O, _],
                [_, X, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromDeplacement(new Coord(3, 4), new Coord(3, 0));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.isSuccess()).toBeTrue();
            const resultingState: SixState = rules.applyLegalMove(move, state, status.get());
            const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 43);
            expect(resultingState.pieces.equals(expectedState.pieces)).toBeTrue();
        });
        it('Should refuse deconnection of same sized group when no group is mentionned in move', () => {
            const board: NumberTable = [
                [X, X, _, O, _],
                [X, X, _, O, _],
                [_, X, O, O, _],
                [_, X, _, O, _],
                [_, X, _, O, O],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromDeplacement(new Coord(2, 2), new Coord(4, 3));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.getReason()).toBe(SixFailure.MUST_CUT());
        });
        it('Should refuse deconnection of different sized group with group mentionned in move', () => {
            const board: NumberTable = [
                [X, X, _, _, _],
                [X, X, _, _, _],
                [_, X, O, O, _],
                [_, X, _, O, _],
                [_, X, _, O, O],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromCut(new Coord(2, 2), new Coord(4, 3), new Coord(0, 0));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.getReason()).toBe(SixFailure.CANNOT_CHOOSE_TO_KEEP());
        });
        it('Should refuse deconnection where captured coord is empty', () => {
            const board: NumberTable = [
                [X, X, _, O, _],
                [X, X, _, O, _],
                [_, X, O, O, _],
                [_, X, _, O, O],
                [_, X, _, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromCut(new Coord(2, 2), new Coord(4, 4), new Coord(4, 0));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.getReason()).toBe(SixFailure.CANNOT_KEEP_EMPTY_COORD());
        });
        it('Should refuse deconnection where captured coord is in a smaller group', () => {
            const board: NumberTable = [
                [_, X, X, _],
                [_, X, X, _],
                [_, _, O, O],
                [X, X, _, _],
                [X, X, _, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromCut(new Coord(2, 2), new Coord(4, 2), new Coord(4, 2));
            const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
            expect(status.getReason()).toBe(SixFailure.MUST_CAPTURE_BIGGEST_GROUPS());
        });
    });
    describe('victories', () => {
        describe('Shape Victories', () => {
            it('Should consider winner player who align 6 pieces (playing on border)', () => {
                const board: number[][] = [
                    [O, _, _, _, _],
                    [O, _, _, _, O],
                    [O, _, _, O, X],
                    [O, _, O, X, _],
                    [O, O, X, X, _],
                    [_, X, _, _, _],
                ];
                const expectedBoard: number[][] = [
                    [O, _, _, _, _],
                    [O, _, _, _, O],
                    [O, _, _, O, X],
                    [O, _, O, X, _],
                    [O, O, X, X, _],
                    [O, X, _, _, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 10);
                const move: SixMove = SixMove.fromDrop(new Coord(0, 5));
                const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
                expect(status.isSuccess()).toBeTrue();
                const resultingState: SixState = rules.applyLegalMove(move, state, status.get());
                const expectedState: SixState =
                    SixState.fromRepresentation(expectedBoard, 11, new Vector(-1, 0));
                expect(resultingState.pieces.equals(expectedState.pieces)).toBeTrue();
                const node: SixNode = new SixNode(resultingState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
            });
            it('Should consider winner player who align 6 pieces (playing in the middle)', () => {
                const board: number[][] = [
                    [_, _, _, _, _, O],
                    [_, _, _, _, O, X],
                    [_, _, _, O, X, _],
                    [_, _, _, X, X, _],
                    [_, O, X, _, _, _],
                    [O, O, _, _, _, _],
                ];
                const expectedBoard: number[][] = [
                    [_, _, _, _, _, O],
                    [_, _, _, _, O, X],
                    [_, _, _, O, X, _],
                    [_, _, O, X, X, _],
                    [_, O, X, _, _, _],
                    [O, O, _, _, _, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 10);
                const move: SixMove = SixMove.fromDrop(new Coord(2, 3));
                const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
                expect(status.isSuccess()).toBeTrue();
                const resultingState: SixState = rules.applyLegalMove(move, state, status.get());
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 11);
                expect(resultingState.pieces.equals(expectedState.pieces)).toBeTrue();
                const node: SixNode = new SixNode(resultingState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
            });
            it('Should consider winner player who draw a circle/hexagon of his pieces', () => {
                const board: number[][] = [
                    [_, _, _, _, X],
                    [O, _, _, X, _],
                    [O, _, _, X, _],
                    [O, X, _, X, O],
                    [X, X, X, _, _],
                    [_, _, O, X, _],
                ];
                const expectedBoard: number[][] = [
                    [_, _, _, _, X],
                    [O, _, _, X, _],
                    [O, _, X, X, _],
                    [O, X, _, X, O],
                    [X, X, X, _, _],
                    [_, _, O, X, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 9);
                const move: SixMove = SixMove.fromDrop(new Coord(2, 2));
                const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
                expect(status.isSuccess()).toBeTrue();
                const resultingState: SixState = rules.applyLegalMove(move, state, status.get());
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 10);
                expect(resultingState.pieces.equals(expectedState.pieces)).toBeTrue();
                const node: SixNode = new SixNode(resultingState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
            it('Should consider winner player who draw a triangle of his pieces (corner drop)', () => {
                const board: number[][] = [
                    [O, X, _, X, _],
                    [O, _, _, _, _],
                    [O, _, X, X, O],
                    [O, X, X, X, _],
                    [O, O, _, X, _],
                ];
                const expectedBoard: number[][] = [
                    [O, X, _, X, _],
                    [O, _, _, X, _],
                    [O, _, X, X, O],
                    [O, X, X, X, _],
                    [O, O, _, X, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 11);
                const move: SixMove = SixMove.fromDrop(new Coord(3, 1));
                const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
                expect(status.isSuccess()).toBeTrue();
                const resultingState: SixState = rules.applyLegalMove(move, state, status.get());
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 12);
                expect(resultingState.pieces.equals(expectedState.pieces)).toBeTrue();
                const node: SixNode = new SixNode(resultingState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
            it('Should consider winner player who draw a triangle of his pieces (edge drop)', () => {
                const board: number[][] = [
                    [O, _, _, _, X],
                    [O, X, _, X, _],
                    [O, _, _, X, O],
                    [O, X, X, X, _],
                    [X, O, _, _, _],
                ];
                const expectedBoard: number[][] = [
                    [O, _, _, _, X],
                    [O, X, _, X, _],
                    [O, _, X, X, O],
                    [O, X, X, X, _],
                    [X, O, _, _, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 11);
                const move: SixMove = SixMove.fromDrop(new Coord(2, 2));
                const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
                expect(status.isSuccess()).toBeTrue();
                const resultingState: SixState = rules.applyLegalMove(move, state, status.get());
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 12);
                expect(resultingState.pieces.equals(expectedState.pieces)).toBeTrue();
                const node: SixNode = new SixNode(resultingState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
            it('Should consider winner player who draw a circle/hexagon of his pieces (coverage remix)', () => {
                const board: number[][] = [
                    [O, _, _, _, _],
                    [O, _, _, X, _],
                    [O, X, _, X, O],
                    [O, X, X, _, _],
                    [_, _, O, X, _],
                ];
                const expectedBoard: number[][] = [
                    [O, _, _, _, _],
                    [O, _, X, X, _],
                    [O, X, _, X, O],
                    [O, X, X, _, _],
                    [_, _, O, X, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 9);
                const move: SixMove = SixMove.fromDrop(new Coord(2, 1));
                const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
                expect(status.isSuccess()).toBeTrue();
                const resultingState: SixState = rules.applyLegalMove(move, state, status.get());
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 10);
                expect(resultingState.pieces.equals(expectedState.pieces)).toBeTrue();
                const node: SixNode = new SixNode(resultingState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
        });
        describe('Disconnection Victories', () => {
            it('Should consider looser PLAYER.ZERO when he drop bellow 6 pieces on phase two', () => {
                const board: NumberTable = [
                    [O, O, X, _, _],
                    [_, O, X, _, _],
                    [_, O, X, _, _],
                    [_, O, X, _, O],
                    [_, _, X, X, O],
                ];
                const expectedBoard: NumberTable = [
                    [O, O, X, X],
                    [_, O, X, _],
                    [_, O, X, _],
                    [_, O, X, _],
                    [_, _, X, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 43);
                const move: SixMove = SixMove.fromDeplacement(new Coord(3, 4), new Coord(3, 0));
                const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
                expect(status.isSuccess()).toBeTrue();
                const resultingState: SixState = rules.applyLegalMove(move, state, status.get());
                const expectedState: SixState =
                    SixState.fromRepresentation(expectedBoard, 44);
                expect(resultingState.pieces.equals(expectedState.pieces)).toBeTrue();
                const node: SixNode = new SixNode(resultingState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
            it('Should consider looser PLAYER.ONE when he drop bellow 6 pieces on phase two', () => {
                const board: NumberTable = [
                    [X, X, O, _, _],
                    [_, X, O, _, _],
                    [_, X, O, _, _],
                    [_, X, O, _, X],
                    [_, _, O, O, X],
                ];
                const expectedBoard: NumberTable = [
                    [X, X, O, O],
                    [_, X, O, _],
                    [_, X, O, _],
                    [_, X, O, _],
                    [_, _, O, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 42);
                const move: SixMove = SixMove.fromDeplacement(new Coord(3, 4), new Coord(3, 0));
                const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
                expect(status.isSuccess()).toBeTrue();
                const resultingState: SixState = rules.applyLegalMove(move, state, status.get());
                const expectedState: SixState =
                    SixState.fromRepresentation(expectedBoard, 43);
                expect(resultingState.pieces.equals(expectedState.pieces)).toBeTrue();
                const node: SixNode = new SixNode(resultingState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
            });
            it('Should consider winner Player who has more pieces than opponent and both have less than 6', () => {
                const board: number[][] = [
                    [_, _, _, _, _, O, X, X],
                    [O, O, O, O, O, _, _, O],
                    [_, _, _, _, X, _, _, _],
                    [_, _, X, X, X, _, _, _],
                ];
                const expectedBoard: number[][] = [
                    [O, O, O, O, O],
                ];
                const state: SixState = SixState.fromRepresentation(board, 40);
                const move: SixMove = SixMove.fromDeplacement(new Coord(4, 1), new Coord(-1, 1));
                const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
                expect(status.isSuccess()).toBeTrue();
                const resultingState: SixState = rules.applyLegalMove(move, state, status.get());
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 41);
                expect(resultingState.pieces.equals(expectedState.pieces)).toBeTrue();
                const node: SixNode = new SixNode(resultingState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
            });
            it('Should consider looser Player who has less pieces than opponent and both have less than 6', () => {
                const board: number[][] = [
                    [_, _, _, _, _, X, O],
                    [X, X, X, X, O, _, _],
                    [X, _, _, _, O, _, _],
                    [_, _, _, O, O, _, _],
                ];
                const expectedBoard: number[][] = [
                    [X, X, X, X],
                    [X, _, _, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 42);
                const move: SixMove = SixMove.fromDeplacement(new Coord(4, 1), new Coord(6, 1));
                const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
                expect(status.isSuccess()).toBeTrue();
                const resultingState: SixState = rules.applyLegalMove(move, state, status.get());
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 43);
                expect(resultingState.pieces.equals(expectedState.pieces)).toBeTrue();
                const node: SixNode = new SixNode(resultingState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
        });
    });
});
