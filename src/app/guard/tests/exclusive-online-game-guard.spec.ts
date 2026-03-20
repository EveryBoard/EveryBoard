/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterModule } from '@angular/router';

import { MGPOptional } from '@everyboard/lib';

import { UserMocks } from '../../domain/UserMocks.spec';
import { ConnectedUserService } from '../../services/ConnectedUserService';
import { CurrentGameService } from '../../services/CurrentGameService';
import { ConnectedUserServiceMock } from '../../services/tests/ConnectedUserService.spec';
import { CurrentGameServiceMock } from '../../services/tests/CurrentGameServiceMock.spec';
import { BlankComponent } from '../../utils/tests/TestUtils.spec';
import { ExclusiveOnlineGameGuard } from '../exclusive-online-game-guard';

describe('ExclusiveOnlineGameGuard', () => {

    let exclusiveOnlineGameGuard: ExclusiveOnlineGameGuard;
    let currentGameService: CurrentGameService;
    let router: Router;
    const gameId: string = 'gameId';

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [
                RouterModule,
            ],
            providers: [
                provideRouter([
                    { path: '**', component: BlankComponent },
                ]),
                { provide: CurrentGameService, useClass: CurrentGameServiceMock },
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
            ],
        }).compileComponents();
        router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo(true);
        currentGameService = TestBed.inject(CurrentGameService);
        exclusiveOnlineGameGuard = new ExclusiveOnlineGameGuard(currentGameService, router);
    }));

    it('should create', () => {
        expect(exclusiveOnlineGameGuard).toBeDefined();
    });

    it('should allow to activate when you are not doing anything', fakeAsync(async() => {
        // Given a connected user not observing any part
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        tick(0);
        CurrentGameServiceMock.setCurrentGame(MGPOptional.empty());

        // When asking if user can go to some part id
        const route: ActivatedRouteSnapshot = {
            params: { id: 'any id' },
        } as unknown as ActivatedRouteSnapshot;

        // Then it should be accepted
        await expectAsync(exclusiveOnlineGameGuard.canActivate(route)).toBeResolvedTo(true);
    }));

    it(`should allow to go to user's part`, fakeAsync(async() => {
        // Given a connected user service indicating user is player
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        CurrentGameServiceMock.setCurrentGame(MGPOptional.of({
            id: gameId,
            role: 'Player',
            gameName: 'P4',
        }));

        // When asking if user can go to a different part
        const route: ActivatedRouteSnapshot = {
            params: { id: gameId },
        } as unknown as ActivatedRouteSnapshot;

        // Then it should be refused
        await expectAsync(exclusiveOnlineGameGuard.canActivate(route)).toBeResolvedTo(true);
    }));

    it(`should refuse to go to another part and redirect to user's part`, fakeAsync(async() => {
        // Given a connected user service indicating user is already player
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        CurrentGameServiceMock.setCurrentGame(MGPOptional.of({
            id: gameId,
            role: 'Player',
            gameName: 'P4',
        }));

        // When asking if user can go to a different part
        const route: ActivatedRouteSnapshot = {
            params: { id: 'some other part blbl' },
        } as unknown as ActivatedRouteSnapshot;

        // Then it should be refused and redirected
        await expectAsync(exclusiveOnlineGameGuard.canActivate(route)).toBeResolvedTo(router.parseUrl('/play/P4/' + gameId));
    }));
});
