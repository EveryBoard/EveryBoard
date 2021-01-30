import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EncapsuleComponent } from './encapsule.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { EncapsuleMove } from 'src/app/games/encapsule/encapsule-move/EncapsuleMove';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { EncapsulePiece, EncapsuleMapper } from 'src/app/games/encapsule/EncapsuleEnums';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Encapsule';
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
describe('EncapsuleComponent', () => {
    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let gameComponent: EncapsuleComponent;

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
        gameComponent = wrapper.gameComponent as EncapsuleComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(gameComponent).toBeTruthy('EncapsuleComponent should be created');
        const playerZeroPieces: string[] = gameComponent.remainingPieces[0];
        const playerOnePieces: string[] = gameComponent.remainingPieces[1];
        expect(playerZeroPieces).toEqual(['BIG_BLACK', 'BIG_BLACK', 'MEDIUM_BLACK', 'MEDIUM_BLACK', 'SMALL_BLACK', 'SMALL_BLACK']);
        expect(playerOnePieces).toEqual(['BIG_WHITE', 'BIG_WHITE', 'MEDIUM_WHITE', 'MEDIUM_WHITE', 'SMALL_WHITE', 'SMALL_WHITE']);
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(EncapsuleMove, 'decode').and.callThrough();
        gameComponent.decodeMove(0);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(EncapsuleMove, 'encode').and.callThrough();
        gameComponent.encodeMove(EncapsuleMove.fromMove(new Coord(1, 1), new Coord(2, 2)));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('Should play correctly shortest victory', async () => {
        const SMALL_BLACK: string = EncapsuleMapper.getNameFromPiece(EncapsulePiece.SMALL_BLACK);
        const MEDIUM_WHITE: string = EncapsuleMapper.getNameFromPiece(EncapsulePiece.MEDIUM_WHITE);
        const SMALL_WHITE: string = EncapsuleMapper.getNameFromPiece(EncapsulePiece.SMALL_WHITE);
        const MEDIUM_BLACK: string = EncapsuleMapper.getNameFromPiece(EncapsulePiece.MEDIUM_BLACK);
        expect((await gameComponent.onPieceClick(SMALL_BLACK)).isSuccess()).toBeTrue();
        expect((await gameComponent.onBoardClick(0, 0)).isSuccess()).toBeTrue();
        expect((await gameComponent.onPieceClick(MEDIUM_WHITE)).isSuccess()).toBeTrue();
        expect((await gameComponent.onBoardClick(1, 0)).isSuccess()).toBeTrue();
        expect((await gameComponent.onPieceClick(SMALL_BLACK)).isSuccess()).toBeTrue();
        expect((await gameComponent.onBoardClick(1, 1)).isSuccess()).toBeTrue();
        expect((await gameComponent.onPieceClick(SMALL_WHITE)).isSuccess()).toBeTrue();
        expect((await gameComponent.onBoardClick(0, 1)).isSuccess()).toBeTrue();
        expect((await gameComponent.onPieceClick(MEDIUM_BLACK)).isSuccess()).toBeTrue();
        expect((await gameComponent.onBoardClick(2, 2)).isSuccess()).toBeTrue();
    });
});
