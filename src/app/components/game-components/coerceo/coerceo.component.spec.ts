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
import { expectClickSuccess, expectMoveFailure, MoveExpectations, TestElements } from 'src/app/utils/TestUtils';
import { CoerceoMove } from 'src/app/games/coerceo/coerceo-move/CoerceoMove';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { CoerceoFailure } from 'src/app/games/coerceo/CoerceoFailure';

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

    function getMoveExpectation(move: CoerceoMove, scoreZero: number, scoreOne: number): MoveExpectations {
        return {
            move,
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero,
            scoreOne,
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
        const expectations: MoveExpectations = getMoveExpectation(move, 0, 0);
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
    it('Should cancelMoveAttempt without toasting when re-clicking on selected piece', fakeAsync(async() => {
        await expectClickSuccess('#click_6_2', testElements);
        await expectClickSuccess('#click_6_2', testElements);
        const component: CoerceoComponent = testElements.gameComponent as CoerceoComponent;
        expect(component.highlights).toEqual([]);
    }));
});
