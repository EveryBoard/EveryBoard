import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { of, Observable } from 'rxjs';

import { ServerPageComponent } from './server-page.component';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { UserService } from 'src/app/services/user/UserService';
import { GameService } from 'src/app/services/game/GameService';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { PartDAO } from 'src/app/dao/part/PartDAO';
import { PartDAOMock } from 'src/app/dao/part/PartDAOMock';
import { JoinerDAO } from 'src/app/dao/joiner/JoinerDAO';
import { JoinerDAOMock } from 'src/app/dao/joiner/JoinerDAOMock';
import { ChatDAO } from 'src/app/dao/chat/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/chat/ChatDAOMock';

class AuthenticationServiceMock {
    public static CURRENT_USER: {pseudo: string, verified: boolean} = null;

    public static IS_USER_LOGGED: boolean = null;

    public getJoueurObs(): Observable<{pseudo: string, verified: boolean}> {
        if (AuthenticationServiceMock.CURRENT_USER == null) {
            throw new Error('MOCK VALUE CURRENT_USER NOT SET BEFORE USE');
        }
        return of(AuthenticationServiceMock.CURRENT_USER);
    }
    public isUserLogged(): boolean {
        if (AuthenticationServiceMock.IS_USER_LOGGED == null) {
            throw new Error('MOCK VALUE NOT SET BEFORE USE');
        } else {
            return AuthenticationServiceMock.IS_USER_LOGGED;
        }
    }
}
class RouterMock {
    public async navigate(to: string[]): Promise<boolean> {
        return true;
    }
}

describe('ServerPageComponent', () => {
    let component: ServerPageComponent;

    let authenticationService: AuthenticationService;
    let gameService: GameService;
    let userService: UserService;

    let fixture: ComponentFixture<ServerPageComponent>;

    beforeAll(() => {
        ServerPageComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || ServerPageComponent.VERBOSE;
    });
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                MatTabsModule,
                MatSnackBarModule,
                FormsModule,
                RouterTestingModule,
                BrowserAnimationsModule,
            ],
            declarations: [
                ServerPageComponent,
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA,
            ],
            providers: [
                { provide: JoueursDAO, useClass: JoueursDAOMock },
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },

                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: Router, useClass: RouterMock },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(ServerPageComponent);
        component = fixture.componentInstance;
        authenticationService = TestBed.get(AuthenticationService);
        gameService = TestBed.get(GameService);
        userService = TestBed.get(UserService);

        AuthenticationServiceMock.CURRENT_USER = { pseudo: null, verified: null };
        AuthenticationServiceMock.IS_USER_LOGGED = null;
    });
    it('1. should create', fakeAsync(async () => {
        expect(component).toBeTruthy();

        component.ngOnInit();

        expect(component['userNameSub']).toBeDefined(); // This is inspecting a private field (TODO: clean)
        flush();
    }));
    it('2. should subscribe to three observable on init', fakeAsync(async () => {
        AuthenticationServiceMock.CURRENT_USER = { pseudo: 'Pseudo', verified: true };
        expect(component.userName).toBeUndefined();
        spyOn(authenticationService, 'getJoueurObs').and.callThrough();
        spyOn(gameService, 'getActivesPartsObs').and.callThrough();
        spyOn(userService, 'getActivesUsersObs').and.callThrough();

        expect(authenticationService.getJoueurObs).not.toHaveBeenCalled();
        expect(gameService.getActivesPartsObs).not.toHaveBeenCalled();
        expect(userService.getActivesUsersObs).not.toHaveBeenCalled();

        component.ngOnInit();

        expect(component.userName).toBe('Pseudo');
        expect(authenticationService.getJoueurObs).toHaveBeenCalledTimes(1);
        expect(gameService.getActivesPartsObs).toHaveBeenCalledTimes(1);
        expect(userService.getActivesUsersObs).toHaveBeenCalledTimes(1);
    }));
    it('3. isUserLogged should delegate to authService', fakeAsync(async() => {
        spyOn(authenticationService, 'isUserLogged');
        component.isUserLogged();
        expect(authenticationService.isUserLogged).toHaveBeenCalledTimes(1);
    }));
    it('4. should be legal for any logged user to create game when there is none', fakeAsync(async () => {
        AuthenticationServiceMock.CURRENT_USER = { pseudo: 'Pseudo', verified: true };
        AuthenticationServiceMock.IS_USER_LOGGED = true;

        component.ngOnInit();

        expect(component.canCreateGame()).toBeTrue();
    }));
    it('5. should be illegal for unlogged user to create game', fakeAsync(async () => {
        AuthenticationServiceMock.CURRENT_USER = { pseudo: null, verified: null };
        AuthenticationServiceMock.IS_USER_LOGGED = false;

        component.ngOnInit();

        expect(component.canCreateGame()).toBeFalse();
    }));
    it('6. should be illegal to create game for a player already in game', fakeAsync(async () => {
        // TODO: fix that he provoque a bug, by coding "observingWhere" on FirebaseDAOMock
        AuthenticationServiceMock.CURRENT_USER = { pseudo: 'Pseudo', verified: true };
        AuthenticationServiceMock.IS_USER_LOGGED = true;
        gameService.getActivesPartsObs(); // Call is here to avoid that unscrubscription throw error
        spyOn(gameService, 'getActivesPartsObs').and.returnValue(of([
            {
                id: 'partId',
                doc: {
                    typeGame: 'P4',
                    playerZero: 'Pseudo',
                    turn: -1,
                    listMoves: [],
                },
            }]));
        component.ngOnInit();

        expect(component.canCreateGame()).toBeFalse();
        flush();
    }));
    it('7. should be legal for unlogged user to create local game', fakeAsync(async () => {
        AuthenticationServiceMock.CURRENT_USER = { pseudo: null, verified: null };
        AuthenticationServiceMock.IS_USER_LOGGED = false;
        component.ngOnInit();
        const routerNavigateSpy = spyOn(component.router, 'navigate').and.callThrough();

        component.playLocally();
        await fixture.whenStable();

        expect(routerNavigateSpy).toHaveBeenCalledWith(['local/undefined']);
    }));
    afterAll(async () => {
        fixture.destroy();
        await fixture.whenStable();
    });
});
