import { KamisadoRules } from './KamisadoRules';
import { KamisadoMove } from '../kamisadomove/KamisadoMove';
import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { KamisadoPartSlice } from '../KamisadoPartSlice';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { Orthogonale } from 'src/app/jscaip/DIRECTION';
import { KamisadoPiece } from '../KamisadoPiece';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { KamisadoColor } from '../KamisadoColor';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MNode } from 'src/app/jscaip/MNode';
import { MGPOptional } from 'src/app/collectionlib/mgpoptional/MGPOptional';

describe('KamisadoRules:', () => {
    let rules: KamisadoRules;

    const _: number = KamisadoPiece.NONE.getValue();
    const R: number = KamisadoPiece.ZERO.RED.getValue();
    const G: number = KamisadoPiece.ZERO.GREEN.getValue();
    const B: number = KamisadoPiece.ZERO.BLUE.getValue();

    const r: number = KamisadoPiece.ONE.RED.getValue();
    const g: number = KamisadoPiece.ONE.GREEN.getValue();
    const o: number = KamisadoPiece.ONE.ORANGE.getValue();
    const b: number = KamisadoPiece.ONE.BLUE.getValue();
    const p: number = KamisadoPiece.ONE.PURPLE.getValue();
    const br: number = KamisadoPiece.ONE.BROWN.getValue();

    beforeEach(() => {
        rules = new KamisadoRules(KamisadoPartSlice.getStartingSlice());
        MNode.NB_NODE_CREATED = 0; // TODO: Is this useful?
    });
    it('Should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, "Game should start a turn 0");
    });
    it('Should provide 102 possible moves at turn 0', () => {
        // Each piece on the side can do 6 vertical moves and 6 diagonal ones = 12 moves per piece * 2 side pieces
        // Other pieces  can do 6 vertical and 7 diagonal = 13 moves per piece * 6 pieces
        // In total, that makes 102 possible moves
        const firstTurnMoves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMoves(rules.node);
        expect(firstTurnMoves.size()).toEqual(102);
        expect(firstTurnMoves.getByIndex(0).value.turn).toEqual(1);
    });
    it('Vertical moves without obstacle are allowed', () => {
        const board: number[][] = [
            [_, o, p, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, B, _, _, _, _, _, _]
        ];
        const expectedBoard1: number[][] = [
            [_, o, p, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
            [_, B, _, _, _, _, _, _]
        ];
        const expectedBoard2: number[][] = [
            [R, o, p, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, B, _, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const move1: KamisadoMove = new KamisadoMove(new Coord(0, 7), new Coord(0, 6));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal).toBeTruthy("Vertical move 1 should be legal");
        const move2: KamisadoMove = new KamisadoMove(new Coord(0, 7), new Coord(0, 0));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal).toBeTruthy("Vertical move 2 should be legal");
        const resultingSlice1: KamisadoPartSlice = rules.applyLegalMove(move1, slice, status1).resultingSlice;
        const expectedSlice1: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.PURPLE, MGPOptional.of(new Coord(2, 0)), false, expectedBoard1);
        expect(resultingSlice1).toEqual(expectedSlice1);
        const resultingSlice2: KamisadoPartSlice = rules.applyLegalMove(move2, slice, status2).resultingSlice;
        const expectedSlice2: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.ORANGE, MGPOptional.of(new Coord(1, 0)), false, expectedBoard2);
        expect(resultingSlice2).toEqual(expectedSlice2);
        expect(rules.getBoardValue(move2, expectedSlice2)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });
    it('Vertical moves with obstacle are not allowed', () => {
        const board1: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [r, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board1);
        rules = new KamisadoRules(slice);
        const move1: KamisadoMove = new KamisadoMove(new Coord(0, 7), new Coord(0, 6));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal).toBeFalsy("Move on existing piece should be illegal");
        const move2: KamisadoMove = new KamisadoMove(new Coord(0, 7), new Coord(0, 5));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal).toBeFalsy("Move over piece should be illegal");
    });
    it('Backward moves are not allowed', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 6)), false, board);
        rules = new KamisadoRules(slice);
        const move1: KamisadoMove = new KamisadoMove(new Coord(0, 6), new Coord(0, 7));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal).toBeFalsy("Backward vertical move should be illegal");
        const move2: KamisadoMove = new KamisadoMove(new Coord(0, 6), new Coord(1, 7));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal).toBeFalsy("Backward diagonal move should be illegal");
    });
    it('Diagonal moves without obstacle are allowed', () => {
        const board: number[][] = [
            [_, br, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, B, _, _, _, _, _, _]
        ];
        const expectedBoard1: number[][] = [
            [_, br, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, R, _, _, _, _, _, _],
            [_, B, _, _, _, _, _, _]
        ];
        const expectedBoard2: number[][] = [
            [_, br, _, _, _, _, _, R],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, B, _, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const move1: KamisadoMove = new KamisadoMove(new Coord(0, 7), new Coord(1, 6));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal).toBeTruthy("Move 1 should be legal");
        const move2: KamisadoMove = new KamisadoMove(new Coord(0, 7), new Coord(7, 0));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal).toBeTruthy("Move 2 should be legal");
        const resultingSlice1: KamisadoPartSlice = rules.applyLegalMove(move1, slice, status1).resultingSlice;
        const expectedSlice1: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.BROWN, MGPOptional.of(new Coord(1, 0)), false, expectedBoard1);
        expect(resultingSlice1).toEqual(expectedSlice1);
        const resultingSlice2: KamisadoPartSlice = rules.applyLegalMove(move2, slice, status2).resultingSlice;
        const expectedSlice2: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.BROWN, MGPOptional.of(new Coord(1, 0)), false, expectedBoard2);
        expect(resultingSlice2).toEqual(expectedSlice2);
        expect(rules.getBoardValue(move2, expectedSlice2)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });
    it('Diagonal moves with obstacle are not allowed', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, r, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        rules = new KamisadoRules(slice);
        const move1: KamisadoMove = new KamisadoMove(new Coord(0, 7), new Coord(1, 6));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal).toBeFalsy("Diagonal move on existing piece should be illegal");
        const move2: KamisadoMove = new KamisadoMove(new Coord(0, 7), new Coord(7, 0));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal).toBeFalsy("Diagonal move over piece should be illegal");
    });
    it('Stuck position is stuck, allowing only to pass', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, r, _, _, _, _, _, _],
            [R, G, _, _, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b,   _,   _, _, _, _, _, _],
            [R, G, r, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const moves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMovesFromSlice(slice);
        expect(moves.size()).toEqual(1);
        const onlyMove = moves.listKeys()[0]; // TODO: moves.get(KamisadoMove.PASS)
        expect(onlyMove).toEqual(KamisadoMove.PASS);
        const status: LegalityStatus = rules.isLegal(onlyMove, slice);
        const expectedSlice: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.RED, MGPOptional.of(new Coord(1, 6)), true, board);
        const resultingSlice: KamisadoPartSlice = rules.applyLegalMove(onlyMove, slice, status).resultingSlice;
        expect(resultingSlice).toEqual(expectedSlice);
        const nextMoves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMovesFromSlice(expectedSlice);
        expect(nextMoves.size()).toEqual(1);
        const finalMove = nextMoves.listKeys()[0];
        expect(finalMove).toEqual(new KamisadoMove(new Coord(1, 6), new Coord(2, 7)));
        const finalStatus: LegalityStatus = rules.isLegal(finalMove, resultingSlice);
        const finalSlice: KamisadoPartSlice = rules.applyLegalMove(finalMove, resultingSlice, finalStatus).resultingSlice;
        const expectedFinalSlice: KamisadoPartSlice = new KamisadoPartSlice(8, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, expectedBoard);
        expect(finalSlice).toEqual(expectedFinalSlice);
        expect(rules.getBoardValue(finalMove, finalSlice)).toEqual(Number.MAX_SAFE_INTEGER, "This should be a victory for player 1");
    });
    it('Stuck position for both player means the first stuck wins', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, r,   _, _, _, _, _, _],
            [R, G, B, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const moves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMovesFromSlice(slice);
        expect(moves.size()).toEqual(1);
        const onlyMove = moves.listKeys()[0];
        expect(onlyMove).toEqual(KamisadoMove.PASS);
        const status: LegalityStatus = rules.isLegal(onlyMove, slice);
        const expectedSlice: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.RED, MGPOptional.of(new Coord(1, 6)), true, board);
        const resultingSlice: KamisadoPartSlice = rules.applyLegalMove(onlyMove, slice, status).resultingSlice;
        rules = new KamisadoRules(resultingSlice);
        expect(resultingSlice).toEqual(expectedSlice);
        const nextMoves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMoves(rules.node);
        expect(nextMoves.size()).toEqual(0);
        expect(rules.getBoardValue(onlyMove, resultingSlice)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });
});