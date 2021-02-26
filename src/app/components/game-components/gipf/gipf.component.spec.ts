import { TestBed, tick, fakeAsync, ComponentFixture } from '@angular/core/testing';

import { GipfComponent } from './gipf.component';
import { INCLUDE_VERBOSE_LINE_IN_TEST, AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { of } from 'rxjs';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { Coord } from 'src/app/jscaip/coord/Coord';
import {
    expectClickFail, expectClickSuccess, expectMoveSuccess,
    MoveExpectations, TestElements } from 'src/app/utils/TestUtils';
import { GipfMove, GipfPlacement } from 'src/app/games/gipf/gipf-move/GipfMove';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';


const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Gipf';
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
xdescribe('GipfComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let testElements: TestElements;

    function getComponent(): GipfComponent {
        return testElements.gameComponent as GipfComponent;
    }

    beforeEach(fakeAsync(async() => {
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
        const gameComponent: GipfComponent = wrapper.gameComponent as GipfComponent;
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
        expect(testElements.gameComponent).toBeTruthy('GipfComponent should be created');
    });
    it('should allow placement directly resulting in a move if there is no initial capture', fakeAsync(async() => {
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(-3, 1), MGPOptional.empty()), [], []);
        const expectation: MoveExpectations = {
            move,
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null,
            scoreOne: null,
        };
        await expectMoveSuccess('#click_-3_1', testElements, expectation);
    }));
    it('should not accept selecting a non-border coord for placement', fakeAsync(async() => {
        await expectClickFail('#click_0_0', testElements,
                              'Les pièces doivent être placée sur une case du bord du plateau');
    }));
    it('should show possible directions after selecting an occupied placement coord', fakeAsync(async() => {
        await expectClickSuccess('#click_3_0', testElements);
        expect(getComponent().getHighlightStyle(2, 0)) .toEqual(getComponent().CLICKABLE_HIGHLIGHT_STYLE);
        expect(getComponent().getHighlightStyle(2, 1)).toEqual(getComponent().CLICKABLE_HIGHLIGHT_STYLE);
        expect(getComponent().getHighlightStyle(3, -1)).toEqual(getComponent().CLICKABLE_HIGHLIGHT_STYLE);
    }));
    it('should not accept selecting something else than one of the proposed direction', fakeAsync(async() => {
        await expectClickSuccess('#click_3_0', testElements);
        await expectClickFail('#click_0_0', testElements,
                              'Veuillez sélectionner une destination à une distance de 1 de l\'entrée');
    }));
    it('should cancel move when clicking on anything else than a capture if there is one in the initial captures', fakeAsync(async() => {
        // TODO: setup initial board with an initial capture
        // TODO: 
    }));
    it('should capture upon selection of a capture', fakeAsync(async() => {
        // TODO
    }));
    it('should accept placing after performing initial captures', fakeAsync(async() => {
        // TODO
    }));
    it('should not allow clicking on anything else than a capture if there is one in the final captures', fakeAsync(async() => {
    }));
    it('should perform move after final captures has been done', fakeAsync(async() => {
        // TODO
    }));
    it('should update the number of pieces available upon placement', fakeAsync(async() => {
        // TODO
    }));
    it('should update the number of pieces available upon capture', fakeAsync(async() => {
        // TODO
    }));

});
