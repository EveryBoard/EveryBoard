/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { TrexoMove } from '../TrexoMove';
import { TrexoNode, TrexoRules, TrexoRulesFailure } from '../TrexoRules';
import { TrexoSpace, TrexoState } from '../TrexoState';

const _____: TrexoSpace = TrexoSpace.EMPTY;
const O1_T0: TrexoSpace = new TrexoSpace(Player.ZERO, 1, 0);
const X1_T0: TrexoSpace = new TrexoSpace(Player.ONE, 1, 0);
const O1_T1: TrexoSpace = new TrexoSpace(Player.ZERO, 1, 1);
const X1_T1: TrexoSpace = new TrexoSpace(Player.ONE, 1, 1);
const O2_T2: TrexoSpace = new TrexoSpace(Player.ZERO, 2, 2);
const X2_T2: TrexoSpace = new TrexoSpace(Player.ONE, 2, 2);
const X1_T3: TrexoSpace = new TrexoSpace(Player.ONE, 1, 3);
const O1_T3: TrexoSpace = new TrexoSpace(Player.ZERO, 1, 3);
const X1_T4: TrexoSpace = new TrexoSpace(Player.ONE, 1, 4);
const O1_T4: TrexoSpace = new TrexoSpace(Player.ZERO, 1, 4);

fdescribe('TrexoRules', () => {

    let rules: TrexoRules;
    let minimaxes: Minimax<TrexoMove, TrexoState>[];

    beforeEach(() => {
        rules = TrexoRules.get();
        minimaxes = [
        ];// TODOTODO
    });
    it('should accept to drop piece on the floor', () => {
        // Given any board where to space on the floor are free
        const state: TrexoState = TrexoState.getInitialState();

        // When dropping the piece
        const move: TrexoMove = TrexoMove.from(new Coord(4, 4), new Coord(4, 3)).get();

        // Then it should succeed
        const expectedState: TrexoState = TrexoState.from([
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, X1_T0, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, O1_T0, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
        ], 1).get();
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should refuse to drop piece on top of only one other piece', () => {
        // Given a board with a piece already on it
        const state: TrexoState = TrexoState.from([
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, X1_T0, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, O1_T0, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
        ], 1).get();

        // When dropping your piece over it
        const move: TrexoMove = TrexoMove.from(new Coord(4, 4), new Coord(4, 3)).get();

        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, TrexoRulesFailure.CANNOT_DROP_ON_ONLY_ONE_PIECE());
    });
    it('should accept to drop piece on two other piece', () => {
        // Given a board with two pieces that are neighbor on it
        const state: TrexoState = TrexoState.from([
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, X1_T0, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, O1_T0, O1_T1, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, X1_T1, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
        ], 2).get();

        // When dropping the new piece part-way on the first piece part-way on the second
        const move: TrexoMove = TrexoMove.from(new Coord(4, 4), new Coord(5, 4)).get();

        // Then it should be a success
        const expectedState: TrexoState = TrexoState.from([
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, X1_T0, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, O2_T2, X2_T2, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, X1_T1, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
        ], 3).get();
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should refuse dropping piece when both landing square are not on the same level', () => {
        // Given a board with one piece
        const state: TrexoState = TrexoState.from([
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, X1_T0, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, O1_T0, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
        ], 1).get();

        // When trying to drop another piece partially on it, partially on the floor
        const move: TrexoMove = TrexoMove.from(new Coord(4, 4), new Coord(5, 4)).get();

        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, TrexoRulesFailure.CANNOT_DROP_PIECE_ON_UNEVEN_GROUNDS())
    });
    it('should declare as winner player who has a line of 5', () => {
        // Given a board where a player has a line of 4
        const state: TrexoState = TrexoState.from([
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, O1_T0, _____, O2_T2, _____, _____, _____, _____],
            [_____, _____, _____, X1_T0, X1_T1, X2_T2, X1_T3, _____, _____, _____],
            [_____, _____, _____, _____, O1_T1, _____, O1_T3, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
        ], 4).get();

        // When the drop align 5 piece of yours
        const move: TrexoMove = TrexoMove.from(new Coord(7, 2), new Coord(7, 3)).get();

        // Then you should be declared winner
        const expectedState: TrexoState = TrexoState.from([
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, O1_T0, _____, O2_T2, _____, O1_T4, _____, _____],
            [_____, _____, _____, X1_T0, X1_T1, X2_T2, X1_T3, X1_T4, _____, _____],
            [_____, _____, _____, _____, O1_T1, _____, O1_T3, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
        ], 5).get();
        const node: TrexoNode = new MGPNode(expectedState);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('shoud declare looser the player who align 5 piece of the opponent', () => {
        // Given a board where a player's opponent has a line of 4
        const state: TrexoState = TrexoState.from([
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, O1_T0, _____, O2_T2, _____, _____, _____, _____],
            [_____, _____, _____, X1_T0, X1_T1, X2_T2, X1_T3, _____, _____, _____],
            [_____, _____, _____, _____, O1_T1, _____, O1_T3, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
        ], 5).get();

        // When the drop align a fifth piece of the opponent
        const move: TrexoMove = TrexoMove.from(new Coord(7, 2), new Coord(7, 3)).get();

        // Then you should be declared looser
        const expectedState: TrexoState = TrexoState.from([
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, O1_T0, _____, O2_T2, _____, O1_T4, _____, _____],
            [_____, _____, _____, X1_T0, X1_T1, X2_T2, X1_T3, X1_T4, _____, _____],
            [_____, _____, _____, _____, O1_T1, _____, O1_T3, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
        ], 5).get();
        const node: TrexoNode = new MGPNode(expectedState);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('should declare winner the player who align 5 piece of both players', () => {
        // TODO FOF REVIEW: this is not mentionned in the rules, afain
        // Alternatives to this,
        //      the epaminondas way, first to have one more victory than the opponent ?
        //      the lame way, draw:
        //          I don't think it applies (they just say "when *you* aligne 5 of your pieces, you win")
        //      the weird way: you win ?

    });
});
