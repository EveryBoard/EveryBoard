/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { SixState } from '../SixState';
import { SixMove } from '../SixMove';
import { SixFailure } from '../SixFailure';
import { SixLegalityInformation, SixNode, SixRules } from '../SixRules';
import { SixMinimax } from '../SixMinimax';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Minimax } from 'src/app/jscaip/Minimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';

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
            // Given a board in Phase 1 with pieces
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 4);

            // When dropping a piece on another
            const move: SixMove = SixMove.fromDrop(new Coord(1, 1));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_LAND_ON_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('Should forbid landing/dropping on existing piece (movement)', () => {
            // Given a board in Phase 1 with pieces
            const board: NumberTable = [
                [X, _, O],
                [_, X, _],
                [_, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);

            // When dropping a piece on another
            const move: SixMove = SixMove.fromMovement(new Coord(0, 0), new Coord(1, 1));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_LAND_ON_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('Should forbid drop after 40th turn', () => {
            // Given a [fake] 40th turn board
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ]; // Fake 40th turn, since there are not 42 stones on the board
            const state: SixState = SixState.fromRepresentation(board, 40);

            // When dropping on a legal landing coord
            const move: SixMove = SixMove.fromDrop(new Coord(0, 1));

            // Then the move should still be illegal
            const reason: string = SixFailure.CAN_NO_LONGER_DROP();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('Should allow drop outside the current range', () => {
            // Given a board in a certain range (5 by 5 when put in a square)
            const board: NumberTable = [
                [X, X, O, _, X],
                [X, X, O, _, O],
                [_, X, O, _, O],
                [_, X, O, _, X],
                [_, X, O, O, X],
            ];
            const state: SixState = SixState.fromRepresentation(board, 0);

            // When playing on a coord that is outside of the representation board
            const move: SixMove = SixMove.fromDrop(new Coord(5, -1));

            // Then the move should be legal
            const expectedBoard: NumberTable = [
                [_, _, _, _, _, O],
                [X, X, O, _, X, _],
                [X, X, O, _, O, _],
                [_, X, O, _, O, _],
                [_, X, O, _, X, _],
                [_, X, O, O, X, _],
            ];
            const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('Should forbid dropping coord to be not connected to any piece', () => {
            // Given a board
            const board: NumberTable = [
                [_, _, O],
                [_, _, O],
                [X, X, O],
            ];
            const state: SixState = SixState.fromRepresentation(board, 5);

            // When dropping a piece on a coord neighbor to no pieces
            const move: SixMove = SixMove.fromDrop(new Coord(0, 0));

            // Then the move should be deemed illegal
            const reason: string = SixFailure.MUST_DROP_NEXT_TO_OTHER_PIECE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
    });
    describe('Deplacement', () => {
        it('Should forbid movement before 40th turn', () => {
            // Given a board in phase 1
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 0);

            // When doing a movement
            const move: SixMove = SixMove.fromMovement(new Coord(1, 2), new Coord(3, 0));

            // Then the move should be deemed illegal
            const reason: string = SixFailure.NO_MOVEMENT_BEFORE_TURN_40();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('Should forbid moving opponent piece', () => {
            // Given a board in Phase 2 with pieces
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);

            // When trying to move an opponent piece
            const move: SixMove = SixMove.fromMovement(new Coord(0, 2), new Coord(2, 1));

            // Then the move should be deemed illegal
            const reason: string = RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('Should forbid moving empty piece', () => {
            // Given a board in second phase
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);

            // When trying to move empty piece
            const move: SixMove = SixMove.fromMovement(new Coord(0, 0), new Coord(2, 1));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('Should refuse dropping piece where its only neighboor is herself last turn', () => {
            // Given a board in phase 2
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);

            // When moving a piece on a space that only that piece neighbored
            const move: SixMove = SixMove.fromMovement(new Coord(1, 2), new Coord(2, 2));

            // Then the move should be illegal
            const reason: string = SixFailure.MUST_DROP_NEXT_TO_OTHER_PIECE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
    });
    describe('Deconnection', () => {
        it('Should deconnect smaller group automatically', () => {
            // Given a board where two piece could be disconnected
            const board: NumberTable = [
                [X, X, O, _, _],
                [X, X, O, _, _],
                [_, X, O, _, _],
                [_, X, O, _, X],
                [_, X, O, O, X],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);

            // When disconnecting them
            const move: SixMove = SixMove.fromMovement(new Coord(3, 4), new Coord(3, 0));

            // Then the small group should be removed from the board
            const expectedBoard: NumberTable = [
                [X, X, O, O],
                [X, X, O, _],
                [_, X, O, _],
                [_, X, O, _],
                [_, X, O, _],
            ];
            const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 43);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('Should refuse deconnection of same sized group when no group is mentionned in move', () => {
            // Given a board where a equal cut is possible
            const board: NumberTable = [
                [X, X, _, O, _],
                [X, X, _, O, _],
                [_, X, O, O, _],
                [_, X, _, O, _],
                [_, X, _, O, O],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);

            // When doing that move without choosing which half to keep
            const move: SixMove = SixMove.fromMovement(new Coord(2, 2), new Coord(4, 3));

            // Then the move should be refused
            const reason: string = SixFailure.MUST_CUT();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('Should refuse deconnection of different sized group with group mentionned in move', () => {
            // Given a board with a cut possible
            const board: NumberTable = [
                [X, X, _, _, _],
                [X, X, _, _, _],
                [_, X, O, O, _],
                [_, X, _, O, _],
                [_, X, _, O, O],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);

            // When doing that cut but mentionning a group to keep
            const move: SixMove = SixMove.fromCut(new Coord(2, 2), new Coord(4, 3), new Coord(0, 0));

            // Then the move should be illegal
            const reason: string = SixFailure.CANNOT_CHOOSE_TO_KEEP();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('Should refuse deconnection where captured coord is empty', () => {
            // Given a board with an equal cut possible
            const board: NumberTable = [
                [X, X, _, O, _],
                [X, X, _, O, _],
                [_, X, O, O, _],
                [_, X, _, O, O],
                [_, X, _, O, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);

            // When doing it and mentionning empty space to keep
            const move: SixMove = SixMove.fromCut(new Coord(2, 2), new Coord(4, 4), new Coord(4, 0));

            // Then the move should be illegal
            const reason: string = SixFailure.CANNOT_KEEP_EMPTY_COORD();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('Should refuse deconnection where captured coord is in a smaller group', () => {
            // Given a board with three group splitted, one of them beeing too small to be chosen
            const board: NumberTable = [
                [_, X, X, _],
                [_, X, X, _],
                [_, _, O, O],
                [X, X, _, _],
                [X, X, _, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);

            // When choosing that small group
            const move: SixMove = SixMove.fromCut(new Coord(2, 2), new Coord(4, 2), new Coord(4, 2));

            // Then the move should be illegal
            const reason: string = SixFailure.MUST_CAPTURE_BIGGEST_GROUPS();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
    });
    describe('victories', () => {
        describe('Shape Victories', () => {
            it('Should consider winner player who align 6 pieces (playing on border)', () => {
                // Given a board in pre-victory
                const board: number[][] = [
                    [O, _, _, _, _],
                    [O, _, _, _, O],
                    [O, _, _, O, X],
                    [O, _, O, X, _],
                    [O, O, X, X, _],
                    [_, X, _, _, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 10);

                // When expanding it
                const move: SixMove = SixMove.fromDrop(new Coord(0, 5));

                // Then the winner should be player zero
                const expectedBoard: number[][] = [
                    [O, _, _, _, _],
                    [O, _, _, _, O],
                    [O, _, _, O, X],
                    [O, _, O, X, _],
                    [O, O, X, X, _],
                    [O, X, _, _, _],
                ];
                // const status: MGPFallible<SixLegalityInformation> = rules.isLegal(move, state);
                // expect(status.isSuccess()).toBeTrue();
                const expectedState: SixState =
                    SixState.fromRepresentation(expectedBoard, 11);
                // const resultingState: SixState = rules.applyLegalMove(move, state, status.get());
                // expect(resultingState.pieces.equals(expectedState.pieces)).toBeTrue();
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: SixNode = new SixNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
            });
            it('Should consider winner player who align 6 pieces (playing in the middle)', () => {
                // Given a board where player zero is about to win
                const board: number[][] = [
                    [_, _, _, _, _, O],
                    [_, _, _, _, O, X],
                    [_, _, _, O, X, _],
                    [_, _, _, X, X, _],
                    [_, O, X, _, _, _],
                    [O, O, _, _, _, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 10);

                // When playing the winning move
                const move: SixMove = SixMove.fromDrop(new Coord(2, 3));

                // Then the bord should be a victory
                const expectedBoard: number[][] = [
                    [_, _, _, _, _, O],
                    [_, _, _, _, O, X],
                    [_, _, _, O, X, _],
                    [_, _, O, X, X, _],
                    [_, O, X, _, _, _],
                    [O, O, _, _, _, _],
                ];
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 11);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: SixNode = new SixNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
            });
            it('Should consider winner player who draw a circle/hexagon of his pieces', () => {
                // Given a board close to be a victory
                const board: number[][] = [
                    [_, _, _, _, X],
                    [O, _, _, X, _],
                    [O, _, _, X, _],
                    [O, X, _, X, O],
                    [X, X, X, _, _],
                    [_, _, O, X, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 9);

                // When creating a winning hexagon/circle
                const move: SixMove = SixMove.fromDrop(new Coord(2, 2));

                // Then board should be a victory
                const expectedBoard: number[][] = [
                    [_, _, _, _, X],
                    [O, _, _, X, _],
                    [O, _, X, X, _],
                    [O, X, _, X, O],
                    [X, X, X, _, _],
                    [_, _, O, X, _],
                ];
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 10);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: SixNode = new SixNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
            it('Should consider winner player who draw a triangle of his pieces (corner drop)', () => {
                // Given a bboard about to have a triangle victory
                const board: number[][] = [
                    [O, X, _, X, _],
                    [O, _, _, _, _],
                    [O, _, X, X, O],
                    [O, X, X, X, _],
                    [O, O, _, X, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 11);

                // When placing the last piece of the triangle
                const move: SixMove = SixMove.fromDrop(new Coord(3, 1));

                // Then the board should be a victory
                const expectedBoard: number[][] = [
                    [O, X, _, X, _],
                    [O, _, _, X, _],
                    [O, _, X, X, O],
                    [O, X, X, X, _],
                    [O, O, _, X, _],
                ];
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 12);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: SixNode = new SixNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
            it('Should consider winner player who draw a triangle of his pieces (edge drop)', () => {
                // Given a board where a triangle is about to be created
                const board: number[][] = [
                    [O, _, _, _, X],
                    [O, X, _, X, _],
                    [O, _, _, X, O],
                    [O, X, X, X, _],
                    [X, O, _, _, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 11);

                // When playing on the last empty edge of the triangle
                const move: SixMove = SixMove.fromDrop(new Coord(2, 2));

                // Then the move should be a success and the game should be over
                const expectedBoard: number[][] = [
                    [O, _, _, _, X],
                    [O, X, _, X, _],
                    [O, _, X, X, O],
                    [O, X, X, X, _],
                    [X, O, _, _, _],
                ];
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 12);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: SixNode = new SixNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
            it('Should consider winner player who draw a circle/hexagon of his pieces (coverage remix)', () => {
                // Given a board with an hexagon about to be created
                const board: number[][] = [
                    [O, _, _, _, _],
                    [O, _, _, X, _],
                    [O, X, _, X, O],
                    [O, X, X, _, _],
                    [_, _, O, X, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 9);

                // When completing it
                const move: SixMove = SixMove.fromDrop(new Coord(2, 1));

                // Then the move should be a victory
                const expectedBoard: number[][] = [
                    [O, _, _, _, _],
                    [O, _, X, X, _],
                    [O, X, _, X, O],
                    [O, X, X, _, _],
                    [_, _, O, X, _],
                ];
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 10);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: SixNode = new SixNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
        });
        describe('Disconnection Victories', () => {
            it('Should consider looser PLAYER.ZERO when he drop bellow 6 pieces on phase two', () => {
                // Given a board in phase two
                const board: NumberTable = [
                    [O, O, X, _, _],
                    [_, O, X, _, _],
                    [_, O, X, _, _],
                    [_, O, X, _, O],
                    [_, _, X, X, O],
                ];
                const state: SixState = SixState.fromRepresentation(board, 43);

                // When making the opponent pass bellow 6 pieces
                const move: SixMove = SixMove.fromMovement(new Coord(3, 4), new Coord(3, 0));

                // Then the move should be a victory
                const expectedBoard: NumberTable = [
                    [O, O, X, X],
                    [_, O, X, _],
                    [_, O, X, _],
                    [_, O, X, _],
                    [_, _, X, _],
                ];
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 44);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: SixNode = new SixNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
            it('Should consider looser PLAYER.ONE when he drop bellow 6 pieces on phase two', () => {
                // Given a board in phase 2
                const board: NumberTable = [
                    [X, X, O, _, _],
                    [_, X, O, _, _],
                    [_, X, O, _, _],
                    [_, X, O, _, X],
                    [_, _, O, O, X],
                ];
                const state: SixState = SixState.fromRepresentation(board, 42);

                // When making the opponent drop bellow 5 pieces
                const move: SixMove = SixMove.fromMovement(new Coord(3, 4), new Coord(3, 0));

                // Then the move should be a victory
                const expectedBoard: NumberTable = [
                    [X, X, O, O],
                    [_, X, O, _],
                    [_, X, O, _],
                    [_, X, O, _],
                    [_, _, O, _],
                ];
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 43);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: SixNode = new SixNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
            });
            it('Should consider winner Player who has more pieces than opponent and both have less than 6 (Player.ZERO)', () => {
                // Given a board in phase 2
                const board: number[][] = [
                    [_, _, _, _, _, O, X, X],
                    [O, O, O, O, O, _, _, O],
                    [_, _, _, _, X, _, _, _],
                    [_, _, X, X, X, _, _, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 40);

                // When making both player drop bellow 6 pieces
                const move: SixMove = SixMove.fromMovement(new Coord(4, 1), new Coord(-1, 1));

                // Then the one with the more pieces remaining win
                const expectedBoard: number[][] = [
                    [O, O, O, O, O],
                ];
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 41);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: SixNode = new SixNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
            });
            it('Should consider winner Player who has more pieces than opponent and both have less than 6 (Player.ONE)', () => {
                // Given a board in phase 2
                const board: number[][] = [
                    [_, _, _, _, _, X, O],
                    [X, X, X, X, O, _, _],
                    [X, _, _, _, O, _, _],
                    [_, _, _, O, O, _, _],
                ];
                const state: SixState = SixState.fromRepresentation(board, 42);

                // When dropping both player bellow 6 pieces
                const move: SixMove = SixMove.fromMovement(new Coord(4, 1), new Coord(6, 1));

                // Then the player with the more piece win
                const expectedBoard: number[][] = [
                    [X, X, X, X],
                    [X, _, _, _],
                ];
                const expectedState: SixState = SixState.fromRepresentation(expectedBoard, 43);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: SixNode = new SixNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
        });
    });
});
