/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { PlayerNumberMap } from '../../../../jscaip/PlayerMap';
import { Table } from '../../../../jscaip/TableUtils';
import { RulesUtils } from '../../../../jscaip/tests/RulesUtils.spec';
import { GoFailure } from '../../GoFailure';
import { GoMove } from '../../GoMove';
import { GoPhase } from '../../GoPhase';
import { GoPiece } from '../../GoPiece';
import { GoState } from '../../GoState';
import { RectangularGoConfig, AbstractRectangularGoRules } from '../../abstract-rectangular-go/AbstractRectangularGoRules';
import { ZoomedGoRules } from '../ZoomedGoRules';

describe('ZoomedGoRules', () => {

    let rules: AbstractRectangularGoRules;

    const X: GoPiece = GoPiece.LIGHT;
    const O: GoPiece = GoPiece.DARK;
    const _: GoPiece = GoPiece.EMPTY;

    const config: RectangularGoConfig = {
        width: 5,
        height: 5,
        handicap: 0,
        zoom: 1,
        showZooms: true,
    };

    const customConfig: RectangularGoConfig = {
        ...config,
        zoom: 2,
    };

    const noCaptures: PlayerNumberMap = PlayerNumberMap.of(0, 0);

    beforeEach(() => {
        rules = ZoomedGoRules.get();
    });

    it('should capture piece surrounded at higher zooms', () => {
        // Given:
        // - a config with zoom = 2
        // - a board with an atari on zoom=2 (capture threat)
        const board: Table<GoPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [X, _, O, _, X],
            [_, _, _, _, _],
            [_, _, X, _, _],
        ];
        const state: GoState =
            new GoState(board, noCaptures, 1, MGPOptional.empty(), GoPhase.PLAYING);

        // When doing the capture
        const move: GoMove = new GoMove(2, 0);

        // Then the move should be considered legal
        const expectedBoard: Table<GoPiece> = [
            [_, _, X, _, _],
            [_, _, _, _, _],
            [X, _, _, _, X],
            [_, _, _, _, _],
            [_, _, X, _, _],
        ];
        const expectedState: GoState = new GoState(expectedBoard,
                                                   PlayerNumberMap.of(0, 1),
                                                   2,
                                                   MGPOptional.empty(),
                                                   GoPhase.PLAYING);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
    });

    it('should capture piece surrounded at zoom=1', () => {
        // Given:
        // - a config with zoom = 2
        // - a board with an atari on zoom=1 (capture threat)
        const board: Table<GoPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, X, O, X, _],
            [_, _, X, _, _],
            [_, _, _, _, _],
        ];
        const state: GoState =
            new GoState(board, noCaptures, 1, MGPOptional.empty(), GoPhase.PLAYING);

        // When doing the capture
        const move: GoMove = new GoMove(2, 1);

        // Then the move should be considered legal
        const expectedBoard: Table<GoPiece> = [
            [_, _, _, _, _],
            [_, _, X, _, _],
            [_, X, _, X, _],
            [_, _, X, _, _],
            [_, _, _, _, _],
        ];
        const expectedState: GoState = new GoState(expectedBoard,
                                                   PlayerNumberMap.of(0, 1),
                                                   2,
                                                   MGPOptional.empty(),
                                                   GoPhase.PLAYING);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
    });

    it('should forbid suicide at higher zooms', () => {
        // Given:
        // - a config with zoom = 2
        // - a board with a coord without freedom on zoom = 2
        const board: Table<GoPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [X, _, _, _, _],
            [_, _, _, _, _],
            [_, _, X, _, _],
        ];
        const state: GoState =
            new GoState(board, noCaptures, 0, MGPOptional.empty(), GoPhase.PLAYING);

        // When trying to play in that coord without capturing
        const move: GoMove = new GoMove(0, 4);

        // Then the move should be illegal
        const reason: string = GoFailure.CANNOT_COMMIT_SUICIDE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
    });

    it('should forbid suicide in one zoom even if it captures on another zoom', () => {
         // Given:
        // - a config with zoom = 2
        // - a board with a coord without freedom on zoom = 2 that could capture in zoom = 1
        const board: Table<GoPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, O, _, _, _],
            [X, _, _, _, _],
            [O, _, _, O, _],
        ];
        const state: GoState =
            new GoState(board, noCaptures, 1, MGPOptional.empty(), GoPhase.PLAYING);

        // When trying to play that illegal "fake suicide" (hence real suicide)
        const move: GoMove = new GoMove(1, 4);

        // Then the move should be illegal
        const reason: string = GoFailure.CANNOT_COMMIT_SUICIDE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
    });

    it('should allow suicide at zoom=x if a capture on another zoom remove a threat at zoom=x', () => {
        // Given:
        // - a config with zoom = 2
        // - a board with several piece -- including square A (2, 0) -- capturable at zoom = 1,
        //      by playing on square B (4, 0)
        // - that square B being threatened on zoom = 2 by square A
        const board: Table<GoPiece> = [
            [X, X, X, X, _],
            [O, O, O, O, _],
            [_, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: GoState =
            new GoState(board, noCaptures, 0, MGPOptional.empty(), GoPhase.PLAYING);

        // When trying to play at that coord B which
        //     - is a real suicide at zoom = 2 (aka has no freedom and captured nothing)
        //     - capture A (via zoom = 1), one of those pieces threatening it at zoom = 2
        const move: GoMove = new GoMove(4, 0);

        // Then the move should be legal
        const expectedBoard: Table<GoPiece> = [
            [_, _, _, _, O],
            [O, O, O, O, _],
            [_, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedState: GoState = new GoState(expectedBoard,
                                                   PlayerNumberMap.of(4, 0),
                                                   1,
                                                   MGPOptional.empty(),
                                                   GoPhase.PLAYING);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
    });

    it('should still forbid suicide on zoom=1', () => {
        // Given:
        // - a config with zoom = 2
        // - a board with a coord without freedom on zoom = 1
        const board: Table<GoPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [X, _, _, _, _],
            [_, X, _, _, _],
        ];
        const state: GoState =
            new GoState(board, noCaptures, 0, MGPOptional.empty(), GoPhase.PLAYING);

        // When trying to play in that coord without capturing
        const move: GoMove = new GoMove(0, 4);

        // Then the move should be illegal
        const reason: string = GoFailure.CANNOT_COMMIT_SUICIDE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
    });

});
