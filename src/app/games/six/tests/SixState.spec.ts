/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { ReversibleMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { CoordSet } from 'src/app/utils/OptimizedSet';
import { SixMove } from '../SixMove';
import { SixState } from '../SixState';

describe('SixState', () => {

    const _: number = PlayerOrNone.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    describe('toRepresentation/fromRepresentation', () => {
        it('Should represent correctly board', () => {
            const pieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
            pieces.put(new Coord(0, 0), Player.ONE);
            pieces.put(new Coord(1, 1), Player.ZERO);
            const state: SixState = new SixState(pieces, 0);
            const expectedRepresentation: NumberTable = [
                [X, _],
                [_, O],
            ];
            expect(state.toRepresentation()).toEqual(expectedRepresentation);
        });
        it('Should create correctly from representation', () => {
            const representation: NumberTable = [
                [X, _],
                [_, O],
            ];
            const expectedPieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
            expectedPieces.put(new Coord(0, 0), Player.ONE);
            expectedPieces.put(new Coord(1, 1), Player.ZERO);
            expectedPieces.makeImmutable();
            const state: SixState = SixState.fromRepresentation(representation, 0);
            expect(state.pieces).toEqual(expectedPieces);
        });
        it('Should make 0 the left and upper indexes', () => {
            const pieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
            pieces.put(new Coord(-1, -1), Player.ONE);
            pieces.put(new Coord(0, 0), Player.ZERO);
            const state: SixState = new SixState(pieces, 0);
            const expectedRepresentation: NumberTable = [
                [X, _],
                [_, O],
            ];
            expect(state.toRepresentation()).toEqual(expectedRepresentation);
            expect(state.offset).toEqual(new Vector(1, 1));
        });
        it('Should make 0 the left and upper indexes (horizontal bug)', () => {
            const pieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
            pieces.put(new Coord(1, 0), Player.ONE);
            pieces.put(new Coord(2, 0), Player.ZERO);
            pieces.put(new Coord(3, 0), Player.ONE);
            const state: SixState = new SixState(pieces, 0);
            const expectedRepresentation: NumberTable = [
                [X, O, X],
            ];
            expect(state.toRepresentation()).toEqual(expectedRepresentation);
            expect(state.offset.equals(new Vector(-1, 0))).toBeTrue();
        });
        it('Should make 0 the left and upper indexes (vertical bug)', () => {
            const pieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
            pieces.put(new Coord(0, 1), Player.ONE);
            pieces.put(new Coord(0, 2), Player.ZERO);
            pieces.put(new Coord(0, 3), Player.ONE);
            const state: SixState = new SixState(pieces, 0);
            const expectedRepresentation: NumberTable = [
                [X],
                [O],
                [X],
            ];
            expect(state.toRepresentation()).toEqual(expectedRepresentation);
            expect(state.offset.equals(new Vector(0, -1))).toBeTrue();
        });
        it('should set offset when board only upper-piece went down', () => {
            const beforePieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
            beforePieces.put(new Coord(0, 0), Player.ONE);
            beforePieces.put(new Coord(0, 1), Player.ZERO);
            beforePieces.put(new Coord(0, 2), Player.ONE);
            const beforeState: SixState = new SixState(beforePieces, 0);

            const move: SixMove = SixMove.fromMovement(new Coord(0, 0), new Coord(0, 3));
            const afterState: SixState = beforeState.applyLegalDeplacement(move, new CoordSet());

            const expectedPieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
            expectedPieces.put(new Coord(0, 0), Player.ZERO);
            expectedPieces.put(new Coord(0, 1), Player.ONE);
            expectedPieces.put(new Coord(0, 2), Player.ZERO);
            expectedPieces.makeImmutable();

            expect(afterState.pieces).toEqual(expectedPieces);
            expect(afterState.offset).toEqual(new Vector(-0, -1));
        });
    });
    describe('getGroups', () => {
        it('when a piece has been removed, the board might be separated in several sub-groups', () => {
            const representation: NumberTable = [
                [_, _, X, _, _],
                [_, _, X, _, _],
                [_, _, _, X, X],
                [_, O, _, _, _],
                [O, _, _, _, _],
            ];
            const state: SixState = SixState.fromRepresentation(representation, 40);
            const groups: MGPSet<MGPSet<Coord>> = SixState.getGroups(state.pieces, new Coord(2, 2));
            const expectedGroups: MGPSet<MGPSet<Coord>> = new MGPSet([
                new CoordSet([new Coord(2, 0), new Coord(2, 1)]),
                new CoordSet([new Coord(3, 2), new Coord(4, 2)]),
                new CoordSet([new Coord(0, 4), new Coord(1, 3)]),
            ]);
            expect(groups.equals(expectedGroups)).toBeTrue();
        });
    });
    describe('switchPiece', () => {
        it('should throw when trying to switch a piece that does not exist', () => {
            // Given a state with some pieces
            const representation: NumberTable = [
                [_, _, X, _, _],
                [_, _, X, _, _],
                [_, _, _, X, X],
                [_, O, _, _, _],
                [O, _, _, _, _],
            ];
            const state: SixState = SixState.fromRepresentation(representation, 40);
            // When trying to switch an empty coord
            // Then it should throw and call logError
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            const errorMessage: string = 'Cannot switch piece if there is no piece!';
            expect(() => state.switchPiece(new Coord(0, 0))).toThrowError('SixState: ' + errorMessage + ' (extra data: {"coord":"(0, 0)"})');
            expect(ErrorLoggerService.logError).toHaveBeenCalledWith('SixState', errorMessage, { coord: '(0, 0)' });
        });
    });
});
