/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { Table } from 'src/app/jscaip/TableUtils';
import { Set, ReversibleMap, Utils } from '@everyboard/lib';
import { SixState } from '../SixState';
import { CoordSet } from 'src/app/jscaip/CoordSet';

describe('SixState', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = Player.ZERO;
    const X: PlayerOrNone = Player.ONE;

    describe('toRepresentation/fromRepresentation', () => {

        it('should represent correctly board', () => {
            const pieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
            pieces.put(new Coord(0, 0), Player.ONE);
            pieces.put(new Coord(1, 1), Player.ZERO);
            const state: SixState = new SixState(pieces, 0);
            const expectedRepresentation: Table<PlayerOrNone> = [
                [X, _],
                [_, O],
            ];
            expect(state.toRepresentation()).toEqual(expectedRepresentation);
        });

        it('should create correctly from representation', () => {
            const representation: Table<PlayerOrNone> = [
                [X, _],
                [_, O],
            ];
            const expectedPieces: ReversibleMap<Coord, Player> = new ReversibleMap<Coord, Player>();
            expectedPieces.put(new Coord(0, 0), Player.ONE);
            expectedPieces.put(new Coord(1, 1), Player.ZERO);
            expectedPieces.makeImmutable();
            const state: SixState = SixState.ofRepresentation(representation, 0);
            expect(state.pieces).toEqual(expectedPieces);
        });

    });

    describe('getGroups', () => {

        it('when a piece has been removed, the board might be separated in several sub-groups', () => {
            const representation: Table<PlayerOrNone> = [
                [_, _, X, _, _],
                [_, _, X, _, _],
                [_, _, _, X, X],
                [_, O, _, _, _],
                [O, _, _, _, _],
            ];
            const state: SixState = SixState.ofRepresentation(representation, 40);
            const groups: Set<CoordSet> = state.getGroups();
            const expectedGroups: Set<CoordSet> = new Set([
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
            const representation: Table<PlayerOrNone> = [
                [_, _, X, _, _],
                [_, _, X, _, _],
                [_, _, _, X, X],
                [_, O, _, _, _],
                [O, _, _, _, _],
            ];
            const state: SixState = SixState.ofRepresentation(representation, 40);
            // When trying to switch an empty coord
            // Then it should throw and call logError
            spyOn(Utils, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            const errorMessage: string = 'Cannot switch piece if there is no piece!';
            expect(() => state.switchPiece(new Coord(0, 0))).toThrowError('Assertion failure: ' + errorMessage);
            expect(Utils.logError).toHaveBeenCalledWith('Assertion failure', errorMessage, { coord: '(0, 0)' });
        });

    });

});
