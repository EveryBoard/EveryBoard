import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { KamisadoColor } from '../KamisadoColor';
import { KamisadoMove } from '../kamisadomove/KamisadoMove';
import { KamisadoPartSlice } from '../KamisadoPartSlice';
import { KamisadoPiece } from '../KamisadoPiece';
import { KamisadoRules } from './KamisadoRules';
import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { MGPOptional } from 'src/app/collectionlib/mgpoptional/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/mgpnode/MGPNode';

describe('KamisadoRules:', () => {
    let rules: KamisadoRules;

    const _: number = KamisadoPiece.NONE.getValue();
    const R: number = KamisadoPiece.ZERO.RED.getValue();
    const G: number = KamisadoPiece.ZERO.GREEN.getValue();
    const B: number = KamisadoPiece.ZERO.BLUE.getValue();
    const P: number = KamisadoPiece.ZERO.PURPLE.getValue();

    const r: number = KamisadoPiece.ONE.RED.getValue();
    const o: number = KamisadoPiece.ONE.ORANGE.getValue();
    const b: number = KamisadoPiece.ONE.BROWN.getValue();
    const p: number = KamisadoPiece.ONE.PURPLE.getValue();

    beforeEach(() => {
        rules = new KamisadoRules(KamisadoPartSlice);
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, "Game should start a turn 0");
    });
    it('should provide 102 possible moves at turn 0', () => {
        // Each piece on the side can do 6 vertical moves and 6 diagonal ones = 12 moves per piece * 2 side pieces
        // Other pieces  can do 6 vertical and 7 diagonal = 13 moves per piece * 6 pieces
        // In total, that makes 102 possible moves
        const firstTurnMoves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMoves(rules.node);
        expect(firstTurnMoves.size()).toEqual(102);
        expect(firstTurnMoves.getByIndex(0).value.turn).toEqual(1);
    });
    it('should allow vertical moves without obstacles', () => {
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
        const move1: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 6));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal.isSuccess()).toBeTruthy("Vertical move 1 should be legal");
        const move2: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 0));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal.isSuccess()).toBeTruthy("Vertical move 2 should be legal");
        const resultingSlice1: KamisadoPartSlice = rules.applyLegalMove(move1, slice, status1).resultingSlice;
        const expectedSlice1: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.PURPLE, MGPOptional.of(new Coord(2, 0)), false, expectedBoard1);
        expect(resultingSlice1).toEqual(expectedSlice1);
        const resultingSlice2: KamisadoPartSlice = rules.applyLegalMove(move2, slice, status2).resultingSlice;
        const expectedSlice2: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.ORANGE, MGPOptional.of(new Coord(1, 0)), false, expectedBoard2);
        expect(resultingSlice2).toEqual(expectedSlice2);
        expect(rules.getBoardValue(move2, expectedSlice2)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });
    it('should not allow vertical moves with an obstacle', () => {
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
        rules.node = new MGPNode(null, null, slice, 0);
        const move1: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 6));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal.isSuccess()).toBeFalsy("Move on existing piece should be illegal");
        const move2: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 5));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal.isSuccess()).toBeFalsy("Move over piece should be illegal");
    });
    it('should not allow backward moves', () => {
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
        rules.node = new MGPNode(null, null, slice, 0);
        const move1: KamisadoMove = KamisadoMove.of(new Coord(0, 6), new Coord(0, 7));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal.isSuccess()).toBeFalsy("Backward vertical move should be illegal");
        const move2: KamisadoMove = KamisadoMove.of(new Coord(0, 6), new Coord(1, 7));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal.isSuccess()).toBeFalsy("Backward diagonal move should be illegal");
    });
    it('should allow diagonal moves without obstacles', () => {
        const board: number[][] = [
            [_, b, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, B, _, _, _, _, _, _]
        ];
        const expectedBoard1: number[][] = [
            [_, b, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, R, _, _, _, _, _, _],
            [_, B, _, _, _, _, _, _]
        ];
        const expectedBoard2: number[][] = [
            [_, b, _, _, _, _, _, R],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, B, _, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const move1: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(1, 6));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal.isSuccess()).toBeTruthy("Move 1 should be legal");
        const move2: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(7, 0));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal.isSuccess()).toBeTruthy("Move 2 should be legal");
        const resultingSlice1: KamisadoPartSlice = rules.applyLegalMove(move1, slice, status1).resultingSlice;
        const expectedSlice1: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.BROWN, MGPOptional.of(new Coord(1, 0)), false, expectedBoard1);
        expect(resultingSlice1).toEqual(expectedSlice1);
        const resultingSlice2: KamisadoPartSlice = rules.applyLegalMove(move2, slice, status2).resultingSlice;
        const expectedSlice2: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.BROWN, MGPOptional.of(new Coord(1, 0)), false, expectedBoard2);
        expect(resultingSlice2).toEqual(expectedSlice2);
        expect(rules.getBoardValue(move2, expectedSlice2)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });
    it('should not allow diagonal moves with obstacles', () => {
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
        rules.node = new MGPNode(null, null, slice, 0);
        const move1: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(1, 6));
        const status1: LegalityStatus = rules.isLegal(move1, slice);
        expect(status1.legal.isSuccess()).toBeFalsy("Diagonal move on existing piece should be illegal");
        const move2: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(7, 0));
        const status2: LegalityStatus = rules.isLegal(move2, slice);
        expect(status2.legal.isSuccess()).toBeFalsy("Diagonal move over piece should be illegal");
    });
    it('should only allow to pass in a stuck position', () => {
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
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const moves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMovesFromSlice(slice);
        expect(moves.size()).toEqual(1);
        const onlyMove = moves.listKeys()[0];
        expect(onlyMove).toEqual(KamisadoMove.PASS);
        const status: LegalityStatus = rules.isLegal(onlyMove, slice);
        const expectedSlice: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.RED, MGPOptional.of(new Coord(1, 6)), true, board);
        const resultingSlice: KamisadoPartSlice = rules.applyLegalMove(onlyMove, slice, status).resultingSlice;
        expect(resultingSlice).toEqual(expectedSlice);
    })
    it('should detect victory', () => {
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
            [b, _, _, _, _, _, _, _],
            [R, G, r, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.RED, MGPOptional.of(new Coord(1, 6)), true, board);
        const moves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMovesFromSlice(slice);
        expect(moves.size()).toEqual(1);
        const move = moves.listKeys()[0];
        expect(move).toEqual(KamisadoMove.of(new Coord(1, 6), new Coord(2, 7)));
        const status: LegalityStatus = rules.isLegal(move, slice);
        const finalSlice: KamisadoPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: KamisadoPartSlice = new KamisadoPartSlice(8, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, expectedBoard);
        expect(finalSlice).toEqual(expectedSlice);
        expect(rules.getBoardValue(move, finalSlice)).toEqual(Number.MAX_SAFE_INTEGER, "This should be a victory for player 1");
    });
    it('should declare blocking player as loser', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, r, _, _, _, _, _, _],
            [R, G, B, _, _, _, _, _]
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const moves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMovesFromSlice(slice);
        expect(rules.canOnlyPass(slice)).toBeTruthy();
        expect(moves.size()).toEqual(1);
        const onlyMove = moves.listKeys()[0];
        expect(onlyMove).toEqual(KamisadoMove.PASS);
        const status: LegalityStatus = rules.isLegal(onlyMove, slice);
        const expectedSlice: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.RED, MGPOptional.of(new Coord(1, 6)), true, board);
        const resultingSlice: KamisadoPartSlice = rules.applyLegalMove(onlyMove, slice, status).resultingSlice;
        expect(resultingSlice).toEqual(expectedSlice);
        const nextMoves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMovesFromSlice(resultingSlice);
        expect(nextMoves.size()).toEqual(0);
        expect(rules.getBoardValue(onlyMove, resultingSlice)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });
    it('should not have allowed directions for other players than 0 and 1', () => {
        expect(() => rules.playerDirections(Player.NONE)).toThrowError();
        expect(() => rules.directionAllowedForPlayer(Direction.UP, Player.NONE)).toThrowError();
    });
    it('should detect winning board for each player', () => {
        const win1: number[][] = [
            [R, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const slice1: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 0)), false, win1);
        expect(rules.getBoardValue(KamisadoMove.PASS, slice1)).toEqual(Number.MIN_SAFE_INTEGER);
        const win2: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [r, _, _, _, _, _, _, _],
        ];
        const slice2: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 0)), false, win2);
        expect(rules.getBoardValue(KamisadoMove.PASS, slice2)).toEqual(Number.MAX_SAFE_INTEGER);
        const winEach: number[][] = [
            [r, o, _, _, _, _, _, _],
            [b, p, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [B, P, _, _, _, _, _, _],
            [R, G, _, _, _, _, _, _],
        ];
        const slice3: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 0)), true, winEach);
        expect(rules.getBoardValue(KamisadoMove.PASS, slice3)).toEqual(Number.MAX_SAFE_INTEGER);
        const slice4: KamisadoPartSlice = new KamisadoPartSlice(7, KamisadoColor.RED, MGPOptional.of(new Coord(0, 0)), true, winEach);
        expect(rules.getBoardValue(KamisadoMove.PASS, slice4)).toEqual(Number.MIN_SAFE_INTEGER);
    });
    it('should not allow moving a piece that does not belong to the current player', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [r, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const move1 = KamisadoMove.of(new Coord(0, 2), new Coord(0, 0));
        expect(rules.isLegal(move1, slice).legal.isSuccess()).toBeFalsy()
        const move2 = KamisadoMove.of(new Coord(0, 2), new Coord(0, 4));
        expect(rules.isLegal(move2, slice).legal.isSuccess()).toBeFalsy();
    });
    it('should not allow moving a piece that does not have the right color', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [B, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const move = KamisadoMove.of(new Coord(0, 2), new Coord(0, 0));
        expect(rules.isLegal(move, slice).legal.isSuccess()).toBeFalsy();
    });
    it('should not allow moving a piece in a non-linear direction', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [B, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const move = KamisadoMove.of(new Coord(0, 7), new Coord(3, 5));
        expect(rules.isLegal(move, slice).legal.isSuccess()).toBeFalsy();
    });
    it('should assign board values based on positions', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
        ];
        const slice: KamisadoPartSlice = new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        expect(rules.getBoardValue(null, slice)).toEqual(2);
    });
    it('should not allow creating invalid color or pieces', () => {
        expect(() => KamisadoColor.of(15)).toThrowError();
        expect(() => KamisadoPiece.of(undefined)).toThrowError();
    });
});
