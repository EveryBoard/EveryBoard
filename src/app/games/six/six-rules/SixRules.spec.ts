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
    // it('Should not remove tiles emptied, when connected by 3 separated sides', () => {
    //     const board: NumberTable = [
    //         [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
    //         [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
    //         [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
    //         [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
    //         [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
    //         [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
    //         [N, N, N, N, N, N, N, N, N, N, N, N, X, _, _],
    //         [N, N, N, N, N, N, N, N, N, _, O, _, O, _, _],
    //         [N, N, N, N, N, N, X, _, _, _, _, _, N, N, N],
    //         [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
    //     ];
    //     const expectedBoard: NumberTable = [
    //         [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
    //         [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
    //         [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
    //         [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
    //         [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
    //         [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
    //         [N, N, N, N, N, N, N, N, N, N, N, N, X, _, _],
    //         [N, N, N, N, N, N, N, N, N, _, _, _, O, _, _],
    //         [N, N, N, N, N, N, X, _, _, _, _, _, N, N, N],
    //         [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
    //     ];
    //     const slice: CoerceoPartSlice = new CoerceoPartSlice(board, 1, [0, 2], [0, 0]);
    //     const move: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(10, 7));
    //     const status: LegalityStatus = rules.isLegal(move, slice);
    //     expect(status.legal.isSuccess()).toBeTrue();
    //     const resultingSlice: CoerceoPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
    //     const expectedSlice: CoerceoPartSlice =
    //         new CoerceoPartSlice(expectedBoard, 2, [0, 0], [0, 1]);
    //     expect(resultingSlice).toEqual(expectedSlice);
    // });
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
        expect(status.legal.getReason()).toBe('Piece is not connected to any other pieces.');
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
        expect(status.legal.getReason()).toBe('Can not drop on another piece!');
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
    it('Should deconnect smaller group automatically');
    it('Should refuse deconnection of same sized group when no group is mentionned');
    it('Should refuse deconnection of different sized group with mentionned group');
    it('Should refuse deconnection where captured coord is empty');
});
