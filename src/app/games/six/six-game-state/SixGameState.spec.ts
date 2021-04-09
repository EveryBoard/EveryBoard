import { Coord } from 'src/app/jscaip/coord/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/player/Player';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPBiMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPSet } from 'src/app/utils/mgp-set/MGPSet';
import { MGPBoolean, SixGameState } from './SixGameState';

describe('SixGameState', () => {

    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    describe('toRepresentation/fromRepresentation', () => {
        it('Should represent correctly board', () => {
            const pieces: MGPBiMap<Coord, MGPBoolean> = new MGPBiMap<Coord, MGPBoolean>();
            pieces.put(new Coord(0, 0), MGPBoolean.TRUE);
            pieces.put(new Coord(1, 1), MGPBoolean.FALSE);
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
            const expectedPieces: MGPBiMap<Coord, MGPBoolean> = new MGPBiMap<Coord, MGPBoolean>();
            expectedPieces.put(new Coord(0, 0), MGPBoolean.TRUE);
            expectedPieces.put(new Coord(1, 1), MGPBoolean.FALSE);
            expectedPieces.makeImmutable();
            const state: SixGameState = SixGameState.fromRepresentation(representation, 0);
            expect(state.pieces).toEqual(expectedPieces);
        });
        it('Should make 0 the left and upper indexes', () => {
            const pieces: MGPBiMap<Coord, MGPBoolean> = new MGPBiMap<Coord, MGPBoolean>();
            pieces.put(new Coord(-1, -1), MGPBoolean.TRUE);
            pieces.put(new Coord(0, 0), MGPBoolean.FALSE);
            const state: SixGameState = new SixGameState(pieces, 0);
            const expectedRepresentation: NumberTable = [
                [X, _],
                [_, O],
            ];
            expect(state.toRepresentation()).toEqual(expectedRepresentation);
            expect(state.offset).toEqual(new Vector(1, 1));
        });
        it('Should make 0 the left and upper indexes (horizontal bug)', () => {
            const pieces: MGPBiMap<Coord, MGPBoolean> = new MGPBiMap<Coord, MGPBoolean>();
            pieces.put(new Coord(1, 0), MGPBoolean.TRUE);
            pieces.put(new Coord(2, 0), MGPBoolean.FALSE);
            pieces.put(new Coord(3, 0), MGPBoolean.TRUE);
            const state: SixGameState = new SixGameState(pieces, 0);
            const expectedRepresentation: NumberTable = [
                [X, O, X],
            ];
            expect(state.toRepresentation()).toEqual(expectedRepresentation);
            expect(Vector.equals(state.offset, new Vector(-1, 0)));
        });
        it('Should make 0 the left and upper indexes (vertical bug)', () => {
            const pieces: MGPBiMap<Coord, MGPBoolean> = new MGPBiMap<Coord, MGPBoolean>();
            pieces.put(new Coord(0, 1), MGPBoolean.TRUE);
            pieces.put(new Coord(0, 2), MGPBoolean.FALSE);
            pieces.put(new Coord(0, 3), MGPBoolean.TRUE);
            const state: SixGameState = new SixGameState(pieces, 0);
            const expectedRepresentation: NumberTable = [
                [X],
                [O],
                [X],
            ];
            expect(state.toRepresentation()).toEqual(expectedRepresentation);
            expect(Vector.equals(state.offset, new Vector(0, -1)));
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
