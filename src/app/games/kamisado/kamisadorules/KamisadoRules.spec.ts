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
    const red: number = KamisadoPiece.ZERO.RED.getValue();
    const bro: number = KamisadoPiece.ZERO.BROWN.getValue();
    const gre: number = KamisadoPiece.ZERO.GREEN.getValue();
    const blu: number = KamisadoPiece.ZERO.BLUE.getValue();
    const pin: number = KamisadoPiece.ZERO.PINK.getValue();
    const pur: number = KamisadoPiece.ZERO.PURPLE.getValue();
    const ora: number = KamisadoPiece.ZERO.ORANGE.getValue();
    const yel: number = KamisadoPiece.ZERO.YELLOW.getValue();
    function emptyRow(): number[] {
        return [_, _, _, _, _, _, _, _];
    }

    beforeEach(() => {
        rules = new KamisadoRules(false);
    });
    it('Should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, "Game should start a turn 0");
    });
    it('Should provide 96 possible moves at turn 0', () => {
        // Each piece can do 6 vertical moves and 6 diagonal ones = 12 moves per piece
        // There are 8 pieces
        // In total, that makes 96 possible moves
        const firstTurnMoves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMoves(rules.node);
        expect(firstTurnMoves.size()).toEqual(96);
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
        const slice: KamisadoPartSlice = new KamisadoPartSlice(5, KamisadoColor.RED, board);
        const move1: KamisadoMove = new KamisadoMove(new Coord(7, 0), new Coord(6, 0));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal).toBeTruthy("Move should be legal");
        const move2: KamisadoMove = new KamisadoMove(new Coord(7, 0), new Coord(0, 0));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal).toBeTruthy("Move should be legal");
        const resultingSlice1: KamisadoPartSlice = rules.applyLegalMove(move1, slice, status1).resultingSlice;
        const expectedSlice1: KamisadoPartSlice = new KamisadoPartSlice(5, KamisadoColor.PURPLE, expectedBoard1);
        expect(resultingSlice1).toEqual(expectedSlice1);
        const resultingSlice2: KamisadoPartSlice = rules.applyLegalMove(move2, slice, status2).resultingSlice;
        const expectedSlice2: KamisadoPartSlice = new KamisadoPartSlice(5, KamisadoColor.ORANGE, expectedBoard2);
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
            [red,   _, _, _,  , _, _, _],
            [Red, _, _, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(5, KamisadoColor.RED, board1);
        const move1: KamisadoMove = new KamisadoMove(new Coord(7, 0), new Coord(6, 0));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal).toBeFalsy("Move on existing piece should be illegal");
        const move2: KamisadoMove = new KamisadoMove(new Coord(7, 0), new Coord(5, 0));
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
            [Red, _, _, _,  , _, _, _],
            emptyRow(),
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(5, KamisadoColor.RED, board);
        const move1: KamisadoMove = new KamisadoMove(new Coord(6, 0), new Coord(7, 0));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal).toBeFalsy("Backward vertical move should be illegal");
        const move2: KamisadoMove = new KamisadoMove(new Coord(6, 0), new Coord(7, 1));
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
        const slice: KamisadoPartSlice = new KamisadoPartSlice(5, KamisadoColor.RED, board);
        const move1: KamisadoMove = new KamisadoMove(new Coord(7, 0), new Coord(6, 1));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal).toBeTruthy("Move should be legal");
        const move2: KamisadoMove = new KamisadoMove(new Coord(7, 0), new Coord(0, 7));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal).toBeTruthy("Move should be legal");
        const resultingSlice1: KamisadoPartSlice = rules.applyLegalMove(move1, slice, status1).resultingSlice;
        const expectedSlice1: KamisadoPartSlice = new KamisadoPartSlice(5, KamisadoColor.PURPLE, expectedBoard1);
        expect(resultingSlice1).toEqual(expectedSlice1);
        const resultingSlice2: KamisadoPartSlice = rules.applyLegalMove(move2, slice, status2).resultingSlice;
        const expectedSlice2: KamisadoPartSlice = new KamisadoPartSlice(5, KamisadoColor.ORANGE, expectedBoard2);
        expect(resultingSlice2).toEqual(expectedSlice2);
        expect(rules.getBoardValue(move2, expectedSlice2)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });
    it('Diagonal moves with obstacle are not allowed', () => {
        const board1: number[][] = [
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [_, red, _, _,  , _, _, _],
            [Red, _, _, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(5, KamisadoColor.RED, board1);
        const move1: KamisadoMove = new KamisadoMove(new Coord(7, 0), new Coord(6, 1));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal).toBeFalsy("Diagonal move on existing piece should be illegal");
        const move2: KamisadoMove = new KamisadoMove(new Coord(7, 0), new Coord(0, 7));
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
            [blu, red, _, _,  , _, _, _],
            [Red, Gre, _, _, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            emptyRow(),
            [blu, _, _, _,  , _, _, _],
            [Red, Gre, red, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(5, KamisadoColor.RED, board);
        const moves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMoves(rules.node);
        expect(moves.size()).toEqual(1);
        const onlyMove = moves[0];
        expect(onlyMove).toEqual(KamisadoMove.PASS);
        const status: LegalityStatus = rules.isLegal(onlyMove, slice);
        const resultingSlice: KamisadoPartSlice = rules.applyLegalMove(onlyMove, slice, status).resultingSlice;
        const nextMoves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMoves(rules.node);
        expect(nextMoves.size()).toEqual(1);
        const finalMove = moves[0];
        expect(finalMove).toEqual(new KamisadoMove(new Coord(6, 1), new Coord(7, 2)));
        const finalStatus: LegalityStatus = rules.isLegal(finalMove, resultingSlice);
        const finalSlice: KamisadoPartSlice = rules.applyLegalMove(finalMove, resultingSlice, finalStatus).resultingSlice;
        const expectedSlice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, board);
        expect(finalSlice).toEqual(expectedSlice);
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
            [blu, red, _, _,  , _, _, _],
            [Red, Gre, Blu, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(5, KamisadoColor.RED, board);
        const moves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMoves(rules.node);
        expect(moves.size()).toEqual(1);
        const onlyMove = moves[0];
        expect(onlyMove).toEqual(KamisadoMove.PASS);
        const status: LegalityStatus = rules.isLegal(onlyMove, slice);
        const resultingSlice: KamisadoPartSlice = rules.applyLegalMove(onlyMove, slice, status).resultingSlice;
        const nextMoves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMoves(rules.node);
        expect(nextMoves.size()).toEqual(1);
        const finalMove = moves[0];
        expect(finalMove).toEqual(KamisadoMove.PASS);
        const finalStatus: LegalityStatus = rules.isLegal(finalMove, resultingSlice);
        const finalSlice: KamisadoPartSlice = rules.applyLegalMove(finalMove, resultingSlice, finalStatus).resultingSlice;
        const expectedSlice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, board);
        expect(finalSlice).toEqual(expectedSlice);
        expect(rules.getBoardValue(finalMove, finalSlice)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });
});