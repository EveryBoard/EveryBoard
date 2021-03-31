import { Coord } from 'src/app/jscaip/coord/Coord';
import { Player } from 'src/app/jscaip/player/Player';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
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
            const state: SixGameState = SixGameState.fromRepresentation(representation, 0);
            expect(state.pieces).toEqual(expectedPieces);
        });
    });
});
