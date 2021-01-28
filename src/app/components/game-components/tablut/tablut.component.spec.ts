import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

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
import { TablutMove } from 'src/app/games/tablut/tablutmove/TablutMove';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { MGPValidation } from 'src/app/collectionlib/mgpvalidation/MGPValidation';
import { TablutCase } from 'src/app/games/tablut/tablutrules/TablutCase';
import { By } from '@angular/platform-browser';

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
describe('TablutComponent', () => {
    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let debugElement: DebugElement;

    let gameComponent: TablutComponent;

    const _: number = TablutCase.UNOCCUPIED.value;
    const O: number = TablutCase.INVADERS.value;
    const X: number = TablutCase.DEFENDERS.value;
    const M: number = TablutCase.PLAYER_ZERO_KING.value;

    const clickElement: (elementName: string) => Promise<boolean> = async (elementName: string) => {
        const element: DebugElement = debugElement.query(By.css(elementName));
        if (element == null) {
            return null;
        } else {
            element.triggerEventHandler('click', null);
            await fixture.whenStable();
            fixture.detectChanges();
            return true; // TODO: would be nice to return wether or not cancelMove has been called for illegal/invalid move reason
        }
    };
    beforeAll(() => {
        TablutComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || TablutComponent.VERBOSE;
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
        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        debugElement = fixture.debugElement;
        tick(1);
        gameComponent = wrapper.gameComponent as TablutComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(gameComponent).toBeTruthy('TablutComponent should be created');
    });
    it('Should cancel move when clicking on opponent piece', fakeAsync( async() => {
        spyOn(gameComponent, 'cancelMove').and.callThrough();
        expect(await clickElement('#click_4_4')).toBeTrue();
        expect(gameComponent.cancelMove).toHaveBeenCalledOnceWith('Cette pièce ne vous appartient pas.');
    }));
    it('Should cancel move when first click on empty case', fakeAsync( async() => {
        spyOn(gameComponent, 'cancelMove').and.callThrough();
        expect(await clickElement('#click_0_0')).toBeTrue();
        const message: string = 'Pour votre premier clic, choisissez une de vos pièces.';
        expect(gameComponent.cancelMove).toHaveBeenCalledOnceWith(message);
    }));
    it('Should allow simple move', async () => {
        const isOccupied: MGPValidation = await gameComponent.onClick(4, 1);
        const isLegal: MGPValidation = await gameComponent.onClick(0, 1);
        expect(isOccupied.isSuccess()).toBeTrue();
        expect(isLegal.isSuccess()).toBeTrue();
    });
    it('Diagonal move attempt should not throw', async () => {
        expect((await gameComponent.onClick(3, 0)).isSuccess()).toBeTrue();
        let threw = false;
        try {
            const diagonalMoveIsLegal: MGPValidation = await gameComponent.onClick(4, 1);
            expect(diagonalMoveIsLegal.isSuccess()).toBeFalse();
        } catch (error) {
            threw = true;
        } finally {
            expect(threw).toBeFalse();
        }
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(TablutMove, 'decode').and.callThrough();
        gameComponent.decodeMove(1);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(TablutMove, 'encode').and.callThrough();
        gameComponent.encodeMove(new TablutMove(new Coord(1, 1), new Coord(2, 1)));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});
