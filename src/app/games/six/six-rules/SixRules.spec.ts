import { Coord } from 'src/app/jscaip/coord/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/player/Player';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { SixGameState } from '../six-game-state/SixGameState';
import { SixMove } from '../six-move/SixMove';
import { SixRules } from './SixRules';

describe('SixRules', () => {
    let rules: SixRules;

    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    beforeEach(() => {
        rules = new SixRules(SixGameState);
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
    it('Should forbid deplacement before 40th turn', () => {
        const board: NumberTable = [
            [_, _, O],
            [_, X, _],
            [X, O, _],
        ]; // Fake 40th turn, since there is not 42 stone on the board
        const slice: SixGameState = SixGameState.fromRepresentation(board, 0);
        const move: SixMove = SixMove.fromDeplacement(new Coord(1, 2), new Coord(3, 0));
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.getReason()).toBe('Can not do deplacement before 42th turn!');
    });
    it('Should forbid landing/dropping coord to be not connected to any piece', () => {
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
    it('Should forbid landing/dropping on existing piece', () => {
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
    xit('Should deconnect smaller group automatically', () => {
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
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: SixGameState = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: SixGameState =
            SixGameState.fromRepresentation(expectedBoard, 43);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    xit('Should refuse deconnection of same sized group when no group is mentionned', () => {
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
        expect(status.legal.getReason()).toBe('Board was split in two equal part, you must mention which one to keep!');
    });
    xit('Should refuse deconnection of different sized group with mentionned group', () => {
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
    xit('Should refuse deconnection where captured coord is empty', () => {
        const board: NumberTable = [
            [X, X, _, O, _],
            [X, X, _, O, _],
            [_, X, O, O, _],
            [_, X, _, O, _],
            [_, X, _, O, O],
        ];
        const slice: SixGameState = SixGameState.fromRepresentation(board, 42);
        const move: SixMove = SixMove.fromCuttingDeplacement(new Coord(2, 2), new Coord(4, 3), new Coord(4, 0));
        const status: LegalityStatus = rules.isLegal(move, slice);
        const reason: string = 'Cannot keep empty coord!';
        expect(status.legal.getReason()).toBe(reason);
    });
});
