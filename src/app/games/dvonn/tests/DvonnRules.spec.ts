import { DvonnPieceStack } from '../DvonnPieceStack';
import { DvonnPartSlice } from '../DvonnPartSlice';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPMap } from 'src/app/utils/MGPMap';
import { DvonnMove } from '../DvonnMove';
import { Player } from 'src/app/jscaip/Player';
import { DvonnBoard } from '../DvonnBoard';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { DvonnFailure, DvonnRules } from '../DvonnRules';

describe('DvonnRules:', () => {
    let rules: DvonnRules;

    const _: DvonnPieceStack = DvonnPieceStack.EMPTY;
    const D: DvonnPieceStack = DvonnPieceStack.SOURCE;
    const W: DvonnPieceStack = DvonnPieceStack.PLAYER_ZERO;
    const WB: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 2, false);
    const WW: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 2, false);
    const WD: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 2, true);
    const WWW: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 3, false);
    const B: DvonnPieceStack = DvonnPieceStack.PLAYER_ONE;
    const BD: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 2, true);
    const BB: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 2, false);
    const BDB: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 3, true);
    const B5: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 5, false);
    const B6: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 6, false);
    const BD6: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 6, true);
    const W6: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 6, false);
    const WD6: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 6, true);

    beforeEach(() => {
        rules = new DvonnRules(DvonnPartSlice);
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, 'Game should start at turn 0');
    });
    it('initial stacks should be of size 1', () => {
        const slice: DvonnPartSlice = rules.node.gamePartSlice;
        for (let y: number = 0; y < DvonnBoard.HEIGHT; y++) {
            for (let x: number = 0; x < DvonnBoard.WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                if (slice.hexaBoard.isOnBoard(coord)) {
                    const stack: DvonnPieceStack = slice.hexaBoard.getAt(coord);
                    expect(stack.getSize()).toEqual(1);
                    expect(stack.isEmpty()).toBeFalse();
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
        const slice: DvonnPartSlice = rules.node.gamePartSlice;
        const firstTurnMovablePieces: Coord[] = rules.getMovablePieces(slice);
        expect(firstTurnMovablePieces.length).toEqual(11);
    });
    it('should provide 41 moves in the first turn on the balanced board', () => {
        const slice: DvonnPartSlice = rules.node.gamePartSlice;
        const firstTurnMoves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        expect(firstTurnMoves.size()).toEqual(41);
        expect(firstTurnMoves.getByIndex(0).value.turn).toEqual(1);
    });
    it('should only allow moves from the current player color', () => {
        const slice: DvonnPartSlice = rules.node.gamePartSlice;
        const movablePieces: Coord[] = rules.getMovablePieces(slice);
        for (const coord of movablePieces) {
            expect(slice.hexaBoard.getAt(coord).belongsTo(Player.ZERO));
        }
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        const slice2: DvonnPartSlice = moves.getByIndex(0).value;
        const movablePieces2: Coord[] = rules.getMovablePieces(slice2);
        for (const coord of movablePieces2) {
            expect(slice2.hexaBoard.getAt(coord).belongsTo(Player.ONE)).toBeTrue();
        }
        expect(rules.isLegal(DvonnMove.of(new Coord(1, 1), new Coord(1, 2)), slice).legal.isSuccess()).toBeFalse();
    });
    it('should not allow moves for pieces with more than 6 neighbors', () => {
        const slice: DvonnPartSlice = rules.node.gamePartSlice;
        expect(rules.isLegal(DvonnMove.of(new Coord(1, 3), new Coord(1, 2)), slice).legal.isSuccess()).toBeFalse();
    });
    it('should not allow moves from an empty stack', () => {
        const board: DvonnBoard = new DvonnBoard([
            [_, _, _, B, B, B, W, W, B, D, B],
            [_, B, B, W, W, W, B, B, W, B, B],
            [WB, B, B, B, W, D, B, W, W, W, W],
            [_, W, B, W, W, B, B, B, W, W, _],
            [W, D, W, B, B, W, W, W, B, _, _],
        ]);
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 0, false);
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(2, 1));
        const legality: MGPValidation = rules.isLegal(move, slice).legal;
        expect(legality).toEqual(MGPValidation.failure(DvonnFailure.EMPTY_STACK));
    });
    it('should forbid moves with pieces that cannot reach any target', () => {
        const board: DvonnBoard = new DvonnBoard([
            [_, _, WW, D, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, W, B, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 0, false);
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(4, 0));
        const legality: MGPValidation = rules.isLegal(move, slice).legal;
        expect(legality).toEqual(MGPValidation.failure(DvonnFailure.CANT_REACH_TARGET));
    });
    it('should forbid moves with a different length than the stack size', () => {
        const board: DvonnBoard = new DvonnBoard([
            [_, _, WW, B, _, _, _, _, _, _, _],
            [_, WWW, BD, W, W, _, _, D, _, _, _],
            [BB, B, B, _, W, _, _, BB, _, _, _],
            [W, _, B, WWW, W, _, _, _, _, _, _],
            [W, D, W, B, B, W, _, _, _, _, _],
        ]);
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 0, false);
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(3, 0));
        const legality: MGPValidation = rules.isLegal(move, slice).legal;
        expect(legality).toEqual(MGPValidation.failure(DvonnFailure.INVALID_MOVE_LENGTH));
    });
    it('should have the target stack owned by the owner of the source stack after the move', () => {
        const expectedBoard: DvonnBoard = new DvonnBoard([
            [_, _, W, B, B, B, W, W, B, D, B],
            [_, B, B, W, W, W, B, B, W, B, B],
            [WB, B, B, B, W, D, B, W, W, W, W],
            [_, W, B, W, W, B, B, B, W, W, _],
            [W, D, W, B, B, W, W, W, B, _, _],
        ]);
        const slice: DvonnPartSlice = rules.node.gamePartSlice;
        const move: DvonnMove = DvonnMove.of(new Coord(0, 3), new Coord(0, 2));
        const legality: LegalityStatus = rules.isLegal(move, slice);
        expect(legality.legal.isSuccess()).toBeTrue();
        const resultingSlice: DvonnPartSlice = rules.applyLegalMove(move, slice, legality);
        expect(resultingSlice.hexaBoard).toEqual(expectedBoard);
        const stack: DvonnPieceStack = resultingSlice.hexaBoard.getAt(new Coord(0, 2));
        expect(stack.belongsTo(Player.ZERO)).toBeTrue();
    });
    it('should allow moves only to occupied spaces', () => {
        const board: DvonnBoard = new DvonnBoard([
            [_, _, W, B, _, B, W, _, B, D, B],
            [_, B, B, W, W, W, B, B, W, B, B],
            [B, B, B, _, W, D, _, W, W, W, W],
            [W, _, B, W, W, _, B, B, W, W, _],
            [W, D, W, B, B, W, W, W, B, _, _],
        ]);
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 0, false);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        for (const move of moves.listKeys()) {
            expect(board.getAt(move.end).isEmpty()).toBeFalse();
        }
        expect(rules.isLegal(DvonnMove.of(new Coord(3, 1), new Coord(3, 2)), slice).legal.isSuccess()).toBeFalse();
    });
    it('should move stacks as a whole, by as many spaces as there are pieces in the stack', () => {
        const board: DvonnBoard = new DvonnBoard([
            [_, _, WW, B, _, _, _, _, _, _, _],
            [_, WWW, BD, W, W, _, _, D, _, _, _],
            [BB, B, B, _, W, _, _, BB, _, _, _],
            [W, _, B, WWW, W, _, _, _, _, _, _],
            [W, D, W, B, B, W, _, _, _, _, _],
        ]);
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 0, false);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        for (const move of moves.listKeys()) {
            expect(move.length()).toEqual(board.getAt(move.coord).getSize());
        }
        expect(rules.isLegal(DvonnMove.of(new Coord(2, 0), new Coord(3, 0)), slice).legal.isSuccess()).toBeFalse();
    });
    it('should not allow moves that end on an empty space', () => {
        const board: DvonnBoard = new DvonnBoard([
            [_, _, WW, B, _, _, _, _, _, _, _],
            [_, WWW, BD, W, W, _, _, D, _, _, _],
            [BB, B, B, _, W, _, _, BB, _, _, _],
            [W, _, B, WWW, W, _, _, _, _, _, _],
            [W, D, W, B, B, W, _, _, _, _, _],
        ]);
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 0, false);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        for (const move of moves.listKeys()) {
            expect(board.getAt(move.end).isEmpty()).toBeFalse();
        }
    });
    it('should not allow to move a single red piece, but allows stacks with red pieces within it to move', () => {
        const board: DvonnBoard = new DvonnBoard([
            [_, _, WW, B, _, _, _, _, _, _, _],
            [_, WWW, BD, W, W, _, _, D, _, _, _],
            [BB, B, B, _, W, _, _, BB, _, _, _],
            [W, _, BDB, WWW, W, _, _, _, _, _, _],
            [W, D, W, B, B, W, _, _, _, _, _],
        ]);
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 0, false);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        for (const move of moves.listKeys()) {
            const stack: DvonnPieceStack = board.getAt(move.coord);
            // every movable piece should belong to the current player
            expect(stack.belongsTo(slice.getCurrentPlayer())).toBeTrue();
        }
        expect(rules.isLegal(DvonnMove.of(new Coord(2, 0), new Coord(2, 4)), slice).legal.isSuccess()).toBeFalse();
    });
    it('should not allow to pass turns if moves are possible', () => {
        const slice: DvonnPartSlice = rules.node.gamePartSlice;
        expect(rules.isLegal(DvonnMove.PASS, slice).legal.isSuccess()).toBeFalse();
    });
    it('should allow to pass turn if no moves are possible', () => {
        const board: DvonnBoard = new DvonnBoard([
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _, D, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 0, false);
        const moves: MGPMap<DvonnMove, DvonnPartSlice> = rules.getListMovesFromSlice(null, slice);
        expect(moves.size()).toEqual(1);
        expect(moves.getByIndex(0).key).toEqual(DvonnMove.PASS);
        expect(rules.isLegal(DvonnMove.PASS, slice).legal.isSuccess()).toBeTrue();
        expect(rules.isLegal(DvonnMove.of(new Coord(2, 0), new Coord(2, 1)), slice).legal.isSuccess()).toBeFalse();
    });
    it('should remove of the board any portion disconnected from a source', () => {
        const board: DvonnBoard = new DvonnBoard([
            [_, _, WW, _, _, B, _, _, _, _, _],
            [_, _, D, W, W, W, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);
        const expectedBoard: DvonnBoard = new DvonnBoard([
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _, WD, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 0, false);
        const move: DvonnMove = DvonnMove.of(new Coord(3, 1), new Coord(2, 1));
        const legality: LegalityStatus = rules.isLegal(move, slice);
        expect(legality.legal.isSuccess()).toBeTrue();
        const resultingSlice: DvonnPartSlice = rules.applyLegalMove(move, slice, legality);
        expect(resultingSlice.hexaBoard).toEqual(expectedBoard);
    });
    it('should end the game when no move can be done', () => {
        const board: DvonnBoard = new DvonnBoard([
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _, D, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 10, true);
        expect(rules.getListMovesFromSlice(DvonnMove.PASS, slice).size()).toEqual(0);
    });
    it('should not end if moves can be done', () => {
        const board: DvonnBoard = new DvonnBoard([
            [_, _, _, _, _, _, _, _, _, BD6, _],
            [_, _, _, B6, WW, _, B5, _, _, _, _],
            [_, _, _, _, W, BD6, W6, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, WD6, _, _, _, _, _, _, _, _, _],
        ]);
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 11, true);
        expect(rules.getListMovesFromSlice(DvonnMove.of(new Coord(1, 3), new Coord(1, 4)), slice).size()).toEqual(1);
    });
    it('should assign the right score to winning boards', () => {
        const boardW: DvonnBoard = new DvonnBoard([
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _, D, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);
        const boardB: DvonnBoard = new DvonnBoard([
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, D, BB, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);
        const boardDraw: DvonnBoard = new DvonnBoard([
            [_, _, _, WW, _, _, _, _, _, _, _],
            [_, _, D, BB, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);
        const slice1: DvonnPartSlice = new DvonnPartSlice(boardW, 0, false);
        const slice2: DvonnPartSlice = new DvonnPartSlice(boardB, 0, false);
        const slice3: DvonnPartSlice = new DvonnPartSlice(boardDraw, 0, false);
        expect(rules.getBoardValue(null, slice1)).toEqual(Number.MIN_SAFE_INTEGER);
        expect(rules.getBoardValue(null, slice2)).toEqual(Number.MAX_SAFE_INTEGER);
        expect(rules.getBoardValue(null, slice3)).toEqual(0);
    });
});
