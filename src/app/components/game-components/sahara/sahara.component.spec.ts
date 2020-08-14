import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SaharaComponent } from './sahara.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule, INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { SaharaMove } from 'src/app/games/sahara/saharamove/SaharaMove';
import { Coord } from 'src/app/jscaip/coord/Coord';

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

    let gameComponent: SaharaComponent;

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
    it('Should play correctly shortest victory', () => {
        expect(gameComponent.onClick(0, 3)).toBeTruthy();
        expect(gameComponent.onClick(1, 4)).toBeTruthy("First move should be legal");
        expect(gameComponent.onClick(3, 0)).toBeTruthy();
        expect(gameComponent.onClick(4, 0)).toBeTruthy("Second move should be legal");
        expect(gameComponent.onClick(1, 4)).toBeTruthy();
        expect(gameComponent.onClick(2, 4)).toBeTruthy("Third move should be legal");
    });
});