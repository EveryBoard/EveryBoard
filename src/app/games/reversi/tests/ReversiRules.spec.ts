import { ReversiLegalityInformation, ReversiNode, ReversiRules } from '../ReversiRules';
import { ReversiMinimax } from '../ReversiMinimax';
import { ReversiMove } from '../ReversiMove';
import { ReversiState } from '../ReversiState';
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Minimax } from 'src/app/jscaip/Minimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Table } from 'src/app/utils/ArrayUtils';

describe('ReversiRules', () => {

    const _: Player = Player.NONE;
    const X: Player = Player.ONE;
    const O: Player = Player.ZERO;

    let rules: ReversiRules;
    let minimaxes: Minimax<ReversiMove, ReversiState, ReversiLegalityInformation>[];

    beforeEach(() => {
        rules = new ReversiRules(ReversiState);
        minimaxes = [
            new ReversiMinimax(rules, 'ReversiMinimax'),
        ];
    });
    it('ReversiRules should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gameState.turn).withContext('Game should start a turn 0').toBe(0);
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
        rules.node = new ReversiNode(state);
        expect(rules.choose(ReversiMove.PASS)).toBeTrue();
    });
    describe('Endgames', () => {
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
            const expectedState: ReversiState = new ReversiState(expectedBoard, 60);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            const node: ReversiNode = new ReversiNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
        });
        it('Should consider the player with the more point the winner at the end (Player.ZERO remix)', () => {
            const board: Table<Player> = [
                [X, O, O, O, O, O, O, X],
                [X, O, O, X, X, O, O, X],
                [X, O, X, O, O, O, O, X],
                [X, O, O, O, O, O, O, X],
                [X, O, O, O, X, X, O, X],
                [X, O, O, X, X, X, O, X],
                [X, X, X, X, X, X, X, X],
                [_, X, X, X, X, X, O, X],
            ];
            const expectedBoard: Table<Player> = [
                [X, O, O, O, O, O, O, X],
                [X, O, O, X, X, O, O, X],
                [X, O, X, O, O, O, O, X],
                [X, O, O, O, O, O, O, X],
                [X, O, O, O, X, X, O, X],
                [X, O, O, X, X, X, O, X],
                [X, O, X, X, X, X, X, X],
                [O, O, O, O, O, O, O, X],
            ];
            const state: ReversiState = new ReversiState(board, 60);
            const move: ReversiMove = new ReversiMove(0, 7);
            const expectedState: ReversiState = new ReversiState(expectedBoard, 61);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            const node: ReversiNode = new ReversiNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
        });
        it('Should recognize draws', () => {
            const board: Table<Player> = [
                [O, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [_, O, O, O, X, X, X, X],
            ];
            const expectedBoard: Table<Player> = [
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
            ];
            const state: ReversiState = new ReversiState(board, 60);
            const move: ReversiMove = new ReversiMove(0, 7);
            const expectedState: ReversiState = new ReversiState(expectedBoard, 61);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            const node: ReversiNode = new ReversiNode(expectedState,
                                                      MGPOptional.empty(),
                                                      MGPOptional.of(move));
            RulesUtils.expectToBeDraw(rules, node, minimaxes);
        });
    });
});
