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

describe('KamisadoRules:', () => {
    let rules: KamisadoRules;

    const _: number = KamisadoPiece.NONE.getValue();
    const Red: number = KamisadoPiece.ZERO.RED.getValue();
    const Bro: number = KamisadoPiece.ZERO.BROWN.getValue();
    const Gre: number = KamisadoPiece.ZERO.GREEN.getValue();
    const Blu: number = KamisadoPiece.ZERO.BLUE.getValue();
    const Pin: number = KamisadoPiece.ZERO.PINK.getValue();
    const Pur: number = KamisadoPiece.ZERO.PURPLE.getValue();
    const Ora: number = KamisadoPiece.ZERO.ORANGE.getValue();
    const Yel: number = KamisadoPiece.ZERO.YELLOW.getValue();
    const red: number = KamisadoPiece.ONE.RED.getValue();
    const bro: number = KamisadoPiece.ONE.BROWN.getValue();
    const gre: number = KamisadoPiece.ONE.GREEN.getValue();
    const blu: number = KamisadoPiece.ONE.BLUE.getValue();
    const pin: number = KamisadoPiece.ONE.PINK.getValue();
    const pur: number = KamisadoPiece.ONE.PURPLE.getValue();
    const ora: number = KamisadoPiece.ONE.ORANGE.getValue();
    const yel: number = KamisadoPiece.ONE.YELLOW.getValue();
    function emptyRow(): number[] {
        return [_, _, _, _, _, _, _, _];
    }

    beforeEach(() => {
        rules = new KamisadoRules(KamisadoPartSlice.getStartingSlice());
        MNode.NB_NODE_CREATED = 0;
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
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [Red, Blu, _, _, _, _, _, _]
        ];
        const expectedBoard1: number[][] = [
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [Red, _, _, _, _, _, _, _],
            [_, Blu, _, _, _, _, _, _]
        ];
        const expectedBoard2: number[][] = [
            [Red, _, _, _, _, _, _, _],
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [_, Blu, _, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, false, board);
        rules = new KamisadoRules(slice);
        const move1: KamisadoMove = new KamisadoMove(new Coord(0, 7), new Coord(0, 6));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal).toBeTruthy("Vertical move 1 should be legal");
        const move2: KamisadoMove = new KamisadoMove(new Coord(0, 7), new Coord(0, 0));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal).toBeTruthy("Vertical move 2 should be legal");
        const resultingSlice1: KamisadoPartSlice = rules.applyLegalMove(move1, slice, status1).resultingSlice;
        const expectedSlice1: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.PURPLE, false, expectedBoard1);
        expect(resultingSlice1).toEqual(expectedSlice1);
        const resultingSlice2: KamisadoPartSlice = rules.applyLegalMove(move2, slice, status2).resultingSlice;
        const expectedSlice2: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.ORANGE, false, expectedBoard2);
        expect(resultingSlice2).toEqual(expectedSlice2);
        expect(rules.getBoardValue(move2, expectedSlice2)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });
    it('Vertical moves with obstacle are not allowed', () => {
        const board1: number[][] = [
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [red, _, _, _, _, _, _, _],
            [Red, _, _, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, false, board1);
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
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [Red, _, _, _, _, _, _, _],
            emptyRow(),
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, false, board);
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
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [Red, Blu, _, _, _, _, _, _]
        ];
        const expectedBoard1: number[][] = [
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [_, Red, _, _, _, _, _, _],
            [_, Blu, _, _, _, _, _, _]
        ];
        const expectedBoard2: number[][] = [
            [_, _, _, _, _, _, _, Red],
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [_, Blu, _, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, false, board);
        rules = new KamisadoRules(slice);
        const move1: KamisadoMove = new KamisadoMove(new Coord(0, 7), new Coord(1, 6));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal).toBeTruthy("Move 1 should be legal");
        const move2: KamisadoMove = new KamisadoMove(new Coord(0, 7), new Coord(7, 0));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal).toBeTruthy("Move 2 should be legal");
        const resultingSlice1: KamisadoPartSlice = rules.applyLegalMove(move1, slice, status1).resultingSlice;
        const expectedSlice1: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.BROWN, false, expectedBoard1);
        expect(resultingSlice1).toEqual(expectedSlice1);
        const resultingSlice2: KamisadoPartSlice = rules.applyLegalMove(move2, slice, status2).resultingSlice;
        const expectedSlice2: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.BROWN, false, expectedBoard2);
        expect(resultingSlice2).toEqual(expectedSlice2);
        expect(rules.getBoardValue(move2, expectedSlice2)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });
    it('Diagonal moves with obstacle are not allowed', () => {
        const board: number[][] = [
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [_, red, _, _, _, _, _, _],
            [Red, _, _, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, false, board);
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
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [blu, red, _, _, _, _, _, _],
            [Red, Gre, _, _, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [blu,   _,   _, _, _, _, _, _],
            [Red, Gre, red, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, false, board);
        rules = new KamisadoRules(slice);
        const moves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMoves(rules.node);
        expect(moves.size()).toEqual(1);
        const onlyMove = moves.listKeys()[0];
        expect(onlyMove).toEqual(KamisadoMove.PASS);
        const status: LegalityStatus = rules.isLegal(onlyMove, slice);
        const expectedSlice: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.RED, true, board);
        const resultingSlice: KamisadoPartSlice = rules.applyLegalMove(onlyMove, slice, status).resultingSlice;
        expect(resultingSlice).toEqual(expectedSlice);
        const nextMoves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMoves(rules.node);
        expect(nextMoves.size()).toEqual(1);
        const finalMove = moves.listKeys()[0];
        // TODO: fails here, final move is PASS
        expect(finalMove).toEqual(new KamisadoMove(new Coord(1, 6), new Coord(2, 7)));
        const finalStatus: LegalityStatus = rules.isLegal(finalMove, resultingSlice);
        const finalSlice: KamisadoPartSlice = rules.applyLegalMove(finalMove, resultingSlice, finalStatus).resultingSlice;
        const expectedFinalSlice: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.RED, false, expectedBoard);
        expect(finalSlice).toEqual(expectedFinalSlice);
        expect(rules.getBoardValue(finalMove, finalSlice)).toEqual(Number.MAX_SAFE_INTEGER, "This should be a victory for player 1");
    });
    it('Stuck position for both player means the first stuck wins', () => {
        const board: number[][] = [
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [blu, red,   _, _, _, _, _, _],
            [Red, Gre, Blu, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, false, board);
        rules = new KamisadoRules(slice);
        const moves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMoves(rules.node);
        expect(moves.size()).toEqual(1);
        const onlyMove = moves.listKeys()[0];
        expect(onlyMove).toEqual(KamisadoMove.PASS);
        const status: LegalityStatus = rules.isLegal(onlyMove, slice);
        const expectedSlice: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.RED, true, board);
        const resultingSlice: KamisadoPartSlice = rules.applyLegalMove(onlyMove, slice, status).resultingSlice;
        expect(resultingSlice).toEqual(expectedSlice);
        const nextMoves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMoves(rules.node);
        expect(nextMoves.size()).toEqual(0);
        expect(rules.getBoardValue(onlyMove, resultingSlice)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });
});