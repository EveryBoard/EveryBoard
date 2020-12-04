import { DvonnPieceStack } from "../DvonnPieceStack";
import { DvonnPartSlice } from "../DvonnPartSlice";
import { DvonnRules } from "./DvonnRules";
import { Coord } from "src/app/jscaip/coord/Coord";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { DvonnMove } from "../dvonnmove/DvonnMove";
import { Player } from "src/app/jscaip/Player";
import { DvonnBoard } from "../DvonnBoard";
import { DvonnPiece } from "../DvonnPiece";

describe('DvonnRules:', () => {
    let rules: DvonnRules;

    const _   : number = DvonnPieceStack.EMPTY.getValue();
    const D   : number = DvonnPieceStack.SOURCE.getValue();
    const W   : number = DvonnPieceStack.PLAYER_ZERO.getValue();
    const WB  : number = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ONE]).getValue();
    const WW  : number = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ZERO]).getValue();
    const WD  : number = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.SOURCE]).getValue();
    const WWW : number = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ZERO]).getValue();
    const B   : number = DvonnPieceStack.PLAYER_ONE.getValue();
    const BD  : number = new DvonnPieceStack([DvonnPiece.PLAYER_ONE, DvonnPiece.SOURCE]).getValue();
    const BB  : number = new DvonnPieceStack([DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ONE]).getValue();
    const BDB : number = new DvonnPieceStack([DvonnPiece.PLAYER_ONE, DvonnPiece.SOURCE, DvonnPiece.PLAYER_ONE]).getValue();
    const B5  : number = new DvonnPieceStack([DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ONE,
                                              DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ONE,
                                              DvonnPiece.PLAYER_ONE]).getValue();
    const B6  : number = new DvonnPieceStack([DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ONE,
                                              DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ONE,
                                              DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ONE]).getValue();
    const BD6 : number = new DvonnPieceStack([DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ONE,
                                              DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ONE,
                                              DvonnPiece.SOURCE, DvonnPiece.PLAYER_ONE]).getValue();
    const W2  : number = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ZERO]).getValue();
    const W6  : number = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ZERO,
                                              DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ZERO,
                                              DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ZERO]).getValue();
    const WD6 : number =  new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ZERO,
                                               DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ZERO,
                                               DvonnPiece.SOURCE, DvonnPiece.PLAYER_ZERO]).getValue();

    beforeEach(() => {
        rules = new DvonnRules(DvonnPartSlice);
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, "Game should start at turn 0");
    });
    it('initial stacks should be of size 1', () => {
        const slice = rules.node.gamePartSlice;
        for (let y = 0; y < DvonnBoard.HEIGHT; y++) {
            for (let x = 0; x < DvonnBoard.WIDTH; x++) {
                const coord = new Coord(x, y);
                if (DvonnBoard.isOnBoard(coord)) {
                    const stack = DvonnBoard.getStackAt(slice.board, coord);
                    expect(stack.size()).toEqual(1);
                    expect(stack.isEmpty()).toBeFalsy();
                }
            }
        }
    });
    it('should allow 11 pieces to move in the first turn', () => {
        // 6. Important: a piece or stack that is surrounded on all 6 sides may
        // not be moved. So, at the beginning of the game only the pieces at
        // the edge of the board may move. The pieces that are not positioned at
        // the edge remain blocked for as long as they remain completely
        // surrounded (see diagram below).
        const slice = rules.node.gamePartSlice;
        const firstTurnMovablePieces: Coord[] = rules.getMovablePieces(slice);
        expect(firstTurnMovablePieces.length).toEqual(11);
    });
    it('should provide 41 moves in the first turn on the balanced board', () => {
        const slice = rules.node.gamePartSlice;
        const firstTurnMoves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        expect(firstTurnMoves.size()).toEqual(41);
        expect(firstTurnMoves.getByIndex(0).value.turn).toEqual(1);
    });
    it('should only allow moves from the current player color', () => {
        const slice = rules.node.gamePartSlice;
        const movablePieces: Coord[] = rules.getMovablePieces(slice);
        for (const coord of movablePieces) {
            expect(DvonnBoard.getStackAt(slice.board, coord).belongsTo(Player.ZERO));
        }
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        const slice2 = moves.getByIndex(0).value;
        const movablePieces2: Coord[] = rules.getMovablePieces(slice2);
        for (const coord of movablePieces2) {
            expect(DvonnBoard.getStackAt(slice2.board, coord).belongsTo(Player.ONE)).toBeTruthy();
        }
        expect(rules.isLegal(DvonnMove.of(new Coord(1, 1), new Coord(1, 2)), slice).legal).toBeFalsy();
    });
    it('should not allow moves for pieces with more than 6 neighbors', () => {
        const slice = rules.node.gamePartSlice;
        expect(rules.isLegal(DvonnMove.of(new Coord(1, 3), new Coord(1, 2)), slice).legal).toBeFalsy();
    });
    it('should have the target stack owned by the owner of the source stack', () => {
        const expectedBoard = [
            [_, _, W, B, B, B, W, W, B, D, B],
            [_, B, B, W, W, W, B, B, W, B, B],
            [WB, B, B, B, W, D, B, W, W, W, W],
            [_, W, B, W, W, B, B, B, W, W, _],
            [W, D, W, B, B, W, W, W, B, _, _]];
        const slice = rules.node.gamePartSlice;
        const move = DvonnMove.of(new Coord(0, 3), new Coord(0, 2));
        const legality = rules.isLegal(move, slice);
        expect(legality.legal).toBeTruthy();
        const moveResult = rules.applyLegalMove(move, slice, legality);
        expect(moveResult.resultingMove).toEqual(move);
        expect(moveResult.resultingSlice.board).toEqual(expectedBoard);
        expect(DvonnBoard.getStackAt(moveResult.resultingSlice.board, new Coord(0, 2)).belongsTo(Player.ZERO)).toBeTruthy()
    });
    it('should allow moves only to occupied spaces', () => {
        const board = [
            [_, _, W, B, _, B, W, _, B, D, B],
             [_, B, B, W, W, W, B, B, W, B, B],
              [B, B, B, _, W, D, _, W, W, W, W],
               [W, _, B, W, W, _, B, B, W, W, _],
                [W, D, W, B, B, W, W, W, B, _, _]];
        const slice : DvonnPartSlice = new DvonnPartSlice(0, false, board);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        for (const move of moves.listKeys()) {
            expect(DvonnBoard.getStackAt(board, move.end).isEmpty()).toBeFalsy();
        }
        expect(rules.isLegal(DvonnMove.of(new Coord(3, 1), new Coord(3, 2)), slice).legal).toBeFalsy();
    });
    it('should move stacks as a whole, by as many spaces as there are pieces in the stack', () => {
        const board = [
            [  _,   _,  WW,   B, _, _, _,  _, _, _, _],
            [  _, WWW,  BD,   W, W, _, _,  D, _, _, _],
            [ BB,   B,   B,   _, W, _, _, BB, _, _, _],
            [  W,   _,   B, WWW, W, _, _,  _, _, _, _],
            [  W,   D,   W,   B, B, W, _,  _, _, _, _]];
        const slice : DvonnPartSlice = new DvonnPartSlice(0, false, board);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        for (const move of moves.listKeys()) {
            expect(move.length()).toEqual(DvonnBoard.getStackAt(board, move.coord).size());
        }
        expect(rules.isLegal(DvonnMove.of(new Coord(2, 0), new Coord(3, 0)), slice).legal).toBeFalsy();
    });
    it('should not allow moves that end on an empty space', () => {
        const board = [
            [  _,   _,  WW,   B, _, _, _,  _, _, _, _],
            [  _, WWW,  BD,   W, W, _, _,  D, _, _, _],
            [ BB,   B,   B,   _, W, _, _, BB, _, _, _],
            [  W,   _,   B, WWW, W, _, _,  _, _, _, _],
            [  W,   D,   W,   B, B, W, _,  _, _, _, _]];
        const slice : DvonnPartSlice = new DvonnPartSlice(0, false, board);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        for (const move of moves.listKeys()) {
            expect(DvonnBoard.getStackAt(board, move.end).isEmpty()).toBeFalsy();
        }
    });
    it('should not allow to move a single red piece, but allows stacks with red pieces within it to move', () => {
        const board = [
            [  _,   _,  WW,   B, _, _, _,  _, _, _, _],
            [  _, WWW,  BD,   W, W, _, _,  D, _, _, _],
            [ BB,   B,   B,   _, W, _, _, BB, _, _, _],
            [  W,   _, BDB, WWW, W, _, _,  _, _, _, _],
            [  W,   D,   W,   B, B, W, _,  _, _, _, _]];
        const slice: DvonnPartSlice = new DvonnPartSlice(0, false, board);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        for (const move of moves.listKeys()) {
            const stack = DvonnBoard.getStackAt(board, move.coord);
            // every movable piece should belong to the current player
            expect(stack.belongsTo(slice.getCurrentPlayer())).toBeTruthy("stack belongs to the current player");
            // extra check: look at the stack internals for the top piece
            expect(stack.pieces[0].belongsTo(slice.getCurrentPlayer())).toBeTruthy("first piece of the stack belongs to the current player");
        }
        expect(rules.isLegal(DvonnMove.of(new Coord(2, 0), new Coord(2, 4)), slice).legal).toBeFalsy();
    });
    it('should not allow to pass turns if moves are possible', () => {
        const slice = rules.node.gamePartSlice;
        expect(rules.isLegal(DvonnMove.PASS, slice).legal).toBeFalsy();
    });
    it('should allow to pass turn if no moves are possible', () => {
        const board = [
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _,  D, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _]];
        const slice: DvonnPartSlice = new DvonnPartSlice(0, false, board);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        expect(moves.size()).toEqual(1);
        expect(moves.getByIndex(0).key).toEqual(DvonnMove.PASS);
        expect(rules.isLegal(DvonnMove.PASS, slice).legal).toBeTruthy();
        expect(rules.isLegal(DvonnMove.of(new Coord(2, 0), new Coord(2, 1)), slice).legal).toBeFalsy();
    });
    it('should remove of the board any portion disconnected from a source', () => {
        const board = [
                [_, _, WW, _, _, B, _, _, _, _, _],
               [_, _,  D, W, W, W, _, _, _, _, _],
              [_, _,  _, _, _, _, _, _, _, _, _],
             [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _]];
        const expectedBoard = [
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _, WD, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _]];
        const slice: DvonnPartSlice = new DvonnPartSlice(0, false, board);
        const move = DvonnMove.of(new Coord(3, 1), new Coord(2, 1));
        const legality = rules.isLegal(move, slice);
        expect(legality.legal).toBeTruthy();
        const moveResult = rules.applyLegalMove(move, slice, legality);
        expect(moveResult.resultingMove).toEqual(move);
        expect(moveResult.resultingSlice.board).toEqual(expectedBoard);
    });
    it('should end the game when no move can be done', () => {
        const board = [
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _,  D, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _]];
        const slice: DvonnPartSlice = new DvonnPartSlice(10, true, board);
        expect(rules.getListMovesFromSlice(DvonnMove.PASS, slice).size()).toEqual(0);
    });
    it('should not end if moves can be done', () => {
        const board = [
            [_,   _, _,  _,  _,   _,  _, _, _, BD6, _],
            [_,   _, _, B6, W2,   _, B5, _, _,   _, _],
            [_,   _, _,  _,  W, BD6, W6, _, _,   _, _],
            [_,   _, _,  _,  _,   _,  _, _, _,   _, _],
            [_, WD6, _,  _,  _,   _,  _, _, _,   _, _]];
        const slice: DvonnPartSlice = new DvonnPartSlice(11, true, board);
        expect(rules.getListMovesFromSlice(DvonnMove.of(new Coord(1, 3), new Coord(1, 4)), slice).size()).toEqual(1);
    });
    it('should assign the right score to winning boards', () => {
        const boardW = [
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _,  D, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _]];
        const boardB = [
            [_, _,  _,  _, _, _, _, _, _, _, _],
            [_, _,  D, BB, _, _, _, _, _, _, _],
            [_, _,  _,  _, _, _, _, _, _, _, _],
            [_, _,  _,  _, _, _, _, _, _, _, _],
            [_, _,  _,  _, _, _, _, _, _, _, _]];
        const boardDraw = [
            [_, _,  _, WW, _, _, _, _, _, _, _],
            [_, _,  D, BB, _, _, _, _, _, _, _],
            [_, _,  _,  _, _, _, _, _, _, _, _],
            [_, _,  _,  _, _, _, _, _, _, _, _],
            [_, _,  _,  _, _, _, _, _, _, _, _]];
        const slice1: DvonnPartSlice = new DvonnPartSlice(0, false, boardW);
        const slice2: DvonnPartSlice = new DvonnPartSlice(0, false, boardB);
        const slice3: DvonnPartSlice = new DvonnPartSlice(0, false, boardDraw);
        expect(rules.getBoardValue(null, slice1)).toEqual(Number.MIN_SAFE_INTEGER);
        expect(rules.getBoardValue(null, slice2)).toEqual(Number.MAX_SAFE_INTEGER);
        expect(rules.getBoardValue(null, slice3)).toEqual(0);
    });
});
