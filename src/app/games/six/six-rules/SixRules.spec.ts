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
        describe('Shape Victories', () => {
            it('Should consider winner player who align 6 pieces', () => {
                const board: number[][] = [
                    [_, _, _, _, O],
                    [_, _, _, O, X],
                    [_, _, O, X, _],
                    [_, O, X, X, _],
                    [O, X, _, _, _],
                ];
                const expectedBoard: number[][] = [
                    [_, _, _, _, _, O],
                    [_, _, _, _, O, X],
                    [_, _, _, O, X, _],
                    [_, _, O, X, X, _],
                    [_, O, X, _, _, _],
                    [O, _, _, _, _, _],
                ];
                const slice: SixGameState = SixGameState.fromRepresentation(board, 10);
                const move: SixMove = SixMove.fromDrop(new Coord(-1, 5));
                const status: SixLegalityStatus = rules.isLegal(move, slice);
                expect(status.legal.isSuccess()).toBeTrue();
                const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
                const expectedSlice: SixGameState = SixGameState.fromRepresentation(expectedBoard, 11);
                expect(resultingSlice.pieces).toEqual(expectedSlice.pieces);
                const boardValue: number = rules.getBoardValue(move, resultingSlice);
                expect(boardValue).toEqual(Player.ZERO.getVictoryValue(), 'This should be a victory for Player.ZERO.');
            });
            it('Should consider winner player who draw a circle/hexagon of his pieces', () => {
                const board: number[][] = [
                    [O, _, _, _, _],
                    [O, _, _, X, _],
                    [O, X, _, X, O],
                    [_, X, X, _, _],
                    [_, _, O, X, _],
                ];
                const expectedBoard: number[][] = [
                    [O, _, _, _, _],
                    [O, _, X, X, _],
                    [O, X, _, X, O],
                    [_, X, X, _, _],
                    [_, _, O, X, _],
                ];
                const slice: SixGameState = SixGameState.fromRepresentation(board, 9);
                const move: SixMove = SixMove.fromDrop(new Coord(2, 1));
                const status: SixLegalityStatus = rules.isLegal(move, slice);
                expect(status.legal.isSuccess()).toBeTrue();
                const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
                const expectedSlice: SixGameState = SixGameState.fromRepresentation(expectedBoard, 10);
                expect(resultingSlice.pieces.equals(expectedSlice.pieces)).toBeTrue();
                const boardValue: number = rules.getBoardValue(move, resultingSlice);
                expect(boardValue).toEqual(Player.ONE.getVictoryValue(), 'This should be a victory for Player.ONE.');
            });
            it('Should consider winner player who draw a triangle of his pieces (corner drop)', () => {
                const board: number[][] = [
                    [O, X, _, _, _],
                    [O, _, _, _, _],
                    [O, _, X, X, O],
                    [O, X, X, X, _],
                    [O, O, _, _, _],
                ];
                const expectedBoard: number[][] = [
                    [O, X, _, _, _],
                    [O, _, _, X, _],
                    [O, _, X, X, O],
                    [O, X, X, X, _],
                    [O, O, _, _, _],
                ];
                const slice: SixGameState = SixGameState.fromRepresentation(board, 11);
                const move: SixMove = SixMove.fromDrop(new Coord(3, 1));
                const status: SixLegalityStatus = rules.isLegal(move, slice);
                expect(status.legal.isSuccess()).toBeTrue();
                const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
                const expectedSlice: SixGameState = SixGameState.fromRepresentation(expectedBoard, 12);
                expect(resultingSlice.pieces.equals(expectedSlice.pieces)).toBeTrue();
                const boardValue: number = rules.getBoardValue(move, resultingSlice);
                expect(boardValue).toEqual(Player.ONE.getVictoryValue(), 'This should be a victory for Player.ONE.');
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
                    [O, X, _, X, _],
                    [O, _, X, X, O],
                    [O, X, X, X, _],
                    [O, O, _, _, _],
                ];
                const slice: SixGameState = SixGameState.fromRepresentation(board, 11);
                const move: SixMove = SixMove.fromDrop(new Coord(2, 2));
                const status: SixLegalityStatus = rules.isLegal(move, slice);
                expect(status.legal.isSuccess()).toBeTrue();
                const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
                const expectedSlice: SixGameState = SixGameState.fromRepresentation(expectedBoard, 12);
                expect(resultingSlice.pieces.equals(expectedSlice.pieces)).toBeTrue();
                const boardValue: number = rules.getBoardValue(move, resultingSlice);
                expect(boardValue).toEqual(Player.ONE.getVictoryValue(), 'This should be a victory for Player.ONE.');
            });
        });
        describe('Disconnection Victories', () => {
            it('Should consider looser PLAYER.ZERO when he drop bellow 6 pieces on phase two', () => {
                const board: NumberTable = [
                    [O, O, X, _, _],
                    [_, O, X, _, _],
                    [_, O, X, _, _],
                    [_, O, X, _, O],
                    [_, _, X, X, O],
                ];
                const expectedBoard: NumberTable = [
                    [O, O, X, X],
                    [_, O, X, _],
                    [_, O, X, _],
                    [_, O, X, _],
                    [_, _, X, _],
                ];
                const slice: SixGameState = SixGameState.fromRepresentation(board, 43);
                const move: SixMove = SixMove.fromDeplacement(new Coord(3, 4), new Coord(3, 0));
                const status: SixLegalityStatus = rules.isLegal(move, slice);
                expect(status.legal.isSuccess()).toBeTrue();
                const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
                const expectedSlice: SixGameState =
                    SixGameState.fromRepresentation(expectedBoard, 44);
                expect(resultingSlice.pieces.equals(expectedSlice.pieces)).toBeTrue();
                const boardValue: number = rules.getBoardValue(move, expectedSlice);
                expect(boardValue).toEqual(Player.ONE.getVictoryValue(), 'This should be a victory for Player.ONE.');
            });
            it('Should consider looser PLAYER.ONE when he drop bellow 6 pieces on phase two', () => {
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
            it('Should consider winner Player who has more pieces than opponent and both have less than 6', () => {
                const board: number[][] = [
                    [_, _, _, _, _, O, X, X],
                    [O, O, O, O, O, _, _, O],
                    [_, _, _, _, X, _, _, _],
                    [_, _, X, X, X, _, _, _],
                ];
                const expectedBoard: number[][] = [
                    [O, O, O, O, O],
                ];
                const slice: SixGameState = SixGameState.fromRepresentation(board, 40);
                const move: SixMove = SixMove.fromDeplacement(new Coord(4, 1), new Coord(-1, 1));
                const status: SixLegalityStatus = rules.isLegal(move, slice);
                expect(status.legal.isSuccess()).toBeTrue();
                const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
                const expectedSlice: SixGameState = SixGameState.fromRepresentation(expectedBoard, 41);
                expect(resultingSlice.pieces.equals(expectedSlice.pieces)).toBeTrue();
                const boardValue: number = rules.getBoardValue(move, expectedSlice);
                expect(boardValue).toEqual(Player.ZERO.getVictoryValue(), 'This should be a victory for Player.ZERO.');
            });
            it('Should consider looser Player who has less pieces than opponent and both have less than 6', () => {
                const board: number[][] = [
                    [_, _, _, _, _, X, O],
                    [X, X, X, X, O, _, _],
                    [X, _, _, _, O, _, _],
                    [X, _, _, O, O, _, _],
                ];
                const expectedBoard: number[][] = [
                    [X, X, X, X],
                    [X, _, _, _],
                    [X, _, _, _],
                ];
                const slice: SixGameState = SixGameState.fromRepresentation(board, 42);
                const move: SixMove = SixMove.fromDeplacement(new Coord(4, 1), new Coord(6, 1));
                const status: SixLegalityStatus = rules.isLegal(move, slice);
                expect(status.legal.isSuccess()).toBeTrue();
                const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
                const expectedSlice: SixGameState = SixGameState.fromRepresentation(expectedBoard, 43);
                expect(resultingSlice.pieces.equals(expectedSlice.pieces)).toBeTrue();
                const boardValue: number = rules.getBoardValue(move, expectedSlice);
                expect(boardValue).toEqual(Player.ONE.getVictoryValue(), 'This should be a victory for Player.ONE.');
            });
        });
    });
});
