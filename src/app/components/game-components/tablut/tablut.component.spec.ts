import { TestBed, tick, fakeAsync } from '@angular/core/testing';

import { TablutComponent } from './tablut.component';
import { INCLUDE_VERBOSE_LINE_IN_TEST, AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { of } from 'rxjs';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { TablutMove } from 'src/app/games/tablut/tablut-move/TablutMove';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { TablutCase } from 'src/app/games/tablut/tablut-rules/TablutCase';
import { expectClickFail, expectClickSuccess, TestElements } from 'src/app/utils/TestUtils';


const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Tablut';
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
fdescribe('TablutComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let testElements: TestElements;

    beforeAll(() => {
        TablutComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || TablutComponent.VERBOSE;
    });
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
        const fixture = TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        const debugElement = fixture.debugElement;
        tick(1);
        const gameComponent = wrapper.gameComponent as TablutComponent;
        const cancelSpy: jasmine.Spy = spyOn(gameComponent, 'cancelMove');
        testElements = { fixture, debugElement, gameComponent, cancelSpy };
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(testElements.gameComponent).toBeTruthy('TablutComponent should be created');
    });
    it('Should cancel move when clicking on opponent piece', fakeAsync( async() => {
        await expectClickFail('#click_4_4', testElements, 'Cette pièce ne vous appartient pas.DULULU');
    }));
    fit('Should cancel move when first click on empty case', fakeAsync( async() => {
        const message: string = 'Pour votre premier clic, choisissez une de vos pièces.';
        await expectClickFail('#click_4_0', testElements, message);
    }));
    it('Should allow simple move', async () => {
        await expectClickSuccess('#click_4_1', testElements);
        await expectClickSuccess('#click_0_1', testElements);
        const clickedMove: TablutMove = new TablutMove(new Coord(4, 1), new Coord(0, 1));
        expect(testElements.gameComponent.rules.node.move).toEqual(clickedMove);
    });
    it('Diagonal move attempt should not throw', async () => {
        await expectClickSuccess('#click_3_0', testElements);
        let threw = false;
        try {
            const message: string = 'AH DONNE AAAAH.';
            await expectClickFail('#click_4_1', testElements, message);
        } catch (error) {
            threw = true;
        } finally {
            expect(threw).toBeFalse();
        }
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(TablutMove, 'decode').and.callThrough();
        testElements.gameComponent.decodeMove(1);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(TablutMove, 'encode').and.callThrough();
        testElements.gameComponent.encodeMove(new TablutMove(new Coord(1, 1), new Coord(2, 1)));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});
