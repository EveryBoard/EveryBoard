import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AwaleComponent } from './awale.component';
import { AwaleMove } from 'src/app/games/awale/awalemove/AwaleMove';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from 'src/app/app.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { of } from 'rxjs';
import { MGPNode } from 'src/app/jscaip/mgpnode/MGPNode';
import { AwalePartSlice } from 'src/app/games/awale/AwalePartSlice';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Awale';
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
describe('AwaleComponent', () => {
    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let gameComponent: AwaleComponent;

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
        gameComponent = wrapper.gameComponent as AwaleComponent;
    }));
    it('should create', async () => {
        expect(gameComponent).toBeTruthy();
        expect((await gameComponent.onClick(0, 0)).isSuccess()).toBeTrue();
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(AwaleMove, 'decode').and.callThrough();
        gameComponent.decodeMove(5);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(AwaleMove, 'encode').and.callThrough();
        gameComponent.encodeMove(new AwaleMove(1, 1));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should tell to user he can\'t move empty house', async () => {
        const board: number[][] = [
            [0, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 4],
        ];
        const slice: AwalePartSlice = new AwalePartSlice(board, 0, [0, 0]);
        gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        fixture.detectChanges();
        spyOn(gameComponent, 'message').and.callThrough();
        expect((await gameComponent.onClick(0, 0)).isFailure()).toBeTrue();
        expect(gameComponent.message).toHaveBeenCalledWith('You must choose a non-empty house to distribute.');
    });
});
