import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { of } from 'rxjs';

import { SaharaComponent } from './sahara.component';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { AppModule, INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { SaharaMove } from 'src/app/games/sahara/saharamove/SaharaMove';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "Sahara"
            },
        },
    },
}
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null}),

    getAuthenticatedUser: () => { return { pseudo: null, verified: null}; },
};
describe('SaharaComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let debugElement: DebugElement;

    let gameComponent: SaharaComponent;

    let clickElement: (elementName: string) => Promise<boolean> = async(elementName: string) => {
        const element: DebugElement = debugElement.query(By.css(elementName));
        if (element != null) {
            element.triggerEventHandler('click', null);
            await fixture.whenStable();
            fixture.detectChanges();
            return true;
        } else {
            return false;
        }
    };
    let onClick: (x: number, y: number) => Promise<boolean> = async(x: number, y: number) => {
        return clickElement('#click_' + x + '_' + y);
    };
    beforeAll(() => {
        SaharaComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || SaharaComponent.VERBOSE;
    });
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            providers: [
                { provide: ActivatedRoute,        useValue: activatedRouteStub },
                { provide: JoueursDAO,            useClass: JoueursDAOMock },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        debugElement = fixture.debugElement;
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        tick(1);
        gameComponent = wrapper.gameComponent as SaharaComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy("Wrapper should be created");
        expect(gameComponent).toBeTruthy("SaharaComponent should be created");
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(SaharaMove, "decode").and.callThrough();
        gameComponent.decodeMove(1);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(SaharaMove, "encode").and.callThrough();
        gameComponent.encodeMove(new SaharaMove(new Coord(1, 1), new Coord(2, 1)));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('Should play correctly shortest victory', fakeAsync(async() => {
        expect(await onClick(0, 3)).toBeTruthy();
        expect(await onClick(1, 4)).toBeTruthy("First move should be legal");
        expect(await onClick(3, 0)).toBeTruthy();
        expect(await onClick(4, 0)).toBeTruthy("Second move should be legal");
        expect(await onClick(1, 4)).toBeTruthy();
        expect(await onClick(2, 4)).toBeTruthy("Third move should be legal");
        fixture.detectChanges();
        expect(wrapper.endGame).toBeTruthy("Game should be over");
    }));
    it('should not allow to click on empty case when no pyramid selected', fakeAsync(async() => {
        expect(gameComponent.chosenCoord).toEqual(new Coord(-2, -2));
        spyOn(gameComponent, 'cancelMove').and.callThrough();
        await onClick(2, 2);
        expect(gameComponent.chosenCoord).toEqual(new Coord(-2, -2));
        expect(gameComponent.cancelMove).toHaveBeenCalledWith("You must first select a pyramid.");
    }));
    it('should not allow to select ennemy pyramid', fakeAsync(async() => {
        spyOn(gameComponent, 'cancelMove').and.callThrough();
        await onClick(0, 4);
        expect(gameComponent.cancelMove).toHaveBeenCalledWith("You cannot select ennemy pyramid.");
    }));
    it('should not allow to select ennemy pyramid', fakeAsync(async() => {
        await onClick(0, 3);
        spyOn(gameComponent, 'cancelMove').and.callThrough();
        await onClick(0, 4);
        expect(gameComponent.cancelMove).toHaveBeenCalledWith("You can't land your pyramid on the ennemy's.");
    }));
    it('should not allow to bounce on occupied brown case', fakeAsync(async() => {
        await onClick(7, 0);
        spyOn(gameComponent, 'cancelMove').and.callThrough();
        await onClick(8, 1);
        expect(gameComponent.cancelMove).toHaveBeenCalledWith("You can only bounce on UNOCCUPIED brown case.");
    }));
    it('should not allow to do invalid moves', fakeAsync(async() => {
        await onClick(0, 3);
        spyOn(gameComponent, 'cancelMove').and.callThrough();
        await onClick(2, 2);
        expect(gameComponent.cancelMove).toHaveBeenCalledWith("Maximal |x| + |y| distance for SaharaMove is 2, got 3.");
    }));
});