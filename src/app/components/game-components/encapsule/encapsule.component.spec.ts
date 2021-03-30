import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EncapsuleComponent } from './encapsule.component';

import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { EncapsuleMove } from 'src/app/games/encapsule/encapsule-move/EncapsuleMove';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { EncapsuleCase, EncapsulePartSlice } from 'src/app/games/encapsule/EncapsulePartSlice';
import { EncapsuleNode } from 'src/app/games/encapsule/encapsule-rules/EncapsuleRules';
import { Player } from 'src/app/jscaip/player/Player';
import { TestElements } from 'src/app/utils/TestUtils';

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
fdescribe('EncapsuleComponent', () => {
    const __: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE);
    const P0Turn: number = 6;
    const P1Turn: number = P0Turn+1;

    let wrapper: LocalGameWrapperComponent;
    let testElements: TestElements;

    function getComponent(): EncapsuleComponent {
        return testElements.gameComponent as EncapsuleComponent;
    }
    function setupSlice(slice: EncapsulePartSlice): void {
        testElements.gameComponent.rules.node = new EncapsuleNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();
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
        const fixture: ComponentFixture<LocalGameWrapperComponent> =
            TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        const debugElement: DebugElement = fixture.debugElement;
        tick(1);
        const gameComponent: EncapsuleComponent = wrapper.gameComponent as EncapsuleComponent;
        const cancelMoveSpy: jasmine.Spy = spyOn(gameComponent, 'cancelMove').and.callThrough();
        const chooseMoveSpy: jasmine.Spy = spyOn(gameComponent, 'chooseMove').and.callThrough();
        const onLegalUserMoveSpy: jasmine.Spy = spyOn(wrapper, 'onLegalUserMove').and.callThrough();
        const canUserPlaySpy: jasmine.Spy = spyOn(gameComponent, 'canUserPlay').and.callThrough();
        testElements = {
            fixture,
            debugElement,
            gameComponent,
            canUserPlaySpy,
            cancelMoveSpy,
            chooseMoveSpy,
            onLegalUserMoveSpy,
        };
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(getComponent()).toBeTruthy('EncapsuleComponent should be created');
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(EncapsuleMove, 'decode').and.callThrough();
        getComponent().decodeMove(0);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(EncapsuleMove, 'encode').and.callThrough();
        getComponent().encodeMove(EncapsuleMove.fromMove(new Coord(1, 1), new Coord(2, 2)));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should drop a piece on the board when selecting it and dropping it', () => {
    });
    it('should allow dropping a piece on a smaller one', () => {
    });
    it('should forbid dropping a piece on a bigger one', () => {
    });
    it('should move a piece when clicking on the piece and clicking on its destination coord', () => {
    });
    it('should allow moving a piece on top of a smaller one', () => {
    });
    it('should forbid moving a piece on top of a bigger one', () => {
    });
    it('should detect victory', () => {
    });
/*    it('Should play correctly shortest victory', async() => {
        const SMALL_BLACK: string = EncapsuleMapper.getNameFromPiece(EncapsulePiece.SMALL_BLACK);
        const MEDIUM_WHITE: string = EncapsuleMapper.getNameFromPiece(EncapsulePiece.MEDIUM_WHITE);
        const SMALL_WHITE: string = EncapsuleMapper.getNameFromPiece(EncapsulePiece.SMALL_WHITE);
        const MEDIUM_BLACK: string = EncapsuleMapper.getNameFromPiece(EncapsulePiece.MEDIUM_BLACK);
        expect((await gameComponent.onPieceClick(SMALL_BLACK)).isSuccess()).toBeTrue();
        expect((await gameComponent.onBoardClick(0, 0)).isSuccess()).toBeTrue();
        const playerZeroPieces: string[] = gameComponent.remainingPieces[0];
        const playerOnePieces: string[] = gameComponent.remainingPieces[1];
        expect(playerZeroPieces).toEqual(['BIG_BLACK', 'BIG_BLACK', 'MEDIUM_BLACK', 'MEDIUM_BLACK', 'SMALL_BLACK']);
        expect(playerOnePieces).toEqual(['BIG_WHITE', 'BIG_WHITE', 'MEDIUM_WHITE', 'MEDIUM_WHITE', 'SMALL_WHITE', 'SMALL_WHITE']);
        expect((await gameComponent.onPieceClick(MEDIUM_WHITE)).isSuccess()).toBeTrue();
        expect((await gameComponent.onBoardClick(1, 0)).isSuccess()).toBeTrue();
        expect((await gameComponent.onPieceClick(SMALL_BLACK)).isSuccess()).toBeTrue();
        expect((await gameComponent.onBoardClick(1, 1)).isSuccess()).toBeTrue();
        expect((await gameComponent.onPieceClick(SMALL_WHITE)).isSuccess()).toBeTrue();
        expect((await gameComponent.onBoardClick(0, 1)).isSuccess()).toBeTrue();
        expect((await gameComponent.onPieceClick(MEDIUM_BLACK)).isSuccess()).toBeTrue();
        expect((await gameComponent.onBoardClick(2, 2)).isSuccess()).toBeTrue();
    }); */
});
