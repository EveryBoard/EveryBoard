import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { LocalGameWrapperComponent } from './local-game-wrapper.component';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule, INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { MoveX } from 'src/app/jscaip/MoveX';
import { P4PartSlice } from 'src/app/games/p4/P4PartSlice';
import { UserService } from 'src/app/services/user/UserService';
import { By } from '@angular/platform-browser';
import { Player } from 'src/app/jscaip/Player';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "P4"
            },
        },
    },
}
class AuthenticationServiceMock {

    public static USER: { pseudo: string, verified: boolean } = { pseudo: null, verified: null};

    public getJoueurObs(): Observable<{ pseudo: string, verified: boolean }> {
        return of(AuthenticationServiceMock.USER);
    }
    public getAuthenticatedUser(): { pseudo: string, verified: boolean } {
        return AuthenticationServiceMock.USER;
    }
};
describe('LocalGameWrapperComponent', () => {

    let component: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let debugElement: DebugElement;

    beforeAll(() => {
        LocalGameWrapperComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || LocalGameWrapperComponent.VERBOSE;
    });
    beforeEach(async(async() => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            providers: [
                { provide: ActivatedRoute,        useValue: activatedRouteStub },
                { provide: JoueursDAO,            useClass: JoueursDAOMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: UserService,           useValue: {}},
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        debugElement = fixture.debugElement;
        component = fixture.debugElement.componentInstance;
    }));
    it('should create', async(() => {
        AuthenticationServiceMock.USER = { pseudo: null, verified: null };
        expect(component).toBeTruthy();
        const ngAfterViewInit = spyOn(component, "ngAfterViewInit").and.callThrough();
        expect(ngAfterViewInit).not.toHaveBeenCalled();

        fixture.detectChanges();

        expect(ngAfterViewInit).toHaveBeenCalledTimes(1);
    }));
    it('should have game included after view init', fakeAsync(() => {
        AuthenticationServiceMock.USER = { pseudo: null, verified: null };
        const compiled = fixture.debugElement.nativeElement;
        const gameIncluderTag = compiled.querySelector("app-game-includer");
        let p4Tag = compiled.querySelector("app-p4");
        expect(gameIncluderTag).toBeTruthy("app-game-includer tag should be present at start");
        expect(p4Tag).toBeFalsy("app-p4 tag should be absent at start");
        expect(component.gameComponent).toBeUndefined("gameComponent should not be loaded before the timeout int afterViewInit resolve");

        fixture.detectChanges();
        tick(1);

        p4Tag = compiled.querySelector("app-p4");
        expect(component.gameIncluder).toBeTruthy("gameIncluder should exist after view init");
        expect(p4Tag).toBeTruthy("app-p4 tag should be present after view init");
        expect(component.gameComponent).toBeTruthy("gameComponent should be present once component view init");
    }));
    it('connected user should be able to play', fakeAsync(async() => {
        AuthenticationServiceMock.USER = { pseudo: "Connecté", verified: true };

        fixture.detectChanges();
        tick(1);

        const slice: P4PartSlice = component.gameComponent.rules.node.gamePartSlice;
        const legality: boolean = await component.gameComponent.chooseMove(MoveX.get(4), slice, null, null);
        expect(legality).toBeTruthy("Connected user should be able to play");
    }));
    it('should allow to go back one move', fakeAsync(async() => {
        AuthenticationServiceMock.USER = { pseudo: "Connecté", verified: true };
        fixture.detectChanges();
        tick(1);
        const slice: P4PartSlice = component.gameComponent.rules.node.gamePartSlice;
        expect(slice.turn).toBe(0);
        const legality: boolean = await component.gameComponent.chooseMove(MoveX.get(4), slice, null, null);
        expect(legality).toBeTruthy("Move 0 should be legal");
        await fixture.whenStable(); fixture.detectChanges();
        expect(component.gameComponent.rules.node.gamePartSlice.turn).toBe(1);

        spyOn(component.gameComponent, 'updateBoard').and.callThrough();
        const takeBackElement: DebugElement = debugElement.query(By.css('#takeBack'));
        expect(takeBackElement).toBeTruthy("TakeBackElement should exist");
        takeBackElement.triggerEventHandler('click', null);
        await fixture.whenStable(); fixture.detectChanges();

        expect(component.gameComponent.rules.node.gamePartSlice.turn).toBe(0);
        expect(component.gameComponent.updateBoard).toHaveBeenCalledTimes(1);
    }));
});