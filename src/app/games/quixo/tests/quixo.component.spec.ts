import { fakeAsync } from '@angular/core/testing';

import { QuixoComponent } from '../quixo.component';
import { QuixoMove } from 'src/app/games/quixo/QuixoMove';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { GameComponentUtils } from '../../../components/game-components/GameComponentUtils';
import { RulesFailure } from 'src/app/jscaip/Rules';
import { ComponentTestUtils } from 'src/app/utils/TestUtils.spec';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Player } from 'src/app/jscaip/player/Player';
import { QuixoPartSlice } from 'src/app/games/quixo/QuixoPartSlice';
import { QuixoFailure } from 'src/app/games/quixo/QuixoFailure';

describe('QuixoComponent', () => {

    let componentTestUtils: ComponentTestUtils<QuixoComponent>;

    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<QuixoComponent>('Quixo');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('Component should be created');
    });
    it('should style piece correctly', () => {
        componentTestUtils.getComponent().chosenCoord = new Coord(0, 0);
        expect(componentTestUtils.getComponent().getPieceClasses(0, 0)).toContain('selected');

        componentTestUtils.getComponent().lastMoveCoord = new Coord(4, 4);
        expect(componentTestUtils.getComponent().getPieceClasses(4, 4)).toContain('lastmove');
    });
    it('should give correct direction', () => {
        let possibleDirections: [number, number, string][];

        componentTestUtils.getComponent().chosenCoord = new Coord(0, 0);
        // might want changeDetection
        possibleDirections = componentTestUtils.getComponent().getPossiblesDirections();
        expect(possibleDirections).toEqual([[2, 1, 'RIGHT'], [1, 2, 'DOWN']]);

        componentTestUtils.getComponent().onBoardClick(4, 4);
        possibleDirections = componentTestUtils.getComponent().getPossiblesDirections();
        expect(possibleDirections).toEqual([[0, 1, 'LEFT'], [1, 0, 'UP']]);
    });
    it('should cancel move when trying to select ennemy piece', async() => {
        const board: NumberTable = [
            [O, _, _, _, _],
            [_, _, _, _, _],
            [X, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: QuixoPartSlice = new QuixoPartSlice(board, 3);
        componentTestUtils.setupSlice(state);

        await componentTestUtils.expectClickFailure('#click_0_0', RulesFailure.CANNOT_CHOOSE_ENNEMY_PIECE);
    });
    it('should cancel move when trying to select center coord', async() => {
        const board: NumberTable = [
            [O, _, _, _, _],
            [_, _, _, _, _],
            [X, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: QuixoPartSlice = new QuixoPartSlice(board, 3);
        componentTestUtils.setupSlice(state);

        await componentTestUtils.expectClickFailure('#click_1_1', QuixoFailure.NO_INSIDE_CLICK);
    });
    it('should delegate triangleCoord calculation to GameComponentUtils', () => {
        const board: NumberTable = [
            [O, _, _, _, _],
            [_, _, _, _, _],
            [X, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: QuixoPartSlice = new QuixoPartSlice(board, 3);
        componentTestUtils.setupSlice(state);

        spyOn(GameComponentUtils, 'getTriangleCoordinate').and.callThrough();
        componentTestUtils.expectClickSuccess('#click_0_2');
        componentTestUtils.getComponent().getTriangleCoordinate(2, 1);
        expect(GameComponentUtils.getTriangleCoordinate).toHaveBeenCalledWith(0, 2, 2, 1);
    });
    it('should delegate decoding to move', () => {
        spyOn(QuixoMove, 'decode').and.callThrough();
        componentTestUtils.getComponent().decodeMove(new QuixoMove(0, 0, Orthogonal.DOWN).encode());
        expect(QuixoMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(QuixoMove, 'encode').and.callThrough();
        componentTestUtils.getComponent().encodeMove(new QuixoMove(0, 0, Orthogonal.DOWN));
        expect(QuixoMove.encode).toHaveBeenCalledTimes(1);
    });
});
