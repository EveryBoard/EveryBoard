import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { MinimaxTestingComponent } from './minimax-testing.component';
import { MinimaxTestingMove } from 'src/app/games/minimax-testing/minimaxtestingmove/MinimaxTestingMove';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from 'src/app/app.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { of } from 'rxjs';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'MinimaxTesting';
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
describe('MinimaxTestingComponent', () => {
    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let gameComponent: MinimaxTestingComponent;

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
        tick(1);
        gameComponent = wrapper.gameComponent as MinimaxTestingComponent;
    }));
    it('should create', () => {
        expect(gameComponent).toBeTruthy();
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(MinimaxTestingMove, 'decode').and.callThrough();
        gameComponent.decodeMove(1);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(MinimaxTestingMove, 'encode').and.callThrough();
        gameComponent.encodeMove(MinimaxTestingMove.DOWN);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should allow simple moves', async () => {
        expect((await gameComponent.chooseDown()).isSuccess()).toBeTrue();
        expect((await gameComponent.chooseRight()).isSuccess()).toBeTrue();
    });
});
