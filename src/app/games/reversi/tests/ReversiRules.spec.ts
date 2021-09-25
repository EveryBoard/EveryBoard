import { ReversiRules } from '../ReversiRules';
import { ReversiMinimax } from '../ReversiMinimax';
import { ReversiMove } from '../ReversiMove';
import { ReversiState } from '../ReversiState';
import { Player } from 'src/app/jscaip/Player';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Table } from 'src/app/utils/ArrayUtils';
import { ReversiLegalityStatus } from '../ReversiLegalityStatus';
import { expectToBeVictoryFor } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Minimax } from 'src/app/jscaip/Minimax';

describe('ReversiRules', () => {

    const _: Player = Player.NONE;
    const X: Player = Player.ONE;
    const O: Player = Player.ZERO;

    let rules: ReversiRules;
    let minimaxes: Minimax<ReversiMove, ReversiState, ReversiLegalityStatus>[];

    beforeEach(() => {
        rules = new ReversiRules(ReversiState);
        minimaxes = [
            new ReversiMinimax(rules, 'ReversiMinimax'),
        ];
    });
    it('ReversiRules should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gameState.turn).toBe(0, 'Game should start a turn 0');
        const moves: ReversiMove[] = minimaxes[0].getListMoves(rules.node); // TODO: generalise the poopydoldi
        expect(moves.length).toBe(4);
    });
    it('First move should be legal and change score', () => {
        const isLegal: boolean = rules.choose(new ReversiMove(2, 4));

        expect(isLegal).toBeTrue();
        expect(rules.node.gameState.countScore()).toEqual([4, 1]);
    });
    it('Passing at first turn should be illegal', () => {
        const isLegal: boolean = rules.choose(ReversiMove.PASS);

        expect(isLegal).toBeFalse();
    });
    it('should forbid non capturing move', () => {
        const moveLegality: boolean = rules.choose(new ReversiMove(0, 0));

        expect(moveLegality).toBeFalse();
    });
    it('should forbid choosing occupied case', () => {
        const moveLegality: boolean = rules.choose(new ReversiMove(3, 3));

        expect(moveLegality).toBeFalse();
    });
    it('Should allow player to pass when no other moves are possible', () => {
        const board: Table<Player> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, O, _, _, _],
        ];
        const state: ReversiState = new ReversiState(board, 1);
        rules.node = new MGPNode(null, null, state);
        const moves: ReversiMove[] = minimaxes[0].getListMoves(rules.node);
        // TODO: generalise le poop
        expect(moves.length).toBe(1);
        expect(moves[0]).toBe(ReversiMove.PASS);
        expect(rules.choose(ReversiMove.PASS)).toBeTrue();
    });
    it('Should consider the player with the more point the winner at the end', () => {
        const board: Table<Player> = [
            [O, X, X, X, X, X, X, O],
            [O, X, X, O, O, X, X, O],
            [O, X, O, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, O, O, X, O],
            [O, X, X, O, O, O, X, O],
            [O, O, O, O, O, O, O, O],
            [_, O, O, O, O, O, X, O],
        ];
        const expectedBoard: Table<Player> = [
            [O, X, X, X, X, X, X, O],
            [O, X, X, O, O, X, X, O],
            [O, X, O, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, O, O, X, O],
            [O, X, X, O, O, O, X, O],
            [O, X, O, O, O, O, O, O],
            [X, X, X, X, X, X, X, O],
        ];
        const state: ReversiState = new ReversiState(board, 59);
        const move: ReversiMove = new ReversiMove(0, 7);
        const status: ReversiLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: ReversiState = rules.applyLegalMove(move, state, status);
        const expectedState: ReversiState = new ReversiState(expectedBoard, 60);
        expect(resultingState).toEqual(expectedState);
        expectToBeVictoryFor(rules, new MGPNode(null, move, expectedState), Player.ONE, minimaxes);
    });
});
