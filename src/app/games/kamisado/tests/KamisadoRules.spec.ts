import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { KamisadoColor } from '../KamisadoColor';
import { KamisadoMove } from '../KamisadoMove';
import { KamisadoState } from '../KamisadoState';
import { KamisadoPiece } from '../KamisadoPiece';
import { KamisadoNode, KamisadoRules } from '../KamisadoRules';
import { KamisadoMinimax } from '../KamisadoMinimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { KamisadoFailure } from '../KamisadoFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Table } from 'src/app/utils/ArrayUtils';

describe('KamisadoRules:', () => {

    let rules: KamisadoRules;

    let minimaxes: Minimax<KamisadoMove, KamisadoState>[];

    const _: KamisadoPiece = KamisadoPiece.NONE;
    const R: KamisadoPiece = KamisadoPiece.ZERO.RED;
    const G: KamisadoPiece = KamisadoPiece.ZERO.GREEN;
    const B: KamisadoPiece = KamisadoPiece.ZERO.BLUE;
    const P: KamisadoPiece = KamisadoPiece.ZERO.PURPLE;

    const r: KamisadoPiece = KamisadoPiece.ONE.RED;
    const o: KamisadoPiece = KamisadoPiece.ONE.ORANGE;
    const b: KamisadoPiece = KamisadoPiece.ONE.BROWN;
    const p: KamisadoPiece = KamisadoPiece.ONE.PURPLE;

    beforeEach(() => {
        rules = new KamisadoRules(KamisadoState);
        minimaxes = [
            new KamisadoMinimax(rules, 'KamisadoMinimax'),
        ];
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gameState.turn).withContext('Game should start a turn 0').toBe(0);
    });
    it('should allow vertical moves without obstacles', () => {
        const board: Table<KamisadoPiece> = [
            [_, o, p, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, B, _, _, _, _, _, _],
        ];
        const expectedBoard1: Table<KamisadoPiece> = [
            [_, o, p, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
            [_, B, _, _, _, _, _, _],
        ];
        const expectedBoard2: Table<KamisadoPiece> = [
            [R, o, p, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, B, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const move1: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 6));
        const status1: LegalityStatus = rules.isLegal(move1, state);
        expect(status1.legal.isSuccess()).toBeTrue();
        const move2: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 0));
        const status2: LegalityStatus = rules.isLegal(move2, state);
        expect(status2.legal.isSuccess()).toBeTrue();
        const resultingState1: KamisadoState = rules.applyLegalMove(move1, state, status1);
        const expectedState1: KamisadoState =
            new KamisadoState(7, KamisadoColor.PURPLE, MGPOptional.of(new Coord(2, 0)), false, expectedBoard1);
        expect(resultingState1).toEqual(expectedState1);
        const resultingState2: KamisadoState = rules.applyLegalMove(move2, state, status2);
        const expectedState2: KamisadoState =
            new KamisadoState(7, KamisadoColor.ORANGE, MGPOptional.of(new Coord(1, 0)), false, expectedBoard2);
        expect(resultingState2).toEqual(expectedState2);
        const node: KamisadoNode = new MGPNode(null, move2, expectedState2);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('should not allow moves landing on occupied case', () => {
        const board1: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [r, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board1);
        rules.node = new MGPNode(null, null, state);
        const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 6));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
    });
    it('should not allow vertical moves with an obstacle', () => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [r, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        rules.node = new MGPNode(null, null, state);
        const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 5));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(KamisadoFailure.MOVE_BLOCKED());
    });
    it('should not allow backward moves', () => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 6)), false, board);
        rules.node = new MGPNode(null, null, state);
        const move1: KamisadoMove = KamisadoMove.of(new Coord(0, 6), new Coord(0, 7));
        const status1: LegalityStatus = rules.isLegal(move1, state);
        expect(status1.legal.reason).toBe(KamisadoFailure.DIRECTION_NOT_ALLOWED());
        const move2: KamisadoMove = KamisadoMove.of(new Coord(0, 6), new Coord(1, 7));
        const status2: LegalityStatus = rules.isLegal(move2, state);
        expect(status2.legal.reason).toBe(KamisadoFailure.DIRECTION_NOT_ALLOWED());
    });
    it('should allow diagonal moves without obstacles', () => {
        const board: Table<KamisadoPiece> = [
            [_, b, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, B, _, _, _, _, _, _],
        ];
        const expectedBoard1: Table<KamisadoPiece> = [
            [_, b, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, R, _, _, _, _, _, _],
            [_, B, _, _, _, _, _, _],
        ];
        const expectedBoard2: Table<KamisadoPiece> = [
            [_, b, _, _, _, _, _, R],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, B, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const move1: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(1, 6));
        const status1: LegalityStatus = rules.isLegal(move1, state);
        expect(status1.legal.isSuccess()).toBeTrue();
        const move2: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(7, 0));
        const status2: LegalityStatus = rules.isLegal(move2, state);
        expect(status2.legal.isSuccess()).toBeTrue();
        const resultingState1: KamisadoState = rules.applyLegalMove(move1, state, status1);
        const expectedState1: KamisadoState =
            new KamisadoState(7, KamisadoColor.BROWN, MGPOptional.of(new Coord(1, 0)), false, expectedBoard1);
        expect(resultingState1).toEqual(expectedState1);
        const resultingState2: KamisadoState = rules.applyLegalMove(move2, state, status2);
        const expectedState2: KamisadoState =
            new KamisadoState(7, KamisadoColor.BROWN, MGPOptional.of(new Coord(1, 0)), false, expectedBoard2);
        expect(resultingState2).toEqual(expectedState2);
        const node: KamisadoNode = new MGPNode(null, move2, expectedState2);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('should not allow diagonal moves with obstacles', () => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, r, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        rules.node = new MGPNode(null, null, state);
        const move1: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(1, 6));
        const status1: LegalityStatus = rules.isLegal(move1, state);
        expect(status1.legal.reason).toBe(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        const move2: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(7, 0));
        const status2: LegalityStatus = rules.isLegal(move2, state);
        expect(status2.legal.reason).toBe(KamisadoFailure.MOVE_BLOCKED());
    });
    it('should only allow to pass in a stuck position', () => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, r, _, _, _, _, _, _],
            [R, G, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const moves: KamisadoMove[] = KamisadoRules.getListMovesFromState(state);
        expect(moves.length).toEqual(1);
        const onlyMove: KamisadoMove = moves[0];
        expect(onlyMove).toEqual(KamisadoMove.PASS);
        const status: LegalityStatus = rules.isLegal(onlyMove, state);
        const expectedState: KamisadoState =
            new KamisadoState(7, KamisadoColor.RED, MGPOptional.of(new Coord(1, 6)), true, board);
        const resultingState: KamisadoState = rules.applyLegalMove(onlyMove, state, status);
        expect(resultingState).toEqual(expectedState);
    });
    it('should not allow to pass if player can play', () => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, r, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        rules.node = new MGPNode(null, null, state);
        const move: KamisadoMove = KamisadoMove.PASS;
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(RulesFailure.CANNOT_PASS());
    });
    it('should detect victory', () => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, r, _, _, _, _, _, _],
            [R, G, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, _, _, _, _, _, _, _],
            [R, G, r, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(7, KamisadoColor.RED, MGPOptional.of(new Coord(1, 6)), true, board);
        const moves: KamisadoMove[] = KamisadoRules.getListMovesFromState(state);
        expect(moves.length).toEqual(1);
        const move: KamisadoMove = moves[0];
        expect(move).toEqual(KamisadoMove.of(new Coord(1, 6), new Coord(2, 7)));
        const status: LegalityStatus = rules.isLegal(move, state);
        const finalState: KamisadoState = rules.applyLegalMove(move, state, status);
        const expectedState: KamisadoState =
            new KamisadoState(8, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, expectedBoard);
        expect(finalState).toEqual(expectedState);
        const node: KamisadoNode = new MGPNode(null, move, finalState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('should declare blocking player as loser', () => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, r, _, _, _, _, _, _],
            [R, G, B, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const moves: KamisadoMove[] = KamisadoRules.getListMovesFromState(state);
        expect(KamisadoRules.mustPass(state)).toBeTrue();
        expect(moves.length).toEqual(1);
        const onlyMove: KamisadoMove = moves[0];
        expect(onlyMove).toEqual(KamisadoMove.PASS);
        const status: LegalityStatus = rules.isLegal(onlyMove, state);
        const expectedState: KamisadoState =
            new KamisadoState(7, KamisadoColor.RED, MGPOptional.of(new Coord(1, 6)), true, board);
        const resultingState: KamisadoState = rules.applyLegalMove(onlyMove, state, status);
        expect(resultingState).toEqual(expectedState);
        const nextMoves: KamisadoMove[] = KamisadoRules.getListMovesFromState(resultingState);
        expect(nextMoves.length).toEqual(0);
        const node: KamisadoNode = new MGPNode(null, onlyMove, resultingState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('should not have allowed directions for other players than 0 and 1', () => {
        expect(() => KamisadoRules.playerDirections(Player.NONE)).toThrowError();
        expect(() => KamisadoRules.directionAllowedForPlayer(Direction.UP, Player.NONE)).toThrowError();
    });
    it('should detect winning board for each player', () => {
        const win1: Table<KamisadoPiece> = [
            [R, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state1: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 0)), false, win1);
        const node1: KamisadoNode = new MGPNode(null, KamisadoMove.PASS, state1);
        RulesUtils.expectToBeVictoryFor(rules, node1, Player.ZERO, minimaxes);
        const win2: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [r, _, _, _, _, _, _, _],
        ];
        const state2: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 0)), false, win2);
        const node2: KamisadoNode = new MGPNode(null, KamisadoMove.PASS, state2);
        RulesUtils.expectToBeVictoryFor(rules, node2, Player.ONE, minimaxes);
        const winEach: Table<KamisadoPiece> = [
            [r, o, _, _, _, _, _, _],
            [b, p, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [B, P, _, _, _, _, _, _],
            [R, G, _, _, _, _, _, _],
        ];
        const state3: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 0)), true, winEach);
        const node3: KamisadoNode = new MGPNode(null, KamisadoMove.PASS, state3);
        RulesUtils.expectToBeVictoryFor(rules, node3, Player.ONE, minimaxes);
        const state4: KamisadoState =
            new KamisadoState(7, KamisadoColor.RED, MGPOptional.of(new Coord(0, 0)), true, winEach);
        const node4: KamisadoNode = new MGPNode(null, KamisadoMove.PASS, state4);
        RulesUtils.expectToBeVictoryFor(rules, node4, Player.ZERO, minimaxes);
    });
    it('should forbid moving opponent pieces', () => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [r, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const move: KamisadoMove = KamisadoMove.of(new Coord(0, 2), new Coord(0, 0));
        expect(rules.isLegal(move, state).legal.reason).toBe(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    });
    it('should not allow moving a piece that does not have the right color', () => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [B, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const move: KamisadoMove = KamisadoMove.of(new Coord(0, 2), new Coord(0, 0));
        expect(rules.isLegal(move, state).legal.reason).toBe(KamisadoFailure.NOT_RIGHT_COLOR());
    });
    it('should not allow moving a piece in a non-linear direction', () => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [B, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(3, 5));
        expect(rules.isLegal(move, state).legal.reason).toBe(KamisadoFailure.DIRECTION_NOT_ALLOWED());
    });
    it('should not allow creating invalid color', () => {
        expect(() => KamisadoColor.of(15)).toThrowError();
        expect(KamisadoColor.of(0)).toBe(KamisadoColor.ANY);
    });
});
