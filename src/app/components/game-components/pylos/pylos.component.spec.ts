import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { PylosComponent } from './pylos.component';
import { PylosMove } from 'src/app/games/pylos/pylos-move/PylosMove';
import { PylosCoord } from 'src/app/games/pylos/pylos-coord/PylosCoord';
import { PylosPartSlice } from 'src/app/games/pylos/pylos-part-slice/PylosPartSlice';
import { Player } from 'src/app/jscaip/player/Player';
import { PylosNode } from 'src/app/games/pylos/pylos-rules/PylosRules';
import {
    expectClickFail, expectClickSuccess, expectMoveSubmission,
    MoveExpectations, TestElements } from 'src/app/utils/TestUtils';

const activatedRouteStub: unknown = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Pylos';
            },
        },
    },
};
const authenticationServiceStub: unknown = {

    getJoueurObs: () => of({ pseudo: null, verified: null }),

    getAuthenticatedUser: () => {
        return { pseudo: null, verified: null };
    },
};
describe('PylosComponent', () => {
    let wrapper: LocalGameWrapperComponent;

    let testElements: TestElements;

    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

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
        const gameComponent: PylosComponent = wrapper.gameComponent as PylosComponent;
        const cancelSpy: jasmine.Spy = spyOn(gameComponent, 'cancelMove').and.callThrough();
        const chooseMoveSpy: jasmine.Spy = spyOn(gameComponent, 'chooseMove').and.callThrough();
        testElements = { fixture, debugElement, gameComponent, cancelSpy, chooseMoveSpy };
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(testElements.gameComponent).toBeTruthy('PylosComponent should be created');
    });
    it('should allow droping piece on occupable case', fakeAsync(async() => {
        const expectations: MoveExpectations = {
            move: PylosMove.fromDrop(new PylosCoord(0, 0, 0), []),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null,
            scoreOne: null,
        };
        await expectMoveSubmission('#click_0_0_0', testElements, expectations);
    }));
    it('should forbid clicking on ennemy piece', fakeAsync(async() => {
        const initialBoard: number[][][] = [
            [
                [X, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        testElements.gameComponent.rules.node = new PylosNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();

        await expectClickFail('#click_0_0_0', testElements, 'Can\'t click on ennemy pieces.');
    }));
    it('should allow climbing', fakeAsync(async() => {
        const initialBoard: number[][][] = [
            [
                [O, X, _, _],
                [X, O, _, _],
                [_, _, _, _],
                [_, _, _, O],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        testElements.gameComponent.rules.node = new PylosNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();

        await expectClickSuccess('#click_3_3_0', testElements);
        const expectations: MoveExpectations = {
            move: PylosMove.fromClimb(new PylosCoord(3, 3, 0), new PylosCoord(0, 0, 1), []),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null,
            scoreOne: null,
        };
        await expectMoveSubmission('#click_0_0_1', testElements, expectations);
    }));
    it('should allow capturing unique piece by double clicking on it', fakeAsync(async() => {
        const initialBoard: number[][][] = [
            [
                [O, O, _, _],
                [O, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        testElements.gameComponent.rules.node = new PylosNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();

        await expectClickSuccess('#click_1_1_0', testElements);
        await expectClickSuccess('#click_0_0_0', testElements);
        const expectations: MoveExpectations = {
            move: PylosMove.fromDrop(new PylosCoord(1, 1, 0), [new PylosCoord(0, 0, 0)]),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null,
            scoreOne: null,
        };
        await expectMoveSubmission('#click_0_0_0', testElements, expectations);
    }));
    it('should allow captured two pieces, and show capture during move and after', fakeAsync(async() => {
        const initialBoard: number[][][] = [
            [
                [O, O, _, _],
                [O, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        testElements.gameComponent.rules.node = new PylosNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();

        await expectClickSuccess('#click_1_1_0', testElements);
        await expectClickSuccess('#click_0_0_0', testElements);
        const pylosGameComponent: PylosComponent = testElements.gameComponent as PylosComponent;
        expect(pylosGameComponent.getCaseFill(0, 0, 0)).toEqual(pylosGameComponent.PRE_CAPTURED_FILL);
        const captures: PylosCoord[] = [new PylosCoord(0, 0, 0), new PylosCoord(0, 1, 0)];
        const expectations: MoveExpectations = {
            move: PylosMove.fromDrop(new PylosCoord(1, 1, 0), captures),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null,
            scoreOne: null,
        };
        await expectMoveSubmission('#click_0_1_0', testElements, expectations);
        expect(pylosGameComponent.getCaseFill(1, 1, 0)).toEqual(pylosGameComponent.MOVED_FILL);
        expect(pylosGameComponent.getCaseFill(0, 0, 0)).toEqual(pylosGameComponent.CAPTURED_FILL);
        expect(pylosGameComponent.getCaseFill(0, 1, 0)).toEqual(pylosGameComponent.CAPTURED_FILL);
    }));
    it('should forbid piece to land lower than they started', fakeAsync(async() => {
        const initialBoard: number[][][] = [
            [
                [O, X, _, _],
                [X, O, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [O, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        testElements.gameComponent.rules.node = new PylosNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();

        await expectClickSuccess('#click_0_0_1', testElements);
        await expectClickFail('#click_2_2_0', testElements, 'Must move pieces upward.');
    }));
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(PylosMove, 'decode').and.callThrough();
        testElements.gameComponent.decodeMove(0);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(PylosMove, 'encode').and.callThrough();
        testElements.gameComponent.encodeMove(PylosMove.fromDrop(new PylosCoord(0, 0, 0), []));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});
