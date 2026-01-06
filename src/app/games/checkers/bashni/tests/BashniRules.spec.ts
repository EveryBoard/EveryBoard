/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { CheckersMove } from '../../common/CheckersMove';
import { CheckersConfig } from '../../common/AbstractCheckersRules';
import { CheckersPiece, CheckersStack, CheckersState } from '../../common/CheckersState';
import { BashniRules } from '../BashniRules';

describe('BashniRules', () => {

    const zero: CheckersPiece = CheckersPiece.ZERO;
    const one: CheckersPiece = CheckersPiece.ONE;

    const __U: CheckersStack = new CheckersStack([zero]);
    const __V: CheckersStack = new CheckersStack([one]);
    const _UV: CheckersStack = new CheckersStack([zero, one]);
    const ___: CheckersStack = CheckersStack.EMPTY;

    let rules: BashniRules;
    const defaultConfig: MGPOptional<CheckersConfig> = BashniRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = BashniRules.get();
    });

    it('should create correct initial state for Bashni (8x8 board)', () => {
        // Given the Bashni rules
        // When getting the initial state
        const state: CheckersState = rules.getInitialState(defaultConfig);

        // Then the board should be 8x8 with correct initial setup
        expect(state.getWidth()).toBe(8);
        expect(state.getHeight()).toBe(8); // 3 rows player 1 (top) + 2 empty + 3 rows player 0 (bottom)
        // Verify pieces occupy odd squares (occupyEvenSquare: false)
        // Top-left corner (0,0) should be empty as we occupy odd squares
        expect(state.getPieceAt(new Coord(0, 0)).isEmpty()).toBeTrue();
        // Position (1,0) should have a piece
        expect(state.getPieceAt(new Coord(1, 0)).isEmpty()).toBeFalse();
    });

    it('should allow simple pieces to capture backwards in Bashni', () => {
        // Given a Bashni state where a simple piece can capture backwards
        const state: CheckersState = CheckersState.of([
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, __V, ___, ___, ___, ___, ___, ___],
            [__U, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
        ], 0);

        // When doing a backward capture with a simple piece
        const backwardCapture: CheckersMove = CheckersMove.fromCapture([new Coord(0, 5), new Coord(2, 3)]).get();

        // Then the move should succeed
        const expectedState: CheckersState = CheckersState.of([
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, _UV, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
        ], 1);
        RulesUtils.expectMoveSuccess(rules, state, backwardCapture, expectedState, defaultConfig);
    });

    it('should allow minority capture (not require maximal capture)', () => {
        // Given a Bashni state where player can capture 1 or 2 pieces
        const state: CheckersState = CheckersState.of([
            [___, __V, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, __V, ___, ___, ___, ___],
            [___, __V, ___, ___, ___, ___, ___, ___],
            [__U, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
        ], 0);

        // When trying to capture only one piece while a double capture is available
        // Can capture at (1,2) for single, or (1,2) then (3,0) for double
        const singleCapture: CheckersMove = CheckersMove.fromCapture([new Coord(0, 3), new Coord(2, 1)]).get();

        // Then it should be legal (minority capture is allowed)
        const expectedState: CheckersState = CheckersState.of([
            [___, __V, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, __V, ___, ___, ___, ___],
            [___, _UV, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
            [___, ___, ___, ___, ___, ___, ___, ___],
        ], 1);
        RulesUtils.expectMoveSuccess(rules, state, singleCapture, expectedState, defaultConfig);
    });

    it('should have the correct default configuration', () => {
        const config: CheckersConfig = defaultConfig.get();

        expect(config.width).toBe(8);
        expect(config.playerRows).toBe(3);
        expect(config.emptyRows).toBe(2);
        expect(config.canStackPieces).toBe(true);
        expect(config.mustMakeMaximalCapture).toBe(false);
        expect(config.simplePieceCanCaptureBackwards).toBe(true);
        expect(config.promotedPiecesCanFly).toBe(false);
        expect(config.occupyEvenSquare).toBe(false);
        expect(config.frisianCaptureAllowed).toBe(false);
    });

});
