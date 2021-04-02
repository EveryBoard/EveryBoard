import { Coord } from 'src/app/jscaip/coord/Coord';
import { Player } from 'src/app/jscaip/player/Player';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPSet } from 'src/app/utils/mgp-set/MGPSet';
import { SixGameState } from './SixGameState';

describe('SixGameState', () => {

    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    describe('toRepresentation/fromRepresentation', () => {
        it('Should represent correctly board', () => {
            const pieces: MGPMap<Coord, boolean> = new MGPMap<Coord, boolean>();
            pieces.put(new Coord(0, 0), true);
            pieces.put(new Coord(1, 1), false);
            const state: SixGameState = new SixGameState(pieces, 0);
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
            const expectedPieces: MGPMap<Coord, boolean> = new MGPMap<Coord, boolean>();
            expectedPieces.put(new Coord(0, 0), true);
            expectedPieces.put(new Coord(1, 1), false);
            expectedPieces.makeImmutable();
            const state: SixGameState = SixGameState.fromRepresentation(representation, 0);
            expect(state.pieces).toEqual(expectedPieces);
        });
        it('Should make 0 the left and upper indexes', () => {
            const pieces: MGPMap<Coord, boolean> = new MGPMap<Coord, boolean>();
            pieces.put(new Coord(-1, -1), true);
            pieces.put(new Coord(0, 0), false);
            const state: SixGameState = new SixGameState(pieces, 0);
            const expectedRepresentation: NumberTable = [
                [X, _],
                [_, O],
            ];
            expect(state.toRepresentation()).toEqual(expectedRepresentation);
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
            const state: SixGameState = SixGameState.fromRepresentation(representation, 40);
            const groups: MGPSet<MGPSet<Coord>> = state.getGroups(new Coord(2, 2));
            const expectedGroups: MGPSet<MGPSet<Coord>> = new MGPSet([
                new MGPSet([new Coord(2, 0), new Coord(2, 1)]),
                new MGPSet([new Coord(3, 2), new Coord(4, 2)]),
                new MGPSet([new Coord(0, 4), new Coord(1, 3)]),
            ]);
            expect(groups.equals(expectedGroups)).toBeTrue();
        });
    });
});
