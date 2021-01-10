import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GoComponent } from './go.component';

import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule, INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { GoMove } from 'src/app/games/go/gomove/GoMove';
import { By } from '@angular/platform-browser';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "Go"
            },
        },
    },
}
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null}),

    getAuthenticatedUser: () => { return { pseudo: null, verified: null}; },
};
describe('GoComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let debugElement: DebugElement;

    let gameComponent: GoComponent;

    let clickElement: (elementName: string) => Promise<boolean> = async(elementName: string) => {
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
        GoComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || GoComponent.VERBOSE;
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
        debugElement = fixture.debugElement;
        tick(1);
        gameComponent = wrapper.gameComponent as GoComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy("Wrapper should be created");
        expect(gameComponent).toBeTruthy("GoComponent should be created");
    });
    it('should allow to pass twice, then use "pass" as the method to "accept"', async() => {
        expect((await gameComponent.pass()).isSuccess()).toBeTrue(); // Passed
        expect((await gameComponent.pass()).isSuccess()).toBeTrue(); // Counting
        expect((await gameComponent.pass()).isSuccess()).toBeTrue(); // Accept

        expect((await gameComponent.pass()).isSuccess()).toBeTrue(); // Finished

        expect((await gameComponent.pass()).isSuccess()).toBeFalse();
    });
    it('Should allow simple clicks', fakeAsync(async() => {
        expect(await clickElement("#click_1_1")).toBeTrue();
        expect(await clickElement("#click_2_2")).toBeTrue();
    }));
    it('should delegate decoding to move', () => {
        spyOn(GoMove, "decode").and.callThrough();
        gameComponent.decodeMove(5);
        expect(GoMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(GoMove, "encode").and.callThrough();
        gameComponent.encodeMove(new GoMove(1, 1));
        expect(GoMove.encode).toHaveBeenCalledTimes(1);
    });
});
