/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { MGPOptional } from '@everyboard/lib';

import { PartDocument } from '../../domain/Part';
import { PartMocks } from '../../domain/PartMocks.spec';
import { UserMocks } from '../../domain/UserMocks.spec';
import { ConfigRoomService } from '../../services/ConfigRoomService';
import { ConnectedUserService } from '../../services/ConnectedUserService';
import { CurrentGameService } from '../../services/CurrentGameService';
import { GameService } from '../../services/GameService';
import { ServerTimeService } from '../../services/ServerTimeService';
import { ConfigRoomServiceMock } from '../../services/tests/ConfigRoomServiceMock.spec';
import { ConnectedUserServiceMock } from '../../services/tests/ConnectedUserService.spec';
import { CurrentGameServiceMock } from '../../services/tests/CurrentGameService.spec';
import { GameServiceMock } from '../../services/tests/GameServiceMock.spec';
import { ServerTimeServiceMock } from '../../services/tests/ServerTimeServiceMock.spec';
import { BlankComponent } from '../../utils/tests/TestUtils.spec';
import { ExclusiveOnlineGameGuard } from '../exclusive-online-game-guard';

describe('ExclusiveOnlineGameGuard', () => {

    let exclusiveOnlineGameGuard: ExclusiveOnlineGameGuard;

    let currentGameService: CurrentGameService;

    let router: Router;

    const startedPartUserPlay: PartDocument = new PartDocument('I-play', PartMocks.STARTED);

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: '**', component: BlankComponent },
                ]),
            ],
            providers: [
                { provide: CurrentGameService, useClass: CurrentGameServiceMock },
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
                { provide: GameService, useClass: GameServiceMock },
                { provide: ConfigRoomService, useClass: ConfigRoomServiceMock },
                { provide: ServerTimeService, useClass: ServerTimeServiceMock },
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
            id: startedPartUserPlay.id,
            role: 'Player',
            typeGame: 'P4',
        }));

        // When asking if user can go to a different part
        const route: ActivatedRouteSnapshot = {
            params: { id: startedPartUserPlay.id },
        } as unknown as ActivatedRouteSnapshot;

        // Then it should be refused
        await expectAsync(exclusiveOnlineGameGuard.canActivate(route)).toBeResolvedTo(true);
    }));
    it(`should refuse to go to another part and redirect to user's part`, fakeAsync(async() => {
        // Given a connected user service indicating user is already player
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        CurrentGameServiceMock.setCurrentGame(MGPOptional.of({
            id: startedPartUserPlay.id,
            role: 'Player',
            typeGame: 'P4',
        }));

        // When asking if user can go to a different part
        const route: ActivatedRouteSnapshot = {
            params: { id: 'some other part blbl' },
        } as unknown as ActivatedRouteSnapshot;

        // Then it should be refused and redirected
        await expectAsync(exclusiveOnlineGameGuard.canActivate(route)).toBeResolvedTo(router.parseUrl('/play/P4/I-play'));
    }));
});
