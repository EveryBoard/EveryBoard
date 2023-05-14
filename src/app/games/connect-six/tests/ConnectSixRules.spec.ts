/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ConnectSixNode, ConnectSixRules } from '../ConnectSixRules';
import { ConnectSixState } from '../ConnectSixState';
import { ConnectSixDrops, ConnectSixFirstMove, ConnectSixMove } from '../ConnectSixMove';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('ConnectSixRules', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    let rules: ConnectSixRules;

    let minimaxes: Minimax<ConnectSixMove, ConnectSixState>[];

    beforeEach(() => {
        rules = ConnectSixRules.get();
        minimaxes = [
        ];
    });
    describe('first turn', () => {
        it('shoud allow the first player play only one piece', () => {
            // Given the initial state
            const state: ConnectSixState = ConnectSixState.getInitialState();

            // When dropping one piece
            const move: ConnectSixMove = ConnectSixFirstMove.from(new Coord(9, 9)) as ConnectSixMove;
            const expectedState: ConnectSixState = new ConnectSixState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);

            // Then the move should be a success
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should refuse move that drop two pieces on first turn', () => {
            // Given the first turn
            const state: ConnectSixState = ConnectSixState.getInitialState();
            // When dropping two pieces
            const move: ConnectSixMove =
                ConnectSixDrops.from(new Coord(11, 11), new Coord(10, 10)).get() as ConnectSixMove;
            // Then the attempt would have throw
            function tryDoubleDropOnFirstTurn(): void {
                rules.isLegal(move, state);
            }
            RulesUtils.expectToThrowAndLog(tryDoubleDropOnFirstTurn, 'First move should be instance of ConnectSixFirstMove');
        });
    });
    describe('next turns', () => {
        it('should refuse dropping first coord on another piece', () => {
            // Given a board with pieces on it
            const state: ConnectSixState = new ConnectSixState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);

            // When dropping piece on it with the first coord already occupied
            const move: ConnectSixMove =
                ConnectSixDrops.from(new Coord(9, 9), new Coord(10, 10)).get() as ConnectSixMove;

            // Then the move should be forbidden
            RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        });
        it('should refuse dropping second coord on another piece', () => {
            // Given a board with pieces on it
            const state: ConnectSixState = new ConnectSixState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);

            // When dropping piece on it with the second coord already occupied
            const move: ConnectSixMove = ConnectSixDrops.from(new Coord(8, 8), new Coord(9, 9)).get() as ConnectSixMove;

            // Then the move should be forbidden
            RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        });
        it('should allow move that drop two pieces on empty pieces', () => {
            // Given a board with pieces on it
            const state: ConnectSixState = new ConnectSixState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);

            // When dropping pieces on empty squares
            const move: ConnectSixMove = ConnectSixDrops.from(new Coord(7, 7), new Coord(8, 8)).get() as ConnectSixMove;
            const expectedState: ConnectSixState = new ConnectSixState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 2);

            // Then the move should be forbidden
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should refuse dropping only one piece after first turn', () => {
            // Given a board that is not first turn
            const state: ConnectSixState = new ConnectSixState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);
            // When dropping only one piece
            const move: ConnectSixMove = ConnectSixFirstMove.from(new Coord(9, 9)) as ConnectSixMove;

            // Then the move should be forbidden
            function trySingleDropAfterFirstTurn(): void {
                rules.isLegal(move, state);
            }
            RulesUtils.expectToThrowAndLog(trySingleDropAfterFirstTurn, 'non-firsts moves should be instance of ConnectSixDrops');
        });
        it('should notify victory when aligning 6 stones of your color', () => {
            const state: ConnectSixState = new ConnectSixState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _],
                [_, _, _, _, _, X, X, X, X, X, X, O, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, X, O, O, O, O, O, X, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 8);
            const node: ConnectSixNode = new ConnectSixNode(state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
        });
        it('should draw when no one can play anymore', () => {
            // Given the wildly unlikely case in which in 180 turn no one win
            const state: ConnectSixState = new ConnectSixState([
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [O, O, O, O, O, X, X, X, X, X, O, O, O, O, O, X, X, X, X],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [O, O, O, O, O, X, X, X, X, X, O, O, O, O, O, X, X, X, X],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [O, O, O, O, O, X, X, X, X, X, O, O, O, O, O, X, X, X, X],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, O, X, O, X, O, X, O, X, O, X, O, X, O, X, O, X, _, _],
            ], 180);
            // When playing the last 181st turn
            const move: ConnectSixMove =
                ConnectSixDrops.from(new Coord(17, 18), new Coord(18, 18)).get() as ConnectSixMove;
            const expectedState: ConnectSixState = new ConnectSixState([
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [O, O, O, O, O, X, X, X, X, X, O, O, O, O, O, X, X, X, X],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [O, O, O, O, O, X, X, X, X, X, O, O, O, O, O, X, X, X, X],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [O, O, O, O, O, X, X, X, X, X, O, O, O, O, O, X, X, X, X],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, O, X, O, X, O, X, O, X, O, X, O, X, O, X, O, X, O, O],
            ], 181);

            // Then the board should be a draw
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            const node: ConnectSixNode = new ConnectSixNode(expectedState);
            RulesUtils.expectToBeDraw(rules, node, minimaxes);
        });
    });
});
