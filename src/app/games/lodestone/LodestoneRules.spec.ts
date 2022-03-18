/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LodestoneFailure } from './LodestoneFailure';
import { LodestoneMove } from './LodestoneMove';
import { LodestonePiece, LodestonePieceLodestone, LodestonePieceNone, LodestonePiecePlayer } from './LodestonePiece';
import { LodestoneInfos, LodestoneNode, LodestoneRules } from './LodestoneRules';
import { LodestoneLodestones, LodestonePressurePlate, LodestonePressurePlates, LodestoneState } from './LodestoneState';

fdescribe('LodestoneRules', () => {
    const N: LodestonePiece = LodestonePieceNone.UNREACHABLE;
    const _: LodestonePiece = LodestonePieceNone.EMPTY;
    const A: LodestonePiece = LodestonePiecePlayer.ZERO;
    const B: LodestonePiece = LodestonePiecePlayer.ONE;

    const allPressurePlates: LodestonePressurePlates = {
        top: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
        bottom: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
        left: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
        right: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
    };

    const noLodestone: LodestoneLodestones = [MGPOptional.empty(), MGPOptional.empty()];


    let rules: LodestoneRules;
    let minimaxes: Minimax<LodestoneMove, LodestoneState, LodestoneInfos>[];

    beforeEach(() => {
        rules = LodestoneRules.get();
        minimaxes = [
            // TODO
        ];
    });

    it('should initially have 24 pieces for each player', () => {
        // TODO: move this to LodestoneState.spec.ts
        // Given the initial state
        const state: LodestoneState = LodestoneState.getInitialState();
        // When computing the number of pieces for each player
        const pieces: [number, number] = state.numberOfPieces();
        // Then we should have 24 for each player
        expect(pieces[0]).toBe(24);
        expect(pieces[1]).toBe(24);
    });
    it('should allow placing a lodestone on an empty square', () => {
        // Given any state
        const state: LodestoneState = LodestoneState.getInitialState();
        // When placing a lodestone on an empty square
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'pull', false, { top: 4, bottom: 0, left: 0, right: 0 });
        // Then the move should be legal
        expect(rules.isLegal(move, state).isSuccess()).toBeTrue();
    });
    it('should forbid placing a lodestone on a square occupied by a piece', () => {
        // Given any state
        const state: LodestoneState = LodestoneState.getInitialState();
        // When placing a lodestone on an occupied square
        const move: LodestoneMove = new LodestoneMove(new Coord(2, 2), 'pull', false);
        // Then the move should be illegal
        const reason: string = RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should forbid placing a lodestone on a square occupied by the lodestone of the opponent', () => {
        // Given a state with the opponent lodestone
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ONE, 'push');
        const board: Table<LodestonePiece> = [
            [X, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const lodestones: LodestoneLodestones = [
            MGPOptional.empty(),
            MGPOptional.of(new Coord(0, 0)),
        ];
        const state: LodestoneState = new LodestoneState(board, 0, lodestones, allPressurePlates);
        // When placing a lodestone on the opponent's lodestone
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'pull', false);
        // Then the move should be illegal
        const reason: string = RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should allow placing a lodestone on the square where it already was', () => {
        // Given a state with our lodestone
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'push');
        const board: Table<LodestonePiece> = [
            [X, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const lodestones: LodestoneLodestones = [
            MGPOptional.of(new Coord(0, 0)),
            MGPOptional.empty(),
        ];
        const state: LodestoneState = new LodestoneState(board, 0, lodestones, allPressurePlates);
        // When placing our lodestone on its previous sqaure
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'pull', false);
        // Then the move should be illegal
        const Y: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'pull');
        const expectedBoard: Table<LodestonePiece> = [
            [Y, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const expectedLodestones: LodestoneLodestones = [
            MGPOptional.of(new Coord(0, 0)),
            MGPOptional.empty(),
        ];
        const expectedState: LodestoneState =
            new LodestoneState(expectedBoard, 1, expectedLodestones, allPressurePlates);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should allow choosing freely the side of the lodestone when it is in the hands', () => {
        // Given the initial state
        const state: LodestoneState = LodestoneState.getInitialState();
        // When placing a lodestone in 'pull' or 'push' direction
        const pull: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'pull', false, { top: 4, bottom: 0, left: 0, right: 0 });
        const push: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'push', false, { top: 2, bottom: 0, left: 0, right: 0 });
        // Then both moves should be legal
        expect(rules.isLegal(pull, state).isSuccess()).toBeTrue();
        expect(rules.isLegal(push, state).isSuccess()).toBeTrue();
    });
    it('should forbid choosing the wrong side of the lodestone when it was already on the board (push)', () => {
        // Given a state where the lodestone is on the board
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'push');
        const board: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const lodestones: LodestoneLodestones = [
            MGPOptional.of(new Coord(4, 4)),
            MGPOptional.empty(),
        ];
        const state: LodestoneState = new LodestoneState(board, 0, lodestones, allPressurePlates);
        // When pllacing a lodestone in the same direction
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 3), 'push', false);
        // Then the move should be illegal
        const reason: string = LodestoneFailure.MUST_FLIP_LODESTONE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should forbid choosing the wrong side of the lodestone when it was already on the board (pull)', () => {
        // Given a state where the lodestone is on the board
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'pull');
        const board: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const lodestones: LodestoneLodestones = [
            MGPOptional.of(new Coord(4, 4)),
            MGPOptional.empty(),
        ];
        const state: LodestoneState = new LodestoneState(board, 0, lodestones, allPressurePlates);
        // When pllacing a lodestone in the same direction
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 3), 'pull', false);
        // Then the move should be illegal
        const reason: string = LodestoneFailure.MUST_FLIP_LODESTONE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
})
    it('should pull the player pieces when making a pull move, capturing opponent pieces on the way', () => {
        // Given any state
        const state: LodestoneState = LodestoneState.getInitialState();
        // When placing a lodestone to pull
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'pull', false, { top: 4, bottom: 0, left: 0, right: 0 });
        // Then the move should be legal and player pieces should be pulled
        const P: LodestonePiece = new LodestonePieceLodestone(Player.ZERO,
                                                              'pull');
        const expectedBoard: Table<LodestonePiece> = [
            [_, _, A, B, _, B, _, _],
            [_, A, B, A, A, A, B, _],
            [A, B, A, B, _, B, A, B],
            [B, A, B, _, A, A, B, A],
            [_, A, _, A, P, A, _, B],
            [B, A, B, A, A, A, B, A],
            [_, B, A, B, _, B, A, _],
            [_, _, B, A, B, A, _, _],
        ];
        const expectedState: LodestoneState =
            new LodestoneState(expectedBoard,
                               1,
                               [MGPOptional.of(new Coord(4, 4)), MGPOptional.empty()],
                               {
                                   top: MGPOptional.of(new LodestonePressurePlate(5, [B, B, B, B])),
                                   bottom: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
                                   left: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
                                   right: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
                               });
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should support pulling in a diagonal direction', () => {
        // Given a state with opponent pieces
        const board: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, A],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, allPressurePlates);
        // When placing a lodestone to push the B
        const move: LodestoneMove = new LodestoneMove(new Coord(5, 4), 'pull', true);
        // Then the move is legal, and B is pushed, but not A
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'pull');
        const expectedBoard: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, A, _],
            [_, _, _, _, _, X, _, _],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const lodestones: LodestoneLodestones = [MGPOptional.of(new Coord(5, 4)), MGPOptional.empty()];
        const expectedState: LodestoneState = new LodestoneState(expectedBoard, 1, lodestones, allPressurePlates);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should forbid placing more pieces than there have been captures', () => {
        // Given any state
        const state: LodestoneState = LodestoneState.getInitialState();
        // When placing a lodestone to pull, such that we try to place more captures than what we actually captured
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'pull', false, { top: 12, bottom: 0, left: 0, right: 0 });
        // Then the move should be illegal
        const reason: string = LodestoneFailure.MUST_PLACE_CAPTURES_ON_PRESSURE_PLATES();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should block when arriving on one of the stuck player pieces or a lodestone (pull)', () => {
        // Given a state with consecutive player pieces
        const board: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, B, _, _, _],
        ];
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, allPressurePlates);
        // When placing a lodestone to pull the two As
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'pull', false);
        // Then the move is legal, and no player pieces have moved
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'pull');
        const expectedBoard: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, B, _, _, _],
        ];
        const lodestones: LodestoneLodestones = [MGPOptional.of(new Coord(4, 4)), MGPOptional.empty()];
        const expectedState: LodestoneState = new LodestoneState(expectedBoard, 1, lodestones, allPressurePlates);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should push the opponent pieces when making a push move', () => {
        // Given a state with opponent pieces
        const board: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, allPressurePlates);
        // When placing a lodestone to push the B
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'push', false);
        // Then the move is legal, and B is pushed, but not A
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'push');
        const expectedBoard: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const lodestones: LodestoneLodestones = [MGPOptional.of(new Coord(4, 4)), MGPOptional.empty()];
        const expectedState: LodestoneState = new LodestoneState(expectedBoard, 1, lodestones, allPressurePlates);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should support pushing in a diagonal direction', () => {
        // Given a state with opponent pieces
        const board: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, A, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, allPressurePlates);
        // When placing a lodestone to push the B
        const move: LodestoneMove = new LodestoneMove(new Coord(5, 4), 'push', true);
        // Then the move is legal, and B is pushed, but not A
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'push');
        const expectedBoard: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, A, _],
            [_, _, _, _, _, X, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, B, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const lodestones: LodestoneLodestones = [MGPOptional.of(new Coord(5, 4)), MGPOptional.empty()];
        const expectedState: LodestoneState = new LodestoneState(expectedBoard, 1, lodestones, allPressurePlates);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should capture an opponent piece when pushing it over the board', () => {
        // Given a state with an opponent piece at the edge
        const board: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, B, _, _, _],
        ];
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, allPressurePlates);
        // When placing a lodestone to push and capture B
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'push', false, { top: 1, bottom: 0, left: 0, right: 0 });
        // Then the move is legal, and B is pushed and captured, but not A
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'push');
        const expectedBoard: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const pressurePlates: LodestonePressurePlates = {
            ...allPressurePlates,
            top: MGPOptional.of(new LodestonePressurePlate(5, [LodestonePiecePlayer.ONE])) };
        const lodestones: LodestoneLodestones = [MGPOptional.of(new Coord(4, 4)), MGPOptional.empty()];
        const expectedState: LodestoneState = new LodestoneState(expectedBoard, 1, lodestones, pressurePlates);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should block when arriving on one of the player pieces or on a lodestone (push)', () => {
        // Given a state with an opponent piece next to a player piece or a lodestone
        const Y: LodestonePiece = new LodestonePieceLodestone(Player.ONE, 'push');
        const board: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, _, B, Y, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const lodestones: LodestoneLodestones = [MGPOptional.empty(), MGPOptional.of(new Coord(6, 4))];
        const state: LodestoneState = new LodestoneState(board, 0, lodestones, allPressurePlates);
        // When placing a lodestone to push Bs
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'push', false);
        // Then the move should be legal, but no B moves
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'push');
        const expectedBoard: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, X, B, Y, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const expectedLodestones: LodestoneLodestones =
            [MGPOptional.of(new Coord(4, 4)), MGPOptional.of(new Coord(6, 4))];
        const expectedState: LodestoneState =
            new LodestoneState(expectedBoard, 1, expectedLodestones, allPressurePlates);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should forbid placing a lodestone on a crumbled floor', () => {
        // Given a state with an opponent piece next to a player piece or a lodestone
        const board: Table<LodestonePiece> = [
            [N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const pressurePlates: LodestonePressurePlates = {
            top: MGPOptional.empty(),
            bottom: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
            left: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
            right: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
        };
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, pressurePlates);
        // When placing a lodestone on the crumbled floor
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', false);
        // Then the move should be illegal
        const reason: string = LodestoneFailure.TARGET_IS_CRUMBLED();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should make pieces fall when they reach crumbled floor', () => {
        // Given a state with an opponent piece next to a crumbled floor
        const board: Table<LodestonePiece> = [
            [N, N, N, N, N, N, N, N],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const pressurePlates: LodestonePressurePlates = {
            ...allPressurePlates,
            top: MGPOptional.of(LodestonePressurePlate.EMPTY_3),
        };
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, pressurePlates);
        // When placing a lodestone to push B
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'push', false, { top: 0, bottom: 1, left: 0, right: 0 });
        // Then the move should be valid and B falls
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'push');
        const expectedBoard: Table<LodestonePiece> = [
            [N, N, N, N, N, N, N, N],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const expectedLodestones: LodestoneLodestones =
            [MGPOptional.of(new Coord(4, 4)), MGPOptional.empty()];
        const expectedPressurePlates: LodestonePressurePlates = {
            ...pressurePlates,
            bottom: LodestonePressurePlate.EMPTY_5.addCaptured(Player.ONE, 1),
        };
        const expectedState: LodestoneState =
            new LodestoneState(expectedBoard, 1, expectedLodestones, expectedPressurePlates);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should crumble the floor when the first pressure plate is full', () => {
        // Given a state where the floor will soon crumble
        const board: Table<LodestonePiece> = [
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const pressurePlates: LodestonePressurePlates = {
            ...allPressurePlates,
            top: LodestonePressurePlate.EMPTY_5.addCaptured(Player.ZERO, 4),
        };
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, pressurePlates);
        // When placing a lodestone to push the B and putting this capture on the top pressure plate
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'push', false, { top: 1, bottom: 0, left: 0, right: 0 });
        // Then the move should be valid, and the top pressure plate crumbles
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'push');
        const expectedBoard: Table<LodestonePiece> = [
            [N, N, N, N, N, N, N, N],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const expectedLodestones: LodestoneLodestones =
            [MGPOptional.of(new Coord(4, 4)), MGPOptional.empty()];
        const expectedPressurePlates: LodestonePressurePlates = {
            ...pressurePlates,
            top: MGPOptional.of(LodestonePressurePlate.EMPTY_3),
        };
        const expectedState: LodestoneState =
            new LodestoneState(expectedBoard, 1, expectedLodestones, expectedPressurePlates);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should crumble the floor when the second pressure plate is full', () => {
        // Given a state where the floor will soon crumble a second time
        const board: Table<LodestonePiece> = [
            [N, N, N, N, N, N, N, N],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const pressurePlates: LodestonePressurePlates = {
            ...allPressurePlates,
            top: LodestonePressurePlate.EMPTY_3.addCaptured(Player.ZERO, 2),
        };
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, pressurePlates);
        // When placing a lodestone to push the B and putting this capture on the top pressure plate
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'push', false, { top: 1, bottom: 0, left: 0, right: 0 });
        // Then the move should be valid, and the top pressure plate crumbles a second time
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'push');
        const expectedBoard: Table<LodestonePiece> = [
            [N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const expectedLodestones: LodestoneLodestones =
            [MGPOptional.of(new Coord(4, 4)), MGPOptional.empty()];
        const expectedPressurePlates: LodestonePressurePlates = {
            ...pressurePlates,
            top: MGPOptional.empty(),
        };
        const expectedState: LodestoneState =
            new LodestoneState(expectedBoard, 1, expectedLodestones, expectedPressurePlates);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should accept more pieces than the pressure plate can accept if they can fit on the next one', () => {
        // Given a state where the floor will soon crumble
        const board: Table<LodestonePiece> = [
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, B, _, _, _],
            [_, _, A, B, _, B, A, _],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const pressurePlates: LodestonePressurePlates = {
            ...allPressurePlates,
            top: LodestonePressurePlate.EMPTY_5.addCaptured(Player.ZERO, 3),
        };
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, pressurePlates);
        // When placing a lodestone to capture all Bs
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'pull', false, { top: 5, bottom: 0, left: 0, right: 0 });
        // Then the move should be valid, and the top pressure plate crumbles *twice*
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'pull');
        const expectedBoard: Table<LodestonePiece> = [
            [N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, A, X, A, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const expectedLodestones: LodestoneLodestones =
            [MGPOptional.of(new Coord(4, 4)), MGPOptional.empty()];
        const expectedPressurePlates: LodestonePressurePlates = {
            ...pressurePlates,
            top: MGPOptional.empty(),
        };
        const expectedState: LodestoneState =
            new LodestoneState(expectedBoard, 1, expectedLodestones, expectedPressurePlates);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should forbid placing more pieces on a pressure plate than the max it can afford even after crumbling once', () => {
        // Given a state where the floor will soon crumble
        const board: Table<LodestonePiece> = [
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, B, _, _, _],
            [_, _, A, B, _, B, A, _],
            [_, _, _, _, B, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const pressurePlates: LodestonePressurePlates = {
            ...allPressurePlates,
            top: LodestonePressurePlate.EMPTY_5.addCaptured(Player.ZERO, 4),
        };
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, pressurePlates);
        // When placing a lodestone to capture all Bs, trying to place all of the on the top pressure plate
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'pull', false, { top: 5, bottom: 0, left: 0, right: 0 });
        // Then the move should be illegal
        const reason: string = LodestoneFailure.TOO_MANY_CAPTURES_ON_SAME_PRESSURE_PLATE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should not consider pieces fallen during crumbling as captured', () => {
        // Given a state with an opponent piece next to a floor that will soon crumble
        const board: Table<LodestonePiece> = [
            [_, _, _, _, B, _, B, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const pressurePlates: LodestonePressurePlates = {
            ...allPressurePlates,
            top: LodestonePressurePlate.EMPTY_5.addCaptured(Player.ZERO, 4),
        };
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, pressurePlates);
        // When placing a lodestone to push one of the B
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'push', false, { top: 1, bottom: 0, left: 0, right: 0 });
        // Then the move should be valid, but only one piece is captured
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'push');
        const expectedBoard: Table<LodestonePiece> = [
            [N, N, N, N, N, N, N, N],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const expectedLodestones: LodestoneLodestones = [MGPOptional.of(new Coord(4, 4)), MGPOptional.empty()];
        const expectedPressurePlates: LodestonePressurePlates = {
            ...pressurePlates,
            top: MGPOptional.of(LodestonePressurePlate.EMPTY_3),
        };
        const expectedState: LodestoneState =
            new LodestoneState(expectedBoard, 1, expectedLodestones, expectedPressurePlates);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should not consider pieces fallen when there is no more pressure plate as capture', () => {
        // Given a fully crumbled state with an opponent piece that will soon fall
        const board: Table<LodestonePiece> = [
            [N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N],
            [N, N, _, _, _, _, N, N],
            [N, N, _, _, A, B, N, N],
            [N, N, _, _, _, _, N, N],
            [N, N, _, _, _, _, N, N],
            [N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N],
        ];
        const noPressurePlates: LodestonePressurePlates = {
            top: MGPOptional.empty(),
            bottom: MGPOptional.empty(),
            left: MGPOptional.empty(),
            right: MGPOptional.empty(),
        };
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, noPressurePlates);
        // When placing a lodestone to push B
        const move: LodestoneMove = new LodestoneMove(new Coord(3, 3), 'push', false);
        // Then the move should be valid and no piece is actually considered captured
        const X: LodestonePiece = new LodestonePieceLodestone(Player.ZERO, 'push');
        const expectedBoard: Table<LodestonePiece> = [
            [N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N],
            [N, N, _, _, _, _, N, N],
            [N, N, _, X, A, _, N, N],
            [N, N, _, _, _, _, N, N],
            [N, N, _, _, _, _, N, N],
            [N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N],
        ];
        const expectedLodestones: LodestoneLodestones = [MGPOptional.of(new Coord(3, 3)), MGPOptional.empty()];
        const expectedState: LodestoneState =
            new LodestoneState(expectedBoard, 1, expectedLodestones, noPressurePlates);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should not consider victory if there are pieces left', () => {
        // Given a state with pieces of both players
        const state: LodestoneState = LodestoneState.getInitialState();
        const node: LodestoneNode = new LodestoneNode(state);
        // Then no victory should be detected
        RulesUtils.expectToBeOngoing(rules, node, minimaxes);
    });
    it('should consider player victory when they have no more piece', () => {
        for (const player of [Player.ZERO, Player.ONE]) {
            // Given a state with no pieces left for the other player
            const P: LodestonePiece = LodestonePiecePlayer.of(player);
            const board: Table<LodestonePiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, P, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];

            const state: LodestoneState = new LodestoneState(board, 0, noLodestone, allPressurePlates);
            const node: LodestoneNode = new LodestoneNode(state);
            // Then it should be a victory for that player
            RulesUtils.expectToBeVictoryFor(rules, node, player, minimaxes);
        }
    });
    it('should be a draw if there are no pieces at all left', () => {
        // Given a state with absolutely no piece left
        const board: Table<LodestonePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LodestoneState = new LodestoneState(board, 0, noLodestone, allPressurePlates);
        const node: LodestoneNode = new LodestoneNode(state);
        // Then it should be a a draw
        RulesUtils.expectToBeDraw(rules, node, minimaxes);
    });
});
