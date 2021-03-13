import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { SaharaComponent } from './sahara.component';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { AppModule, INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { SaharaMove } from 'src/app/games/sahara/sahara-move/SaharaMove';
import {
    expectClickFail, expectClickSuccess, expectMoveFailure,
    expectMoveSuccess, MoveExpectations, TestElements } from 'src/app/utils/TestUtils';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { SaharaPawn } from 'src/app/games/sahara/SaharaPawn';
import { SaharaPartSlice } from 'src/app/games/sahara/SaharaPartSlice';
import { SaharaNode } from 'src/app/games/sahara/sahara-rules/SaharaRules';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Sahara';
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
describe('SaharaComponent', () => {
    const N: number = SaharaPawn.NONE;
    const O: number = SaharaPawn.BLACK;
    const X: number = SaharaPawn.WHITE;
    const _: number = SaharaPawn.EMPTY;

    let wrapper: LocalGameWrapperComponent;

    let testElements: TestElements;

    beforeAll(() => {
        SaharaComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || SaharaComponent.VERBOSE;
    });
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
        const gameComponent: SaharaComponent = wrapper.gameComponent as SaharaComponent;
        const cancelMoveSpy: jasmine.Spy = spyOn(gameComponent, 'cancelMove').and.callThrough();
        const chooseMoveSpy: jasmine.Spy = spyOn(gameComponent, 'chooseMove').and.callThrough();
        const onLegalUserMoveSpy: jasmine.Spy = spyOn(wrapper, 'onLegalUserMove').and.callThrough();
        const canUserPlaySpy: jasmine.Spy = spyOn(gameComponent, 'canUserPlay').and.callThrough();
        testElements = {
            fixture,
            debugElement,
            gameComponent,
            canUserPlaySpy,
            cancelMoveSpy,
            chooseMoveSpy,
            onLegalUserMoveSpy,
        };
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(testElements.gameComponent).toBeTruthy('SaharaComponent should be created');
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(SaharaMove, 'decode').and.callThrough();
        testElements.gameComponent.decodeMove(1);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(SaharaMove, 'encode').and.callThrough();
        testElements.gameComponent.encodeMove(new SaharaMove(new Coord(1, 1), new Coord(2, 1)));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('Should play correctly shortest victory', fakeAsync(async() => {
        const board: NumberTable = [
            [N, N, _, X, _, _, _, O, X, N, N],
            [N, _, O, _, _, _, _, _, _, _, N],
            [X, _, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, X, _, _, N],
            [N, N, X, O, _, _, _, _, O, N, N],
        ];
        const initialSlice: SaharaPartSlice = new SaharaPartSlice(board, 2);
        testElements.gameComponent.rules.node = new SaharaNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_2_1', testElements); // select first piece
        const expectations: MoveExpectations = {
            move: new SaharaMove(new Coord(2, 1), new Coord(1, 2)),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null, scoreOne: null,
        };
        await expectMoveSuccess('#click_1_2', testElements, expectations); // select landing

        expect(wrapper.endGame).toBeTrue();
    }));
    it('should not allow to click on empty case when no pyramid selected', fakeAsync(async() => {
        // given initial board
        // when clicking on empty case, expect move to be refused
        await expectClickFail('#click_2_2', testElements, 'Vous devez d\'abord choisir une de vos pyramides!');
    }));
    it('should not allow to select ennemy pyramid', fakeAsync(async() => {
        // given initial board
        // when clicking on empty case, expect move to be refused
        await expectClickFail('#click_0_4', testElements, 'Vous devez choisir une de vos pyramides!');
    }));
    it('should not allow to land on ennemy pyramid', fakeAsync(async () => {
        // given initial board
        await expectClickSuccess('#click_2_0', testElements);
        const expectations: MoveExpectations = {
            move: new SaharaMove(new Coord(2, 0), new Coord(3, 0)),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null, scoreOne: null,
        };
        await expectMoveFailure('#click_3_0', testElements, expectations, 'Vous devez arriver sur une case vide.');
    }));
    it('should not allow to bounce on occupied brown case', fakeAsync(async() => {
        // given initial board
        await expectClickSuccess('#click_7_0', testElements);
        const expectations: MoveExpectations = {
            move: new SaharaMove(new Coord(7, 0), new Coord(8, 1)),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null, scoreOne: null,
        };
        const reason: string = 'Vous ne pouvez rebondir que sur les cases rouges!';
        await expectMoveFailure('#click_8_1', testElements, expectations, reason);
    }));
    it('should not allow invalid moves', fakeAsync(async() => {
        // given initial board
        await expectClickSuccess('#click_0_3', testElements);
        const reason: string = 'Vous pouvez vous déplacer maximum de 2 cases, pas de 3.';
        await expectClickFail('#click_2_2', testElements, reason);
    }));
});
