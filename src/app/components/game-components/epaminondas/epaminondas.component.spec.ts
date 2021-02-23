import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { AppModule } from 'src/app/app.module';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { EpaminondasMove } from 'src/app/games/epaminondas/epaminondas-move/EpaminondasMove';
import { EpaminondasPartSlice } from 'src/app/games/epaminondas/epaminondas-part-slice/EpaminondasPartSlice';
import { EpaminondasNode } from 'src/app/games/epaminondas/epaminondas-rules/EpaminondasRules';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { Player } from 'src/app/jscaip/player/Player';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { EpaminondasComponent } from './epaminondas.component';
import {
    expectClickFail, expectClickSuccess, expectMoveSuccess,
    MoveExpectations, TestElements } from 'src/app/utils/TestUtils';
import { Coord } from 'src/app/jscaip/coord/Coord';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Epaminondas';
            },
        },
    },
};
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null }),

    getAuthenticatedUser: () => {
        return { pseudo: null, verified: null };
    },
};
describe('EpaminondasComponent:', () => {
    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    let wrapper: LocalGameWrapperComponent;

    let testElements: TestElements;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: JoueursDAO, useClass: JoueursDAOMock },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        }).compileComponents();
        const fixture: ComponentFixture<LocalGameWrapperComponent> = TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        const debugElement: DebugElement = fixture.debugElement;
        tick(1);
        const gameComponent: EpaminondasComponent = wrapper.gameComponent as EpaminondasComponent;
        const cancelMoveSpy: jasmine.Spy = spyOn(gameComponent, 'cancelMove').and.callThrough();
        const chooseMoveSpy: jasmine.Spy = spyOn(gameComponent, 'chooseMove').and.callThrough();
        const onValidUserMoveSpy: jasmine.Spy = spyOn(wrapper, 'onValidUserMove').and.callThrough();
        const canUserPlaySpy: jasmine.Spy = spyOn(gameComponent, 'canUserPlay').and.callThrough();
        testElements = {
            fixture,
            debugElement,
            gameComponent,
            canUserPlaySpy,
            cancelMoveSpy,
            chooseMoveSpy,
            onValidUserMoveSpy,
        };
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(testElements.gameComponent).toBeTruthy('EpaminondasComponent should be created');
    });
    it('Should cancelMove when clicking on empty case at first', fakeAsync(async() => {
        const reason: string = 'Cette case est vide, vous devez sélectionner une de vos pièces.';
        await expectClickFail('#click_5_5', testElements, reason);
    }));
    it('Should not accept ennemy click as a move first click', fakeAsync(async() => {
        const reason: string = 'Cette pièce appartient à l\'ennemi, vous devez sélectionner une de vos pièces.';
        await expectClickFail('#click_0_0', testElements, reason);
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
        testElements.gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_11', testElements);

        const epaminondasComponent: EpaminondasComponent = testElements.gameComponent as EpaminondasComponent;
        expect(epaminondasComponent.getRectStyle(0, 10)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 9)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(1, 11)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(1, 10)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
    }));
    it('Should cancel move when clicking on non aligned pice', fakeAsync(async() => {
        await expectClickSuccess('#click_0_11', testElements);
        const reason: string = 'Cette case n\'est pas alignée avec la pièce sélectionnée.';
        await expectClickFail('#click_2_10', testElements, reason);
    }));
    it('Should move firstPiece one step when clicking next to it without lastPiece selected', fakeAsync(async() => {
        await expectClickSuccess('#click_0_10', testElements);
        const expectations: MoveExpectations = {
            move: new EpaminondasMove(0, 10, 1, 1, Direction.UP),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null, scoreOne: null,
        };
        await expectMoveSuccess('#click_0_9', testElements, expectations);
    }));
    it('Should not move single piece two step', fakeAsync(async() => {
        await expectClickSuccess('#click_0_10', testElements);
        const reason: string = 'Une pièce seule ne peut se déplacer que d\'une case.';
        await expectClickFail('#click_0_8', testElements, reason);
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
        testElements.gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_9', testElements);
        const reason: string = 'Une pièce seule ne peut pas capturer.';
        await expectClickFail('#click_0_8', testElements, reason);
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
        testElements.gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_11', testElements);
        await expectClickSuccess('#click_0_11', testElements);

        const epaminondasComponent: EpaminondasComponent = testElements.gameComponent as EpaminondasComponent;
        expect(epaminondasComponent.getRectStyle(0, 11)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 10)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 9)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
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
        testElements.gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_11', testElements);
        await expectClickFail('#click_0_9', testElements, 'Une phalange ne peut pas contenir cases vides.');
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
        testElements.gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_7', testElements);
        await expectClickSuccess('#click_0_5', testElements);

        const epaminondasComponent: EpaminondasComponent = testElements.gameComponent as EpaminondasComponent;
        expect(epaminondasComponent.getRectStyle(0, 2)).not.toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 3)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 4)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 5)).not.toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 6)).not.toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 7)).not.toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 8)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 9)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 10)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 11)).not.toEqual(epaminondasComponent.CLICKABLE_STYLE);
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
        testElements.gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_11', testElements); // select first piece
        await expectClickSuccess('#click_0_10', testElements); // select last piece neighboor
        await expectClickSuccess('#click_0_11', testElements); // deselect first piece

        const epaminondasComponent: EpaminondasComponent = testElements.gameComponent as EpaminondasComponent;
        expect(epaminondasComponent.firstPiece).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(-15, -1));
        expect(epaminondasComponent.getRectStyle(0, 9)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 10)).not.toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 11)).toEqual(epaminondasComponent.CLICKABLE_STYLE);

        expect(epaminondasComponent.getRectStyle(1, 9)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(1, 10)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(1, 11)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
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
        testElements.gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_11', testElements); // select first piece
        await expectClickSuccess('#click_0_9', testElements); // select last piece neighboor

        await expectClickSuccess('#click_0_11', testElements); // deselect first piece

        const epaminondasComponent: EpaminondasComponent = testElements.gameComponent as EpaminondasComponent;
        expect(epaminondasComponent.firstPiece).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(0, 9));
        expect(epaminondasComponent.getRectStyle(0, 8)).not.toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 9)).not.toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 10)).not.toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 11)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
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
        testElements.gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_11', testElements); // select first piece
        await expectClickSuccess('#click_0_10', testElements); // select last piece neighboor

        await expectClickSuccess('#click_0_10', testElements); // deselect last piece

        const epaminondasComponent: EpaminondasComponent = testElements.gameComponent as EpaminondasComponent;
        expect(epaminondasComponent.firstPiece).toEqual(new Coord(0, 11));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(-15, -1));
        expect(epaminondasComponent.getRectStyle(0, 9)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 10)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(0, 11)).not.toEqual(epaminondasComponent.CLICKABLE_STYLE);

        expect(epaminondasComponent.getRectStyle(1, 10)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
        expect(epaminondasComponent.getRectStyle(1, 11)).toEqual(epaminondasComponent.CLICKABLE_STYLE);
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
        testElements.gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_11', testElements); // select first piece
        await expectClickSuccess('#click_0_8', testElements); // select last piece neighboor

        await expectClickSuccess('#click_0_8', testElements); // deselect last piece

        const epaminondasComponent: EpaminondasComponent = testElements.gameComponent as EpaminondasComponent;
        expect(epaminondasComponent.firstPiece).toEqual(new Coord(0, 11));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(0, 9));
        expect(epaminondasComponent.getPieceStroke(0, 7)).toBeNull();
        expect(epaminondasComponent.getPieceStroke(0, 8)).toBeNull();
        expect(epaminondasComponent.getPieceStroke(0, 9)).toBe('yellow');
        expect(epaminondasComponent.getPieceStroke(0, 10)).toBe('yellow');
        expect(epaminondasComponent.getPieceStroke(0, 11)).toBe('yellow');
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
        testElements.gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_11', testElements);
        await expectClickSuccess('#click_0_9', testElements);

        const reason: string = 'Cette case n\'est pas alignée avec la direction de la phalange.';
        await expectClickFail('#click_1_7', testElements, reason);
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
        testElements.gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_11', testElements);
        await expectClickSuccess('#click_0_9', testElements);

        const reason: string = 'Cette case n\'est pas alignée avec la direction de la phalange.';
        await expectClickFail('#click_2_9', testElements, reason);
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
        testElements.gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_11', testElements);
        await expectClickSuccess('#click_0_9', testElements);

        const reason: string = 'Une phalange ne peut pas contenir de pièces ennemies.';
        await expectClickFail('#click_0_7', testElements, reason);
    }));
    it('Should change first soldier coord when last click was a phalanx extension in the opposite direction of the phalanx', fakeAsync(async() => {
        await expectClickSuccess('#click_1_10', testElements);
        await expectClickSuccess('#click_2_10', testElements);
        const epaminondasComponent: EpaminondasComponent = testElements.gameComponent as EpaminondasComponent;
        expect(epaminondasComponent.firstPiece).toEqual(new Coord(1, 10));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(2, 10));

        await expectClickSuccess('#click_0_10', testElements);

        expect(epaminondasComponent.firstPiece).toEqual(new Coord(2, 10));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(0, 10));
    }));
    it('Should change last soldier coord when last click was a phalanx extension in the phalanx direction', fakeAsync(async() => {
        await expectClickSuccess('#click_0_10', testElements);
        await expectClickSuccess('#click_1_10', testElements);
        const epaminondasComponent: EpaminondasComponent = testElements.gameComponent as EpaminondasComponent;
        expect(epaminondasComponent.firstPiece).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece).toEqual(new Coord(1, 10));

        await expectClickSuccess('#click_2_10', testElements);

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
        testElements.gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_11', testElements);
        await expectClickSuccess('#click_0_9', testElements);

        const epaminondasComponent: EpaminondasComponent = testElements.gameComponent as EpaminondasComponent;
        const expectations: MoveExpectations = {
            move: new EpaminondasMove(0, 11, 3, 1, Direction.UP),
            slice: epaminondasComponent.rules.node.gamePartSlice,
            scoreZero: null, scoreOne: null,
        };
        await expectMoveSuccess('#click_0_8', testElements, expectations);

        expect(epaminondasComponent.getRectFill(0, 7)).toEqual(epaminondasComponent.CAPTURED_FILL);
        expect(epaminondasComponent.getRectFill(0, 8)).toEqual(epaminondasComponent.CAPTURED_FILL);
        expect(epaminondasComponent.getRectFill(0, 9)).toEqual(epaminondasComponent.MOVED_FILL);
        expect(epaminondasComponent.getRectFill(0, 10)).toEqual(epaminondasComponent.MOVED_FILL);
        expect(epaminondasComponent.getRectFill(0, 11)).toEqual(epaminondasComponent.MOVED_FILL);
    }));
    it('should delegate decoding to move', () => {
        spyOn(EpaminondasMove, 'decode').and.callThrough();
        testElements.gameComponent.decodeMove(new EpaminondasMove(11, 0, 2, 1, Direction.UP).encode());
        expect(EpaminondasMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(EpaminondasMove, 'encode').and.callThrough();
        testElements.gameComponent.encodeMove(new EpaminondasMove(11, 0, 2, 1, Direction.UP));
        expect(EpaminondasMove.encode).toHaveBeenCalledTimes(1);
    });
});
