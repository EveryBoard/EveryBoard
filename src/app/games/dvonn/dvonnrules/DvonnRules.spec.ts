import { DvonnPieceStack } from "../DvonnPieceStack";
import { DvonnPartSlice } from "../DvonnPartSlice";
import { DvonnRules } from "./DvonnRules";
import { Coord } from "src/app/jscaip/coord/Coord";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { DvonnMove } from "../dvonnmove/DvonnMove";
import { Player } from "src/app/jscaip/Player";
import { DvonnBoard } from "../DvonnBoard";
import { DvonnPiece } from "../DvonnPiece";
import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";

fdescribe('DvonnRules:', () => {
    let rules: DvonnRules;

    const _  : number = DvonnPieceStack.EMPTY.getValue();
    const D  : number = DvonnPieceStack.SOURCE.getValue();
    const B  : number = DvonnPieceStack.PLAYER_ZERO.getValue();
    const BD : number = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.SOURCE]).getValue();
    const BB : number = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ZERO]).getValue();
    const BDB : number = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.SOURCE, DvonnPiece.PLAYER_ZERO]).getValue();
    const W  : number = DvonnPieceStack.PLAYER_ONE.getValue();
    const WW : number = new DvonnPieceStack([DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ONE]).getValue();
    const WWW: number = new DvonnPieceStack([DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ONE]).getValue();

    beforeEach(() => {
        rules = new DvonnRules(DvonnPartSlice.getStartingSlice(ArrayUtils.mapBiArray(DvonnBoard.getBalancedBoard(), p => p.getValue())));
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, "Game should start at turn 0");
    });
    it('should allow 11 pieces to move in the first turn', () => {
        // 6. Important: a piece or stack that is surrounded on all 6 sides may not be moved. So, at the beginning of the game only the pieces at the edge of the board may move. The pieces that are not positioned at the edge remain blocked for as long as they remain completely surrounded (see diagram below).
        const slice = rules.node.gamePartSlice;
        const firstTurnMovablePieces: Coord[] = DvonnRules.getMovablePieces(slice);
        expect(firstTurnMovablePieces.length).toEqual(11);
    });
    it('should provide 45 moves in the first turn once the balanced board', () => {
        const slice = rules.node.gamePartSlice;
        const firstTurnMoves: MGPMap<DvonnMove, DvonnPartSlice> = DvonnRules.getListMovesFromSlice(slice);
        expect(firstTurnMoves.size()).toEqual(45);
        expect(firstTurnMoves.getByIndex(0).value.turn).toEqual(1);
    });
    it('should only allow moves from the current player color', () => {
        const slice = rules.node.gamePartSlice;
        const movablePieces: Coord[] = DvonnRules.getMovablePieces(slice);
        for (const coord of movablePieces) {
            expect(DvonnBoard.getStackAt(slice.board, coord).belongsTo(Player.ZERO));
        }
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = DvonnRules.getListMovesFromSlice(slice);
        const slice2 = moves.getByIndex(0).value;
        const movablePieces2: Coord[] = DvonnRules.getMovablePieces(slice);
        for (const coord of movablePieces2) {
            expect(DvonnBoard.getStackAt(slice2.board, coord).belongsTo(Player.ONE)).toBeTrue();
        }
        expect(DvonnRules.tryMove(slice, new DvonnMove(new Coord(1, 1), new Coord(1, 2))).success).toBeFalse();
    });
    it('should allow moves only to occupied spaces', () => {
        const board = [
            [_, _, W, B, _, B, W, _, B, D, B],
            [_, B, B, W, W, W, B, B, W, B, B],
            [B, B, B, _, W, D, _, W, W, W, W],
            [W, _, B, W, W, _, B, B, W, W, _],
            [W, D, W, B, B, W, W, W, B, _, _]];
        const slice : DvonnPartSlice = DvonnPartSlice.getStartingSlice(board);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = DvonnRules.getListMovesFromSlice(slice);
        for (const move of moves.listKeys()) {
            expect(DvonnBoard.getStackAt(board, move.end).isEmpty()).toBeFalse();
        }
        expect(DvonnRules.tryMove(slice, new DvonnMove(new Coord(3, 1), new Coord(3, 2))).success).toBeFalse();
    });
    it('should move stacks as a whole, by as many spaces as there are pieces in the stack', () => {
        const board = [
            [  _,   _,  WW,   B, _, _, _,  _, _, _, _],
            [  _, WWW,  BD,   W, W, _, _,  D, _, _, _],
            [ BB,   B,   B,   _, W, _, _, BB, _, _, _],
            [  W,   _,   B, WWW, W, _, _,  _, _, _, _],
            [  W,   D,   W,   B, B, W, _,  _, _, _, _]];
        const slice : DvonnPartSlice = DvonnPartSlice.getStartingSlice(board);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = DvonnRules.getListMovesFromSlice(slice);
        for (const move of moves.listKeys()) {
            expect(move.length()).toEqual(DvonnBoard.getStackAt(board, move.coord).size());
        }
        expect(DvonnRules.tryMove(slice, new DvonnMove(new Coord(2, 0), new Coord(3, 0))).success).toBeFalse();
    });
    it('should not allow moves that end on an empty space', () => {
        const board = [
            [  _,   _,  WW,   B, _, _, _,  _, _, _, _],
            [  _, WWW,  BD,   W, W, _, _,  D, _, _, _],
            [ BB,   B,   B,   _, W, _, _, BB, _, _, _],
            [  W,   _,   B, WWW, W, _, _,  _, _, _, _],
            [  W,   D,   W,   B, B, W, _,  _, _, _, _]];
        const slice : DvonnPartSlice = DvonnPartSlice.getStartingSlice(board);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = DvonnRules.getListMovesFromSlice(slice);
        for (const move of moves.listKeys()) {
            expect(DvonnBoard.getStackAt(board, move.end).isEmpty()).toBeFalse();
        }
    });
    it('should not allow moves that end on an empty space', () => {
        const board = [
            [  _,   _,  WW,   B, _, _, _,  _, _, _, _],
            [  _, WWW,  BD,   W, W, _, _,  D, _, _, _],
            [ BB,   B,   B,   _, W, _, _, BB, _, _, _],
            [  W,   _,   B, WWW, W, _, _,  _, _, _, _],
            [  W,   D,   W,   B, B, W, _,  _, _, _, _]];
        const slice : DvonnPartSlice = DvonnPartSlice.getStartingSlice(board);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = DvonnRules.getListMovesFromSlice(slice);
        for (const move of moves.listKeys()) {
            expect(DvonnBoard.getStackAt(board, move.end).isEmpty()).toBeFalse();
        }
        expect(DvonnRules.tryMove(slice, new DvonnMove(new Coord(2, 0), new Coord(4, 0))).success).toBeFalsy();
    });
    it('should not allow to move a single red piece, but allows stacks with red pieces within it to move', () => {
        const board = [
            [  _,   _,  WW,   B, _, _, _,  _, _, _, _],
            [  _, WWW,  BD,   W, W, _, _,  D, _, _, _],
            [ BB,   B,   B,   _, W, _, _, BB, _, _, _],
            [  W,   _, BDB, WWW, W, _, _,  _, _, _, _],
            [  W,   D,   W,   B, B, W, _,  _, _, _, _]];
        const slice: DvonnPartSlice = DvonnPartSlice.getStartingSlice(board);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = DvonnRules.getListMovesFromSlice(slice);
        for (const move of moves.listKeys()) {
            // every movable piece should belong to the current player
            expect(DvonnBoard.getStackAt(board, move.end).belongsTo(slice.getCurrentPlayer())).toBeFalse();
            // extra check: look at the stack internals for the top piece
            expect(DvonnBoard.getStackAt(board, move.end).pieces[0].belongsTo(slice.getCurrentPlayer())).toBeFalse();
        }
        expect(DvonnRules.tryMove(slice, new DvonnMove(new Coord(2, 0), new Coord(0, 4))).success).toBeFalsy();
    });
    it('should not allow to pass turns if moves are possible', () => {
        const slice = rules.node.gamePartSlice;
        expect(DvonnRules.tryMove(slice, DvonnMove.PASS).success).toBeFalse();
    });
    it('should allow to pass turn if no moves are possible', () => {
        const board = [
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _,  D, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _]];
        const slice: DvonnPartSlice = DvonnPartSlice.getStartingSlice(board);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = DvonnRules.getListMovesFromSlice(slice);
        expect(moves.size()).toEqual(1);
        expect(moves.getByIndex(0).key).toEqual(DvonnMove.PASS);
    });
    it('should remove of the board any portion disconnected from a source', () => {
        const board = [
            [_, _, WW, _, _, B, _, _, _, _, _],
            [_, _,  D, B, W, W, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _]];
        const expectedBoard = [
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _,  D, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _]];
        const slice: DvonnPartSlice = DvonnPartSlice.getStartingSlice(board);
        const moveResult = DvonnRules.tryMove(slice, new DvonnMove(new Coord(3, 1), new Coord(2, 1)));
        expect(moveResult.success).toBeTrue();
        expect(moveResult.slice.board).toEqual(expectedBoard);
    });
    it('should end the game when no move cane be done', () => {
        const board = [
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _,  D, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _]];
        const slice: DvonnPartSlice = DvonnPartSlice.getStartingSlice(board);
        expect(DvonnRules.getListMovesFromSlice(slice).size()).toEqual(0);
    });
    it('should assign the right score to winning boards', () => {
        const boardW = [
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _,  D, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _]];
        const boardB = [
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  D, B, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _],
            [_, _,  _, _, _, _, _, _, _, _, _]];
        const slice1: DvonnPartSlice = DvonnPartSlice.getStartingSlice(boardW);
        const slice2: DvonnPartSlice = DvonnPartSlice.getStartingSlice(boardB);
        expect(rules.getBoardValue(null, slice1)).toEqual(Number.MIN_SAFE_INTEGER);
        expect(rules.getBoardValue(null, slice2)).toEqual(Number.MAX_SAFE_INTEGER);
    });
});
