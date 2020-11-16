import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { KamisadoComponent } from './kamisado.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { KamisadoMove } from 'src/app/games/kamisado/kamisadomove/KamisadoMove';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "Kamisado"
            },
        },
    },
}
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null}),

    getAuthenticatedUser: () => { return { pseudo: null, verified: null}; },
};
describe('KamisadoComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let gameComponent: KamisadoComponent;

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
        gameComponent = wrapper.gameComponent as KamisadoComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy("Wrapper should be created");
        expect(gameComponent).toBeTruthy("KamisadoComponent should be created");
    });
    it('should not allow to pass initially', async () => {
        expect(await gameComponent.pass()).toBeFalsy();
    });
    it('should allow to pass if stuck position', async () => {
        expect(await gameComponent.onClick(0, 7)).toBeTruthy(); // select brown piece
        expect(await gameComponent.pass()).toBeFalsy(); // can't pass now
        expect(await gameComponent.onClick(0, 1)).toBeTruthy(); // move it on the red
        expect(await gameComponent.onClick(5, 2)).toBeTruthy(); // move the red on the brown
        // brown is now stuck
        expect(gameComponent.canPass).toBeTruthy();
        expect(await gameComponent.pass()).toBeTruthy();
    });
    it('should disallow moving to invalid location', async () => {
        expect(await gameComponent.onClick(0, 7)).toBeTruthy();
        expect(await gameComponent.onClick(5, 4)).toBeFalsy();
    });
    it('should disallow choosing an incorrect piece', async () => {
        expect(await gameComponent.onClick(0, 0)).toBeFalsy();
    });
    it('should disallow choosing a piece at end of the game', async () => {
        expect(await gameComponent.onClick(0, 7)).toBeTruthy(); // select brown piece
        expect(await gameComponent.onClick(0, 1)).toBeTruthy(); // move it to the red
        expect(await gameComponent.onClick(4, 1)).toBeTruthy(); // move it to the blue
        expect(await gameComponent.onClick(7, 6)).toBeTruthy(); // move it to the red
        expect(await gameComponent.onClick(4, 2)).toBeTruthy(); // move it to the purple
        expect(await gameComponent.onClick(5, 0)).toBeTruthy(); // move it to the winning position
        expect(await gameComponent.onClick(2, 0)).toBeFalsy();
        expect(gameComponent.choosePiece(2, 0)).toBeFalsy(); // can't select a piece either
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(KamisadoMove, "decode").and.callThrough();
        gameComponent.decodeMove(5);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(KamisadoMove, "encode").and.callThrough();
        gameComponent.encodeMove(KamisadoMove.of(new Coord(0, 7), new Coord(0, 6)));
        expect(KamisadoMove.encode).toHaveBeenCalledTimes(1);
    });
});
