import { NumberTable } from 'src/app/utils/ArrayUtils';
import { EpaminondasMove } from 'src/app/games/epaminondas/EpaminondasMove';
import { EpaminondasPartSlice } from 'src/app/games/epaminondas/EpaminondasPartSlice';
import { Direction } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { EpaminondasComponent } from '../epaminondas.component';
import { Coord } from 'src/app/jscaip/Coord';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';

describe('EpaminondasComponent:', () => {
    let componentTestUtils: ComponentTestUtils<EpaminondasComponent>;

    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    function expectClickable(x: number, y: number): void {
        const coord: Coord = new Coord(x, y);
        expect(componentTestUtils.getComponent()
            .getHighlightedCoords().some((c: Coord) => c.equals(coord))).toBeTrue();
    }
    function expectNotClickable(x: number, y: number): void {
        const coord: Coord = new Coord(x, y);
        expect(componentTestUtils.getComponent()
            .getHighlightedCoords().some((c: Coord) => c.equals(coord))).toBeFalse();
    }

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<EpaminondasComponent>('Epaminondas');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('EpaminondasComponent should be created');
    });
    it('Should cancelMove when clicking on empty case at first', fakeAsync(async() => {
        const reason: string = 'Cette case est vide, vous devez sélectionner une de vos pièces.';
        await componentTestUtils.expectClickFailure('#click_5_5', reason);
    }));
    it('Should not accept ennemy click as a move first click', fakeAsync(async() => {
        const reason: string = 'Cette pièce appartient à l\'ennemi, vous devez sélectionner une de vos pièces.';
        await componentTestUtils.expectClickFailure('#click_0_0', reason);
    }));
    it('Should show possible next click (after first click)', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_0_11');

        expectClickable(0, 10);
        expectClickable(0, 9);
        expectClickable(1, 11);
        expectClickable(1, 10);
    }));
    it('Should cancel move when clicking on non aligned pice', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_11');
        const reason: string = 'Cette case n\'est pas alignée avec la pièce sélectionnée.';
        await componentTestUtils.expectClickFailure('#click_2_10', reason);
    }));
    it('Should move firstPiece one step when clicking next to it without lastPiece selected', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_10');
        const move: EpaminondasMove = new EpaminondasMove(0, 10, 1, 1, Direction.UP);
        await componentTestUtils.expectMoveSuccess('#click_0_9', move);
    }));
    it('Should not move single piece two step', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_10');
        const reason: string = 'Une pièce seule ne peut se déplacer que d\'une case.';
        await componentTestUtils.expectClickFailure('#click_0_8', reason);
    }));
    it('Should not allow single piece to capture', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_0_9');
        const reason: string = 'Une pièce seule ne peut pas capturer.';
        await componentTestUtils.expectClickFailure('#click_0_8', reason);
    }));
    it('Should deselect first piece when clicked (and no last piece exist)', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_0_11');
        await componentTestUtils.expectClickSuccess('#click_0_11');

        expectClickable(0, 11);
        expectClickable(0, 10);
        expectClickable(0, 9);
    }));
    it('Should cancel move when selecting non-contiguous soldier line', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_0_11');
        await componentTestUtils.expectClickFailure('#click_0_9', 'Une phalange ne peut pas contenir cases vides.');
    }));
    it('Should select all soldier between first selected and new click, and show valid extension and capture both way', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_0_7');
        await componentTestUtils.expectClickSuccess('#click_0_5');

        expectNotClickable(0, 2);
        expectClickable(0, 3);
        expectClickable(0, 4);
        expectNotClickable(0, 5);
        expectNotClickable(0, 6);
        expectNotClickable(0, 7);
        expectClickable(0, 8);
        expectClickable(0, 9);
        expectClickable(0, 10);
        expectNotClickable(0, 11);
    }));
    it('Should change first piece coord when clicked and last piece is neighboors', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_0_11'); // select first piece
        await componentTestUtils.expectClickSuccess('#click_0_10'); // select last piece neighboor
        await componentTestUtils.expectClickSuccess('#click_0_11'); // deselect first piece

        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        expect(epaminondasComponent.firstPiece).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(-15, -1));
        expectClickable(0, 9);
        expectNotClickable(0, 10);
        expectClickable(0, 11);

        expectClickable(1, 9);
        expectClickable(1, 10);
        expectClickable(1, 11);
    }));
    it('Should change first piece coord when clicked and last piece exist but is not neighboors', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_0_11'); // select first piece
        await componentTestUtils.expectClickSuccess('#click_0_9'); // select last piece neighboor
        await componentTestUtils.expectClickSuccess('#click_0_11'); // deselect first piece

        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        expect(epaminondasComponent.firstPiece).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(0, 9));
        expectNotClickable(0, 8);
        expectNotClickable(0, 9);
        expectNotClickable(0, 10);
        expectClickable(0, 11);
    }));
    it('Should change last piece coord when clicked and first piece is neighboors', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_0_11'); // select first piece
        await componentTestUtils.expectClickSuccess('#click_0_10'); // select last piece neighboor

        await componentTestUtils.expectClickSuccess('#click_0_10'); // deselect last piece

        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        expect(epaminondasComponent.firstPiece).toEqual(new Coord(0, 11));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(-15, -1));
        expectClickable(0, 9);
        expectClickable(0, 10);
        expectNotClickable(0, 11);
        expectClickable(1, 10);
        expectClickable(1, 11);
    }));
    it('Should change last piece coord when clicked but first piece is not neighboors', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_0_11'); // select first piece
        await componentTestUtils.expectClickSuccess('#click_0_8'); // select last piece neighboor

        await componentTestUtils.expectClickSuccess('#click_0_8'); // deselect last piece

        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        expect(epaminondasComponent.firstPiece).toEqual(new Coord(0, 11));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(0, 9));
        expect(epaminondasComponent.getPieceClasses(0, 7)).not.toContain('highlighted');
        expect(epaminondasComponent.getPieceClasses(0, 8)).not.toContain('highlighted');
        expect(epaminondasComponent.getPieceClasses(0, 9)).toContain('highlighted');
        expect(epaminondasComponent.getPieceClasses(0, 10)).toContain('highlighted');
        expect(epaminondasComponent.getPieceClasses(0, 11)).toContain('highlighted');
    }));
    it('Should cancelMove when third click is not aligned with last click', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_0_11');
        await componentTestUtils.expectClickSuccess('#click_0_9');

        const reason: string = 'Cette case n\'est pas alignée avec la direction de la phalange.';
        await componentTestUtils.expectClickFailure('#click_1_7', reason);
    }));
    it('Should cancelMove when third click is not aligned with phalange direction', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_0_11');
        await componentTestUtils.expectClickSuccess('#click_0_9');

        const reason: string = 'Cette case n\'est pas alignée avec la direction de la phalange.';
        await componentTestUtils.expectClickFailure('#click_2_9', reason);
    }));
    it('Should cancelMove when third click is an invalid extension', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_0_11');
        await componentTestUtils.expectClickSuccess('#click_0_9');

        const reason: string = 'Une phalange ne peut pas contenir de pièces ennemies.';
        await componentTestUtils.expectClickFailure('#click_0_7', reason);
    }));
    it('Should change first soldier coord when last click was a phalanx extension in the opposite direction of the phalanx', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_1_10');
        await componentTestUtils.expectClickSuccess('#click_2_10');
        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        expect(epaminondasComponent.firstPiece).toEqual(new Coord(1, 10));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(2, 10));

        await componentTestUtils.expectClickSuccess('#click_0_10');

        expect(epaminondasComponent.firstPiece).toEqual(new Coord(2, 10));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(0, 10));
    }));
    it('Should change last soldier coord when last click was a phalanx extension in the phalanx direction', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_10');
        await componentTestUtils.expectClickSuccess('#click_1_10');
        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        expect(epaminondasComponent.firstPiece).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(1, 10));

        await componentTestUtils.expectClickSuccess('#click_2_10');

        expect(epaminondasComponent.firstPiece).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(2, 10));
    }));
    it('End: Should show last move when no move is ongoing (captures, left case, moved phallange)', fakeAsync(async() => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_0_11');
        await componentTestUtils.expectClickSuccess('#click_0_9');

        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        const move: EpaminondasMove = new EpaminondasMove(0, 11, 3, 1, Direction.UP);
        await componentTestUtils.expectMoveSuccess('#click_0_8', move);

        expect(epaminondasComponent.getRectClasses(0, 7)).toEqual(['captured']);
        expect(epaminondasComponent.getRectClasses(0, 8)).toEqual(['captured']);
        expect(epaminondasComponent.getRectClasses(0, 9)).toEqual(['moved']);
        expect(epaminondasComponent.getRectClasses(0, 10)).toEqual(['moved']);
        expect(epaminondasComponent.getRectClasses(0, 11)).toEqual(['moved']);
    }));
});
