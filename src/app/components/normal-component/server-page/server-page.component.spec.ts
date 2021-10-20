import { fakeAsync, TestBed } from '@angular/core/testing';
import { ServerPageComponent } from './server-page.component';
import { AuthUser } from 'src/app/services/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/GameService';
import { ICurrentPartId } from 'src/app/domain/icurrentpart';
import { PartMocks } from 'src/app/domain/PartMocks.spec';

describe('ServerPageComponent', () => {

    let testUtils: SimpleComponentTestUtils<ServerPageComponent>;
    let gameService: GameService;
    let component: ServerPageComponent;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(ServerPageComponent);
        AuthenticationServiceMock.setUser(AuthUser.NOT_CONNECTED);
        component = testUtils.getComponent();
        gameService = TestBed.inject(GameService);
    }));
    it('should create', fakeAsync(async() => {
        expect(component).toBeDefined();
        component.ngOnInit();
    }));
    it('should rely on game service to create online games', fakeAsync(async() => {
        const gameService: GameService = TestBed.inject(GameService);
        spyOn(gameService, 'createGameAndRedirectOrShowError');
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        component.ngOnInit();

        component.pickGame('Awale');
        component.createGame();
        testUtils.detectChanges();

        expect(gameService.createGameAndRedirectOrShowError).toHaveBeenCalledWith('Awale');
    }));
    it('Should be legal for unlogged user to create local game', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        AuthenticationServiceMock.setUser(AuthUser.NOT_CONNECTED);
        spyOn(router, 'navigate');
        component.ngOnInit();

        component.playLocally();
        testUtils.detectChanges();

        expect(router.navigate).toHaveBeenCalledWith(['local/undefined']);
    }));
    it('Should redirect to /play when clicking a game', fakeAsync(async() => {
        // given a server page with one part
        const activePart: ICurrentPartId = {
            id: 'some-part-id',
            doc: PartMocks.INITIAL.doc,
        };
        const compo: ServerPageComponent = component;
        spyOn(compo.router, 'navigate').and.callThrough();
        spyOn(compo, 'getActiveParts').and.returnValue([activePart]);

        // when clicking on the first part
        testUtils.detectChanges();
        testUtils.clickElement('#part_0');

        // then router should have navigate
        expect(compo.getActiveParts).toHaveBeenCalled();
        expect(compo.router.navigate).toHaveBeenCalledOnceWith(['/play/Quarto', 'some-part-id']);
    }));
    it('should stop watching current part observable when destroying component', fakeAsync(async() => {
        // given a server page
        spyOn(gameService, 'unSubFromActivesPartsObs').and.callThrough();
        testUtils.detectChanges();

        // when destroying the component
        component.ngOnDestroy();

        // then router should have navigate
        expect(gameService.unSubFromActivesPartsObs).toHaveBeenCalledOnceWith();
    }));
});
