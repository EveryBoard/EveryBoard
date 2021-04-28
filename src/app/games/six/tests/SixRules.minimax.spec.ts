import { Coord } from 'src/app/jscaip/coord/Coord';
import { Player } from 'src/app/jscaip/player/Player';
import { expectFirstStateToWorthMoreThanSecond, expectStateToBePreVictory } from 'src/app/utils/TestUtils.spec';
import { SixGameState } from '../SixGameState';
import { SixMove } from '../SixMove';
import { SixRules } from '../SixRules';

describe('Six.Minimax', () => {

    let rules: SixRules;

    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;
    const _: number = Player.NONE.value;

    beforeEach(() => {
        rules = new SixRules(SixGameState);
    });
    it('should stop searching for something less good than what it has (victory > pre-victory > sum', () => {
        expect('shit').toBe('correct');
    });
    describe('pre-victories', () => {
        it('should know that 5 pieces aligned with two empty extension mean PRE_VICTORY', () => {
            const state: SixGameState = SixGameState.fromRepresentation([
                [X, X, X, X, X],
            ], 1);
            const previousMove: SixMove = SixMove.fromDrop(new Coord(0, 0));
            expectStateToBePreVictory(state, previousMove, Player.ONE, rules);
        });
        it('should know that full-bowtie aligned with two empty extension mean PRE_VICTORY', () => {
            const state: SixGameState = SixGameState.fromRepresentation([
                [O, O, O, O, O],
                [O, O, O, X, O],
                [O, X, X, X, O],
                [O, X, X, _, O],
                [O, _, O, O, O],
                [O, O, O, O, O],

            ], 2);
            const previousMove: SixMove = SixMove.fromDrop(new Coord(1, 3));
            expectStateToBePreVictory(state, previousMove, Player.ONE, rules);
        });
    });
    describe('4 pieces aligned is better than 3 pieces aligned', () => {
        it('should be true with lines', () => {
            const move: SixMove = SixMove.fromDrop(new Coord(1, 1));
            const weakerState: SixGameState = SixGameState.fromRepresentation([
                [O, O, O, O, O, O],
                [O, X, X, X, _, _],
                [O, O, O, O, O, O],
            ], 4);
            const strongerState: SixGameState = SixGameState.fromRepresentation([
                [O, O, O, O, O, O],
                [O, X, X, X, X, _],
                [O, O, O, O, O, O],
            ], 4);
            expectFirstStateToWorthMoreThanSecond(weakerState, move, strongerState, move, rules);
        });
        it('should be true with triangle', () => {
            const move: SixMove = SixMove.fromDrop(new Coord(1, 3));
            const weakerState: SixGameState = SixGameState.fromRepresentation([
                [O, O, O, O, O],
                [O, X, _, _, O],
                [O, X, _, O, O],
                [O, X, O, O, _],
                [O, O, O, _, _],
            ], 4);
            const strongerState: SixGameState = SixGameState.fromRepresentation([
                [O, O, O, O, O],
                [O, X, X, X, O],
                [O, _, _, O, O],
                [O, X, O, O, _],
                [O, O, O, _, _],
            ], 4);
            expectFirstStateToWorthMoreThanSecond(weakerState, move, strongerState, move, rules);
        });
        it('should be true with circle', () => {
            const move: SixMove = SixMove.fromDrop(new Coord(2, 1));
            const weakerState: SixGameState = SixGameState.fromRepresentation([
                [_, O, O, O, O],
                [O, O, X, X, O],
                [O, _, O, X, O],
                [O, _, _, O, O],
                [O, O, O, O, _],
            ], 4);
            const strongerState: SixGameState = SixGameState.fromRepresentation([
                [_, O, O, O, O],
                [O, O, X, X, O],
                [O, _, O, X, O],
                [O, _, X, O, O],
                [O, O, O, O, _],
            ], 4);
            expectFirstStateToWorthMoreThanSecond(weakerState, move, strongerState, move, rules);
        });
    });
    describe('4 pieces aligned with two spaces should be better than 4 aligned with two ennemies', () => {
        it('should be true with lines', () => {
            const move: SixMove = SixMove.fromDrop(new Coord(1, 1));
            const weakerState: SixGameState = SixGameState.fromRepresentation([
                [O, O, O, O, O, O],
                [O, X, X, X, X, O],
                [O, O, O, O, O, O],
            ], 6);
            const strongerState: SixGameState = SixGameState.fromRepresentation([
                [O, O, O, O, O, O],
                [_, X, X, X, X, _],
                [O, O, O, O, O, O],
            ], 6);
            expectFirstStateToWorthMoreThanSecond(weakerState, move, strongerState, move, rules);
        });
    });
    describe('Phase 2', () => {
        it('Should not consider moving piece that are blocking an ennemy victory');
        // TODO: comparing what's best between that calculation and Phase 1 one
        it('Score after 40th turn should be a substraction of the number of piece', () => {
            const state: SixGameState = SixGameState.fromRepresentation([
                [X, X, X, X, O, O, O, O, O],
                [X, X, X, X, O, O, O, O, O],
            ], 40);
            expect(rules.getBoardValue(SixMove.fromDrop(new Coord(1, 1)), state)).toBe(2);
        });
    });
});
