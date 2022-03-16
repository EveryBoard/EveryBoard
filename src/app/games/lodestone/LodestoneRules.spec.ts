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
import { LodestoneNode, LodestoneRules } from './LodestoneRules';
import { LodestoneInfos, LodestonePressurePlate, LodestonePressurePlates, LodestoneState } from './LodestoneState';

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

    const noLodestoneOnBoard: LodestoneInfos = [MGPOptional.empty(), MGPOptional.empty()];


    let rules: LodestoneRules;
    let minimaxes: Minimax<LodestoneMove, LodestoneState>[];

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
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'pull');
        // Then the move should be legal
        expect(rules.isLegal(move, state).isSuccess()).toBeTrue();
    });
    it('should forbid placing a lodestone on an occupied square', () => {
        // Given any state
        const state: LodestoneState = LodestoneState.getInitialState();
        // When placing a lodestone on an occupied square
        const move: LodestoneMove = new LodestoneMove(new Coord(2, 2), 'pull');
        // Then the move should be illegal
        const reason: string = RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should allow choosing freely the side of the lodestone when it is in the hands', () => {
        // Given the initial state
        const state: LodestoneState = LodestoneState.getInitialState();
        // When placing a lodestone in 'pull' or 'push' direction
        const pull: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'pull');
        const push: LodestoneMove = new LodestoneMove(new Coord(4, 4), 'pull');
        // Then both moves should be legal
        expect(rules.isLegal(pull, state).isSuccess()).toBeTrue();
        expect(rules.isLegal(push, state).isSuccess()).toBeTrue();
    });
    it('should forbid choosing the wrong side of the lodestone when it was already on the board', () => {
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
        const lodestoneInfos: LodestoneInfos = [
            MGPOptional.of(new Coord(4, 4)),
            MGPOptional.empty(),
        ];
        const state: LodestoneState = new LodestoneState(board, 0, lodestoneInfos, allPressurePlates);
        // When pllacing a lodestone in the same direction
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 3), 'push');
        // Then the move should be illegal
        const reason: string = LodestoneFailure.MUST_FLIP_LODESTONE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should pull the player pieces when making a pull move, capturing opponent pieces on the way', () => {
        // Given any state
        const state: LodestoneState = LodestoneState.getInitialState();
        // When placing a lodestone to pull
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4),
                                                      'pull',
                                                      { top: 4, bottom: 0, left: 0, right: 0 });
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
    it('should forbid placing more pieces than there have been captures', () => {
        // Given any state
        const state: LodestoneState = LodestoneState.getInitialState();
        // When placing a lodestone to pull, such that we try to place more captures than what we actually captured
        const move: LodestoneMove = new LodestoneMove(new Coord(4, 4),
                                                      'pull',
                                                      { top: 12, bottom: 0, left: 0, right: 0 });
        // Then the move should be illegal
        const reason: string = LodestoneFailure.MUST_PLACE_CAPTURES_ON_PRESSURE_PLATES();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should block when arriving on one of the player pieces (pull)');
    it('should block when arriving on a lodestone (pull)');
    it('should push the opponent pieces when making a push move');
    it('should capture an opponent piece when pushing it over the board');
    it('should block when arriving on one of the player pieces (push)');
    it('should block when arriving on a lodestone (push)');
    it('should not crumble the floor when a side tile is not full');
    it('should crumble the floor when the first side tile is full');
    it('should crumble the floor when the second side tile is full');
    it('should not put pieces on a side tile if there is none left');
    it('should not consider victory if there are pieces left', () => {
        // Given a state with pieces of both players
        const state: LodestoneState = LodestoneState.getInitialState();
        const node: LodestoneNode = new LodestoneNode(state);
        // Then no victory should be detected
        RulesUtils.expectToBeOngoing(rules, node, minimaxes);
    });
    it('should consider player victory when their has no more piece', () => {
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

            const state: LodestoneState = new LodestoneState(board, 0, noLodestoneOnBoard, allPressurePlates);
            const node: LodestoneNode = new LodestoneNode(state);
            // Then it should be a victory for that player
            RulesUtils.expectToBeVictoryFor(rules, node, player, minimaxes);
        }
    });
});
