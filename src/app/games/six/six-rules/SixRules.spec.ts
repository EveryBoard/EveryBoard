import { Coord } from 'src/app/jscaip/coord/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/player/Player';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { SixGameState } from '../six-game-state/SixGameState';
import { SixMove } from '../six-move/SixMove';
import { SixLegalityStatus } from '../SixLegalityStatus';
import { SixRules } from './SixRules';

describe('SixRules', () => {
    let rules: SixRules;

    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    beforeEach(() => {
        rules = new SixRules(SixGameState);
    });
    describe('dropping', () => {
        it('Should forbid landing/dropping on existing piece (drop)', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 4);
            const move: SixMove = SixMove.fromDrop(new Coord(1, 1));
            const status: LegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.getReason()).toBe('Cannot land on occupied coord!');
        });
        it('Should forbid landing/dropping on existing piece (deplacement)', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 44);
            const move: SixMove = SixMove.fromDeplacement(new Coord(1, 2), new Coord(1, 1));
            const status: LegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.getReason()).toBe('Cannot land on occupied coord!');
        });
        it('Should forbid drop after 40th turn', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ]; // Fake 40th turn, since there is not 42 stone on the board
            const slice: SixGameState = SixGameState.fromRepresentation(board, 40);
            const move: SixMove = SixMove.fromDrop(new Coord(0, 1));
            const status: LegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.getReason()).toBe('Can no longer drop after 40th turn!');
        });
        it('Should allow drop outside the current range', () => {
            const board: NumberTable = [
                [X, X, O, _, X],
                [X, X, O, _, O],
                [_, X, O, _, O],
                [_, X, O, _, X],
                [_, X, O, O, X],
            ];
            const expectedBoard: NumberTable = [
                [_, _, _, _, _, O],
                [X, X, O, _, X, _],
                [X, X, O, _, O, _],
                [_, X, O, _, O, _],
                [_, X, O, _, X, _],
                [_, X, O, O, X, _],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 0);
            const move: SixMove = SixMove.fromDrop(new Coord(5, -1));
            const status: SixLegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
            const expectedSlice: SixGameState =
                SixGameState.fromRepresentation(expectedBoard, 1);
            expect(resultingSlice.pieces.equals(expectedSlice.pieces)).toBeTrue();
        });
        it('Should forbid dropping coord to be not connected to any piece', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, _, O],
                [X, X, O],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 5);
            const move: SixMove = SixMove.fromDrop(new Coord(0, 0));
            const status: LegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.getReason()).toBe('Piece must be connected to other pieces!');
        });
    });
    describe('Deplacement', () => {
        it('Should forbid deplacement before 40th turn', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ]; // Fake 40th turn, since there is not 42 stone on the board
            const slice: SixGameState = SixGameState.fromRepresentation(board, 0);
            const move: SixMove = SixMove.fromDeplacement(new Coord(1, 2), new Coord(3, 0));
            const status: LegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.getReason()).toBe('Cannot do deplacement before 42th turn!');
        });
        it('Should forbid moving ennemy piece', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromDeplacement(new Coord(0, 2), new Coord(2, 1));
            const status: LegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.getReason()).toBe('Cannot move ennemy piece!');
        });
        it('Should forbid moving empty piece', () => {
            const board: NumberTable = [
                [_, _, O],
                [_, X, _],
                [X, O, _],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromDeplacement(new Coord(0, 0), new Coord(2, 1));
            const status: LegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.getReason()).toBe('Cannot move empty coord!');
        });
    });
    describe('Deconnection', () => {
        it('Should deconnect smaller group automatically', () => {
            const board: NumberTable = [
                [X, X, O, _, _],
                [X, X, O, _, _],
                [_, X, O, _, _],
                [_, X, O, _, X],
                [_, X, O, O, X],
            ];
            const expectedBoard: NumberTable = [
                [X, X, O, O],
                [X, X, O, _],
                [_, X, O, _],
                [_, X, O, _],
                [_, X, O, _],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromDeplacement(new Coord(3, 4), new Coord(3, 0));
            const status: SixLegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
            const expectedSlice: SixGameState =
                SixGameState.fromRepresentation(expectedBoard, 43);
            expect(resultingSlice.pieces.equals(expectedSlice.pieces)).toBeTrue();
        });
        it('Should refuse deconnection of same sized group when no group is mentionned', () => {
            const board: NumberTable = [
                [X, X, _, O, _],
                [X, X, _, O, _],
                [_, X, O, O, _],
                [_, X, _, O, _],
                [_, X, _, O, O],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromDeplacement(new Coord(2, 2), new Coord(4, 3));
            const status: LegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.getReason()).toBe('Several groups are of same size, you must pick the one to keep!');
        });
        it('Should refuse deconnection of different sized group with mentionned group', () => {
            const board: NumberTable = [
                [X, X, _, _, _],
                [X, X, _, _, _],
                [_, X, O, O, _],
                [_, X, _, O, _],
                [_, X, _, O, O],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromCuttingDeplacement(new Coord(2, 2), new Coord(4, 3), new Coord(0, 0));
            const status: LegalityStatus = rules.isLegal(move, slice);
            const reason: string = 'You cannot choose which part to keep when one is smaller than the other!';
            expect(status.legal.getReason()).toBe(reason);
        });
        it('Should refuse deconnection where captured coord is empty', () => {
            const board: NumberTable = [
                [X, X, _, O, _],
                [X, X, _, O, _],
                [_, X, O, O, _],
                [_, X, _, O, O],
                [_, X, _, O, _],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromCuttingDeplacement(new Coord(2, 2), new Coord(4, 4), new Coord(4, 0));
            const status: LegalityStatus = rules.isLegal(move, slice);
            const reason: string = 'Cannot keep empty coord!';
            expect(status.legal.getReason()).toBe(reason);
        });
    });
    describe('victories', () => {
        xit('Should consider winner player who align 6 pieces', () => {
            const board: number[][] = [
                [O, O, O, O, O, X, X, X, X, X],
            ];
            const expectedBoard: number[][] = [
                [O, O, O, O, O, X, X, X, X, X, X],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 23);
            const move: SixMove = SixMove.fromDrop(new Coord(10, 0));
            const status: SixLegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
            const expectedSlice: SixGameState = SixGameState.fromRepresentation(expectedBoard, 24);
            expect(resultingSlice).toEqual(expectedSlice);
            const boardValue: number = rules.getBoardValue(move, expectedSlice);
            expect(boardValue).toEqual(Number.MAX_SAFE_INTEGER, 'This should be a victory for Player.ONE.');
        });
        it('Should consider winner player who draw a circle/hexagon of his pieces', () => {
            const board: number[][] = [
                [O, _, _, _, _],
                [O, X, _, X, _],
                [O, X, _, X, O],
                [_, X, X, _, _],
                [_, _, O, _, _],
            ];
            const expectedBoard: number[][] = [
                [O, _, _, _, _],
                [O, _, X, X, _],
                [O, X, _, X, O],
                [_, X, X, _, _],
                [_, _, O, _, _],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 43);
            const move: SixMove = SixMove.fromDeplacement(new Coord(1, 1), new Coord(2, 1));
            const status: SixLegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
            const expectedSlice: SixGameState = SixGameState.fromRepresentation(expectedBoard, 44);
            expect(resultingSlice.pieces.equals(expectedSlice.pieces)).toBeTrue();
            const boardValue: number = rules.getBoardValue(move, expectedSlice);
            expect(boardValue).toEqual(Number.MAX_SAFE_INTEGER, 'This should be a victory for Player.ONE.');
        });
        it('Should consider winner player who draw a triangle of his pieces (corner drop)', () => {
            const board: number[][] = [
                [O, _, _, _, _],
                [O, _, X, _, _],
                [O, _, X, X, O],
                [O, X, X, X, _],
                [O, O, _, _, _],
            ];
            const expectedBoard: number[][] = [
                [O, _, _, _, _],
                [O, _, _, X, _],
                [O, _, X, X, O],
                [O, X, X, X, _],
                [O, O, _, _, _],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 43);
            const move: SixMove = SixMove.fromDeplacement(new Coord(2, 1), new Coord(3, 1));
            const status: SixLegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
            const expectedSlice: SixGameState = SixGameState.fromRepresentation(expectedBoard, 44);
            expect(resultingSlice.pieces.equals(expectedSlice.pieces)).toBeTrue();
            const boardValue: number = rules.getBoardValue(move, expectedSlice);
            expect(boardValue).toEqual(Number.MAX_SAFE_INTEGER, 'This should be a victory for Player.ONE.');
        });
        it('Should consider winner player who draw a triangle of his pieces (edge drop)', () => {
            const board: number[][] = [
                [O, _, _, _, _],
                [O, X, _, X, _],
                [O, _, _, X, O],
                [O, X, X, X, _],
                [O, O, _, _, _],
            ];
            const expectedBoard: number[][] = [
                [O, _, _, _, _],
                [O, _, _, X, _],
                [O, _, X, X, O],
                [O, X, X, X, _],
                [O, O, _, _, _],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 43);
            const move: SixMove = SixMove.fromDeplacement(new Coord(1, 1), new Coord(2, 2));
            const status: SixLegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
            const expectedSlice: SixGameState = SixGameState.fromRepresentation(expectedBoard, 44);
            expect(resultingSlice.pieces.equals(expectedSlice.pieces)).toBeTrue();
            const boardValue: number = rules.getBoardValue(move, expectedSlice);
            expect(boardValue).toEqual(Number.MAX_SAFE_INTEGER, 'This should be a victory for Player.ONE.');
        });
        xit('Should consider looser the first player to drop bellow 6 pieces on phase two', () => {
            const board: NumberTable = [
                [X, X, O, _, _],
                [_, X, O, _, _],
                [_, X, O, _, _],
                [_, X, O, _, X],
                [_, _, O, O, X],
            ];
            const expectedBoard: NumberTable = [
                [X, X, O, O],
                [_, X, O, _],
                [_, X, O, _],
                [_, X, O, _],
                [_, _, O, _],
            ];
            const slice: SixGameState = SixGameState.fromRepresentation(board, 42);
            const move: SixMove = SixMove.fromDeplacement(new Coord(3, 4), new Coord(3, 0));
            const status: SixLegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
            const expectedSlice: SixGameState =
                SixGameState.fromRepresentation(expectedBoard, 43);
            expect(resultingSlice.pieces.equals(expectedSlice.pieces)).toBeTrue();
            const boardValue: number = rules.getBoardValue(move, expectedSlice);
            expect(boardValue).toEqual(Player.ZERO.getVictoryValue(), 'This should be a victory for Player.ZERO.');
        });
    });
});
