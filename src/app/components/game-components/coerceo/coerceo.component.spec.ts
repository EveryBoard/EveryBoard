import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { AppModule } from 'src/app/app.module';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { CoerceoComponent } from './coerceo.component';
import {
    expectClickFail, expectClickSuccess, expectElementNotToExist, expectElementToExist, expectMoveFailure,
    expectMoveSuccess, MoveExpectations, TestElements } from 'src/app/utils/TestUtils';
import { CoerceoMove } from 'src/app/games/coerceo/coerceo-move/CoerceoMove';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { CoerceoFailure } from 'src/app/games/coerceo/CoerceoFailure';
import { CoerceoPartSlice } from 'src/app/games/coerceo/coerceo-part-slice/CoerceoPartSlice';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Coerceo';
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
describe('CoerceoComponent:', () => {

    let wrapper: LocalGameWrapperComponent;

    let testElements: TestElements;

    function getMoveExpectation(move: CoerceoMove): MoveExpectations {
        return {
            move,
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: testElements.gameComponent.rules.node.gamePartSlice['captures'][0],
            scoreOne: testElements.gameComponent.rules.node.gamePartSlice['captures'][1],
        };
    }
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
        const gameComponent: CoerceoComponent = wrapper.gameComponent as CoerceoComponent;
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
        expect(testElements.gameComponent).toBeTruthy('CoerceoComponent should be created');
    });
    it('Should accept tiles exchange proposal as first click', fakeAsync(async() => {
        const move: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(6, 9));
        const expectations: MoveExpectations = getMoveExpectation(move);
        const reason: string = CoerceoFailure.NOT_ENOUGH_TILES_TO_EXCHANGE;
        await expectMoveFailure('#click_6_9', testElements, expectations, reason);
    }));
    it('Should show possibles destination after choosing your own piece', fakeAsync(async() => {
        await expectClickSuccess('#click_6_2', testElements);
        const component: CoerceoComponent = testElements.gameComponent as CoerceoComponent;
        expect(component.highlights).toContain(new Coord(7, 1));
        expect(component.highlights).toContain(new Coord(7, 3));
        expect(component.highlights).toContain(new Coord(5, 3));
        expect(component.highlights).toContain(new Coord(4, 2));
    }));
    it('Should accept deplacement', fakeAsync(async() => {
        await expectClickSuccess('#click_6_2', testElements);
        const move: CoerceoMove = CoerceoMove.fromCoordToCoord(new Coord(6, 2), new Coord(7, 3));
        const expectations: MoveExpectations = getMoveExpectation(move);
        await expectMoveSuccess('#click_7_3', testElements, expectations);
    }));
    it('Should cancelMoveAttempt without toasting when re-clicking on selected piece', fakeAsync(async() => {
        await expectClickSuccess('#click_6_2', testElements);
        await expectClickSuccess('#click_6_2', testElements);
        const component: CoerceoComponent = testElements.gameComponent as CoerceoComponent;
        expect(component.highlights).toEqual([]);
    }));
    it('Should cancelMove when first click is on empty case', fakeAsync(async() => {
        await expectClickFail('#click_5_5', testElements, CoerceoFailure.FIRST_CLICK_SHOULD_NOT_BE_NULL);
    }));
    it('Should refuse invalid deplacement', fakeAsync(async() => {
        await expectClickSuccess('#click_6_2', testElements);
        const reason: string = CoerceoFailure.INVALID_DISTANCE;
        await expectClickFail('#click_8_4', testElements, reason);
    }));
    it('Should show tile when more than zero', fakeAsync(async() => {
        const board: NumberTable = CoerceoPartSlice.getInitialSlice().getCopiedBoard();
        const state: CoerceoPartSlice = new CoerceoPartSlice(board, 0, [1, 0], [0, 0]);
        testElements.gameComponent.rules.node = new MGPNode(null, null, state, 0);
        expectElementNotToExist('#playerZeroTilesCount', testElements);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();
        expectElementToExist('#playerZeroTilesCount', testElements);
    }));
    it('Should show removed tiles, and captured piece', fakeAsync(async() => {
        const previousBoard: NumberTable = []
    }));
    describe('encode/decode', () => {
        it('should delegate decoding to move', () => {
            const moveSpy: jasmine.Spy = spyOn(CoerceoMove, 'decode').and.callThrough();
            testElements.gameComponent.decodeMove(5);
            expect(moveSpy).toHaveBeenCalledTimes(1);
        });
        it('should delegate encoding to move', () => {
            const moveSpy: jasmine.Spy = spyOn(CoerceoMove, 'encode').and.callThrough();
            testElements.gameComponent.encodeMove(CoerceoMove.fromTilesExchange(new Coord(1, 1)));
            expect(moveSpy).toHaveBeenCalledTimes(1);
        });
    });
});
