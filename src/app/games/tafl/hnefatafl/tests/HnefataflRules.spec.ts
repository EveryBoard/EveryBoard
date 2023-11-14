/* eslint-disable max-lines-per-function */
import { HnefataflNode, HnefataflRules } from '../HnefataflRules';
import { HnefataflMove } from '../HnefataflMove';
import { Coord } from 'src/app/jscaip/Coord';
import { TaflPawn } from '../../TaflPawn';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { TaflFailure } from '../../TaflFailure';
import { TaflConfig } from '../../TaflConfig';
import { TaflState } from '../../TaflState';

describe('HnefataflRules', () => {

    let rules: HnefataflRules;
    const defaultConfig: TaflConfig = HnefataflRules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;
    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
    const X: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(() => {
        rules = HnefataflRules.get();
    });

    it('should be created', () => {
        expect(rules).toBeTruthy();
    });

    it('Capture should work', () => {
        const board: Table<TaflPawn> = [
            [_, A, _, _, _, _, _, _, _],
            [_, O, O, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, _, A, _, _, _, _, _, _],
            [_, O, _, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 3);
        const move: HnefataflMove = HnefataflMove.of(new Coord(1, 0), new Coord(2, 0));
        const expectedState: TaflState = new TaflState(expectedBoard, 4);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('Capturing against empty throne should work', () => {
        const board: Table<TaflPawn> = [
            [_, O, _, A, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, _, A, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 3);
        const move: HnefataflMove = HnefataflMove.of(new Coord(3, 0), new Coord(2, 0));
        const expectedState: TaflState = new TaflState(expectedBoard, 4);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('Capturing king should require four invader and lead to victory', () => {
        const board: Table<TaflPawn> = [
            [_, _, O, _, _, _, _, _, _, _, _],
            [_, _, O, A, O, _, _, _, _, _, _],
            [_, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, O, _, _, _, _, _, _, _],
            [_, _, O, _, O, _, _, _, _, _, _],
            [_, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 0);
        const move: HnefataflMove = HnefataflMove.of(new Coord(2, 0), new Coord(3, 0));
        const expectedState: TaflState = new TaflState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        const node: HnefataflNode =
            new HnefataflNode(expectedState, undefined, MGPOptional.of(move), MGPOptional.of(defaultConfig));
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO);
    });

    it('Capturing king should require three invader and an edge lead to victory', () => {
        const board: Table<TaflPawn> = [
            [_, _, O, A, O, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, _, O, _, O, _, _, _, _, _, _],
            [_, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 0);
        const move: HnefataflMove = HnefataflMove.of(new Coord(2, 1), new Coord(3, 1));
        const expectedState: TaflState = new TaflState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        const node: HnefataflNode =
            new HnefataflNode(expectedState, undefined, MGPOptional.of(move), MGPOptional.of(defaultConfig));
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO);
    });

    it('Capturing king with one soldier, one throne, and one edge should not work', () => {
        const board: Table<TaflPawn> = [
            [_, A, O, _, _, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, A, O, _, _, _, _, _, _, _, _],
            [_, O, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 2);
        const move: HnefataflMove = HnefataflMove.of(new Coord(2, 1), new Coord(1, 1));
        const expectedState: TaflState = new TaflState(expectedBoard, 3);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        const node: HnefataflNode =
            new HnefataflNode(expectedState, undefined, MGPOptional.of(move), MGPOptional.of(defaultConfig));
        // Then it should be considered as ongoing
        RulesUtils.expectToBeOngoing(rules, node);
    });

    it('Sandwiching king against a throne should not work', () => {
        // Given a board where the king could be sandwiched against the throne
        const board: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 0);

        // When trying to sandwich
        const move: HnefataflMove = HnefataflMove.of(new Coord(2, 2), new Coord(4, 2));

        // Then the move should be legal but the king alive
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const expectedState: TaflState = new TaflState(expectedBoard, 1);
        const node: HnefataflNode =
            new HnefataflNode(expectedState, undefined, MGPOptional.of(move), MGPOptional.of(defaultConfig));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        // Then it should be considered as ongoing
        RulesUtils.expectToBeOngoing(rules, node);
    });

    it('Capturing king against a throne with 3 soldier should not work', () => {
        // Given a King about to be surrounded by 3 solder and a throne
        const board: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _, _, _, _],
            [_, _, _, O, A, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 12);

        // When attempting to surround him
        const move: HnefataflMove = HnefataflMove.of(new Coord(2, 2), new Coord(4, 2));

        // Then the move should be legal but the king not captured, and the part ongoing
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _, _, _],
            [_, _, _, O, A, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const expectedState: TaflState = new TaflState(expectedBoard, 13);
        const node: HnefataflNode =
            new HnefataflNode(expectedState, undefined, MGPOptional.of(move), MGPOptional.of(defaultConfig));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        RulesUtils.expectToBeOngoing(rules, node);
    });

    it('should allow King to come back on the throne', () => {
        // Given a board where the king is not on his throne but can go back
        const board: TaflPawn[][] = [
            [_, _, O, _, _, _, _, _, _, _, _],
            [_, _, O, _, O, _, _, _, _, _, _],
            [_, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _, _, _],
            [_, _, _, X, _, X, _, _, _, _, _],
            [_, _, _, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 1);

        // When moving the king back to his throne
        const move: HnefataflMove = HnefataflMove.of(new Coord(4, 3), new Coord(4, 4));

        // Then the move should be legal
        const expectedBoard: TaflPawn[][] = [
            [_, _, O, _, _, _, _, _, _, _, _],
            [_, _, O, _, O, _, _, _, _, _, _],
            [_, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, A, X, _, _, _, _, _],
            [_, _, _, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const expectedState: TaflState = new TaflState(expectedBoard, 2);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should forbid soldier to land on the central throne (5, 5)', () => {
        // Given a board where a soldier could reach the throne
        const board: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 1);

        // When trying to sit on the king's throne
        const move: HnefataflMove = HnefataflMove.of(new Coord(0, 5), new Coord(5, 5));

        // Then the move should be illegal
        const reason: string = TaflFailure.SOLDIERS_CANNOT_SIT_ON_THRONE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should not sandwich the king far from throne', () => {
        // Given a board where the king is next to a corner and one move ahead from sandwich
        const board: TaflPawn[][] = [
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, X, _, X, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [A, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 2);

        // When trying to sandwiching the king
        const move: HnefataflMove = HnefataflMove.of(new Coord(0, 4), new Coord(0, 6));

        // Then the move should be legal
        const expectedBoard: TaflPawn[][] = [
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, X, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _],
            [A, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];
        const expectedState: TaflState = new TaflState(expectedBoard, 3);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

});
