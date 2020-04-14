import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerPageComponent } from './server-page.component';

import { AppModule } from 'src/app/app.module';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { of, Observable } from 'rxjs';
import { UserService } from 'src/app/services/user/UserService';
import { GameService } from 'src/app/services/game/GameService';
import { ICurrentPartId } from 'src/app/domain/icurrentpart';
import { ChatService } from 'src/app/services/chat/ChatService';
import { IChatId } from 'src/app/domain/ichat';

const userServiceStub = {
    getActivesUsersObs: () => of([]),
    unSubFromActivesUsersObs: () => {},
};
class GameServiceMock {
    getActivesPartsObs(): Observable<ICurrentPartId[]> { 
        return of([]);
    }
    unSubFromActivesPartsObs() {
        return;
    }
};
class AuthenticationServiceMock {
    getJoueurObs(): Observable<{pseudo: string, verified: boolean}> {
        return of({ pseudo: 'Pseudo', verified: true});
    }
    isUserLogged(): boolean {
        return true;
    }
};
const chatServiceStub = {
    startObserving: (cId: string, cb: (iChatId: IChatId) => void) => {},
    stopObserving: () => {},
};
describe('ServerPageComponent', () => {

    let component: ServerPageComponent;

    let authenticationService: AuthenticationService;
    let gameService: GameService;
    let userService: UserService;

    let fixture: ComponentFixture<ServerPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                AppModule,
                RouterTestingModule,
            ],
            providers: [
                { provide: UserService, useValue: userServiceStub },
                { provide: GameService, useClass: GameServiceMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: ChatService, useValue: chatServiceStub }
            ]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(ServerPageComponent);
        component = fixture.componentInstance;
        authenticationService = TestBed.get(AuthenticationService);
        gameService = TestBed.get(GameService);
        userService = TestBed.get(UserService);
    });
    it('should create', async(() => {
        expect(component).toBeTruthy();
        const ngOnInit = spyOn(component, "ngOnInit").and.callThrough();;
        expect(ngOnInit).not.toHaveBeenCalled();
        
        fixture.detectChanges();
        
        expect(ngOnInit).toHaveBeenCalledTimes(1);
    }));
    it('should subscribe to three observable on init', async(() => {
        expect(component.userName).toBeUndefined();
        const joueurObsSpy = spyOn(authenticationService, "getJoueurObs").and.callThrough();
        const activePartsObsSpy = spyOn(gameService, "getActivesPartsObs").and.callThrough();
        const activesUsersObsSpy = spyOn(userService, "getActivesUsersObs").and.callThrough();

        expect(joueurObsSpy).not.toHaveBeenCalled();
        expect(activePartsObsSpy).not.toHaveBeenCalled();
        expect(activesUsersObsSpy).not.toHaveBeenCalled();
        
        component.ngOnInit();

        expect(component.userName).toBe("Pseudo");
        expect(joueurObsSpy).toHaveBeenCalledTimes(1);
        expect(activePartsObsSpy).toHaveBeenCalledTimes(1);
        expect(activesUsersObsSpy).toHaveBeenCalledTimes(1);
    }));
    it('isUserLogged should delegate to authService', () => {
        const isUserLogged: jasmine.Spy = spyOn(authenticationService, "isUserLogged").and.returnValue(false);
        expect(component.isUserLogged()).toBeFalsy();
        expect(isUserLogged).toHaveBeenCalled();
    });
    it('should be legal for any logged user to create game when there is none', async(() => {
        component.ngOnInit();
        expect(component.canCreateGame()).toBeTruthy();
    }));
    it('should be illegal to create game for a player already in game', async(() => {
        const currentPartSpy = spyOn(gameService, "getActivesPartsObs").and.returnValue(of([{
            id: "partId",
            doc: {
                typeGame: "P4",
                playerZero: "actuallyPlayingUser",
                turn: -1,
                listMoves: [],
            }
        }]));
        component.ngOnInit();
        component.userName = "actuallyPlayingUser";
        expect(component.canCreateGame()).toBeFalsy();
    }));
    afterAll(async(() => {
        component.ngOnDestroy();
    }));
});