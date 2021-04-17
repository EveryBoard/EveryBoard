import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { P4PartSlice } from 'src/app/games/p4/P4PartSlice';
import { UserService } from 'src/app/services/user/UserService';
import { By } from '@angular/platform-browser';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { P4Move } from 'src/app/games/p4/P4Move';

const activatedRouteStub: unknown = {
    snapshot: {
        paramMap: {
            get: () => {
                return 'P4';
            },
        },
    },
};
class AuthenticationServiceMock {
    public static USER: { pseudo: string, verified: boolean } = { pseudo: null, verified: null };

    public getJoueurObs(): Observable<{ pseudo: string, verified: boolean }> {
        return of(AuthenticationServiceMock.USER);
    }
    public getAuthenticatedUser(): { pseudo: string, verified: boolean } {
        return AuthenticationServiceMock.USER;
    }
}
describe('LocalGameWrapperComponent', () => {
    let component: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let debugElement: DebugElement;

    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;
    const _: number = Player.NONE.value;

    const clickElement: (elementName: string) => Promise<boolean> = async(elementName: string) => {
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
    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: JoueursDAO, useClass: JoueursDAOMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: UserService, useValue: {} },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        debugElement = fixture.debugElement;
        component = fixture.debugElement.componentInstance;
        AuthenticationServiceMock.USER = { pseudo: 'Connecté', verified: true };
        fixture.detectChanges();
        tick(1);
    }));
    it('should create', () => {
        AuthenticationServiceMock.USER = { pseudo: null, verified: null };
        expect(component).toBeTruthy();
    });
    it('should have game included after view init', fakeAsync(() => {
        AuthenticationServiceMock.USER = { pseudo: null, verified: null };
        const gameIncluderTag: DebugElement = fixture.debugElement.nativeElement.querySelector('app-game-includer');
        let p4Tag: DebugElement = fixture.debugElement.nativeElement.querySelector('app-p4');
        expect(gameIncluderTag).toBeTruthy('app-game-includer tag should be present at start');

        p4Tag = fixture.debugElement.nativeElement.querySelector('app-p4');
        expect(component.gameIncluder).toBeTruthy('gameIncluder should exist after view init');
        expect(p4Tag).toBeTruthy('app-p4 tag should be present after view init');
        expect(component.gameComponent).toBeTruthy('gameComponent should be present once component view init');
    }));
    it('connected user should be able to play', fakeAsync(async() => {
        const slice: P4PartSlice = component.gameComponent.rules.node.gamePartSlice;
        const legality: MGPValidation = await component.gameComponent.chooseMove(P4Move.of(4), slice, null, null);
        expect(legality.isSuccess()).toBeTrue();
    }));
    it('should allow to go back one move', fakeAsync(async() => {
        const slice: P4PartSlice = component.gameComponent.rules.node.gamePartSlice;
        expect(slice.turn).toBe(0);
        const legality: MGPValidation = await component.gameComponent.chooseMove(P4Move.of(4), slice, null, null);
        expect(legality.isSuccess()).toBeTrue();
        await fixture.whenStable(); fixture.detectChanges();
        expect(component.gameComponent.rules.node.gamePartSlice.turn).toBe(1);

        spyOn(component.gameComponent, 'updateBoard').and.callThrough();
        const takeBackElement: DebugElement = debugElement.query(By.css('#takeBack'));
        expect(takeBackElement).toBeTruthy('TakeBackElement should exist');
        takeBackElement.triggerEventHandler('click', null);
        await fixture.whenStable(); fixture.detectChanges();

        expect(component.gameComponent.rules.node.gamePartSlice.turn).toBe(0);
        expect(component.gameComponent.updateBoard).toHaveBeenCalledTimes(1);
    }));
    it('should show draw', fakeAsync(async() => {
        const board: number[][] = [
            [X, X, X, _, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
        ];
        const slice: P4PartSlice = new P4PartSlice(board, 0);
        component.gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        const legality: MGPValidation = await component.gameComponent.chooseMove(P4Move.of(3), slice, null, null);
        expect(legality.isSuccess()).toBeTrue();
        component.cdr.detectChanges();
        const drawIndicator: DebugElement = debugElement.query(By.css('#draw'));
        expect(drawIndicator).toBeTruthy('Draw indicator should be present');
    }));
    it('should show score if needed', fakeAsync(async() => {
        expect(await clickElement('#scoreZero')).toBeFalsy();
        expect(await clickElement('#scoreOne')).toBeFalsy();
        component.gameComponent.showScore = true;
        component.gameComponent['scores'] = [0, 0];
        fixture.detectChanges();
        expect(await clickElement('#scoreZero')).toBeTrue();
        expect(await clickElement('#scoreOne')).toBeTrue();
    }));
    it('should allow to restart game at the end', fakeAsync(async() => {
        const board: number[][] = [
            [O, O, O, _, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
        ];
        const slice: P4PartSlice = new P4PartSlice(board, 41);
        component.gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        fixture.detectChanges();
        let restartButton: DebugElement = debugElement.query(By.css('#restartButton'));
        expect(restartButton).toBeFalsy('Restart button should be absent during the game');
        const legality: MGPValidation = await component.gameComponent.chooseMove(P4Move.of(3), slice, null, null);
        expect(legality.isSuccess()).toBeTrue();
        component.cdr.detectChanges();
        restartButton = debugElement.query(By.css('#restartButton'));
        expect(restartButton).toBeTruthy('Restart button should be present after end game');
        await clickElement('#restartButton');
        fixture.detectChanges();
        expect(component.gameComponent.rules.node.gamePartSlice.turn).toBe(0);
        const drawIndicator: DebugElement = debugElement.query(By.css('#draw'));
        expect(drawIndicator).toBeFalsy('Draw indicator should be removed');
    }));
});
