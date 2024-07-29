/* eslint-disable max-lines-per-function */
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { ExclusiveOnlineGameGuard } from '../exclusive-online-game-guard';
import { MGPOptional } from '@everyboard/lib';
import { PartDocument } from 'src/app/domain/Part';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { CurrentGameService } from 'src/app/services/CurrentGameService';
import { CurrentGameServiceMock } from 'src/app/services/tests/CurrentGameService.spec';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { GameService } from 'src/app/services/GameService';
import { ConfigRoomService } from 'src/app/services/ConfigRoomService';
import { ServerTimeService } from 'src/app/services/ServerTimeService';
import { ServerTimeServiceMock } from 'src/app/services/tests/ServerTimeServiceMock.spec';
import { ConfigRoomServiceMock } from 'src/app/services/tests/ConfigRoomServiceMock.spec';
import { GameServiceMock } from 'src/app/services/tests/GameServiceMock.spec';

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
