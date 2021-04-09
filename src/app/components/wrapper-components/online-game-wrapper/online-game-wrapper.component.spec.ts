import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { of } from 'rxjs';

import { AppModule } from 'src/app/app.module';
import { OnlineGameWrapperComponent } from './online-game-wrapper.component';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { JoinerService } from 'src/app/services/joiner/JoinerService';

import { JoinerDAO } from 'src/app/dao/joiner/JoinerDAO';
import { JoinerDAOMock } from 'src/app/dao/joiner/JoinerDAOMock';

import { IJoiner } from 'src/app/domain/ijoiner';
import { JoinerMocks } from 'src/app/domain/JoinerMocks';
import { PartDAO } from 'src/app/dao/part/PartDAO';
import { PartDAOMock } from 'src/app/dao/part/PartDAOMock';
import { PartMocks } from 'src/app/domain/PartMocks';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { ChatDAO } from 'src/app/dao/chat/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/chat/ChatDAOMock';
import { RouterTestingModule } from '@angular/router/testing';
import { ICurrentPart } from 'src/app/domain/icurrentpart';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                if (str === 'id') return 'joinerId';
                if (str === 'compo') return 'P4';
            },
        },
    },
};
class AuthenticationServiceMock {
    public static USER: {pseudo: string, verified: boolean};

    public getJoueurObs() {
        return of({
            pseudo: AuthenticationServiceMock.USER.pseudo,
            verified: AuthenticationServiceMock.USER.verified,
        });
    }
    public getAuthenticatedUser(): {pseudo: string, verified: boolean} {
        return {
            pseudo: AuthenticationServiceMock.USER.pseudo,
            verified: AuthenticationServiceMock.USER.verified,
        };
    }
}

@Component({})
class BlankComponent {}

describe('OnlineGameWrapperComponent Lifecycle', () => {
    /* Life cycle summary
     * component construction (beforeEach)
     * stage 0
     * ngOnInit (triggered by detectChanges)
     * stage 1: PartCreationComponent appear
     * startGame, launched by user if game was not started yet, or automatically (via partCreationComponent)
     * stage 2: PartCreationComponent disappear, GameIncluderComponent appear
     * tick(1): the async part of startGame is now finished
     * stage 3: P4Component appear
     * differents scenarios
     */

    let fixture: ComponentFixture<OnlineGameWrapperComponent>;

    let component: OnlineGameWrapperComponent;

    let joinerService: JoinerService;

    let router: Router;

    const prepareComponent: (initialJoiner: IJoiner, initialPart: ICurrentPart) => Promise<void> =
    async(initialJoiner: IJoiner, initialPart: ICurrentPart) => {
        fixture = TestBed.createComponent(OnlineGameWrapperComponent);
        const partDAOMock: PartDAOMock = TestBed.get(PartDAO);
        const joinerDAOMock: JoinerDAOMock = TestBed.get(JoinerDAO);
        const chatDAOMock: ChatDAOMock = TestBed.get(ChatDAO);
        joinerService = TestBed.get(JoinerService);
        component = fixture.debugElement.componentInstance;
        await joinerDAOMock.set('joinerId', initialJoiner);
        await partDAOMock.set('joinerId', initialPart);
        await chatDAOMock.set('joinerId', { messages: [], status: 'I don\'t have a clue' });
        return Promise.resolve();
    };
    beforeEach(async() => {
        await TestBed.configureTestingModule({
            imports: [
                AppModule,
                RouterTestingModule.withRoutes([
                    { path: 'play', component: OnlineGameWrapperComponent },
                    { path: 'server', component: BlankComponent },
                ]),
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: JoueursDAO, useClass: JoueursDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
            ],
        }).compileComponents();
        router = TestBed.inject(Router);
    });
    describe('for creator', () => {
        beforeAll(() => {
            AuthenticationServiceMock.USER = { pseudo: 'creator', verified: true };
        });
        it('Initialisation should lead to child component PartCreation to call JoinerService', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.INITIAL.copy(), PartMocks.INITIAL.copy());
            spyOn(joinerService, 'joinGame').and.callThrough();
            spyOn(joinerService, 'startObserving').and.callThrough();
            expect(component.currentPartId).not.toBeDefined();
            expect(joinerService.joinGame).not.toHaveBeenCalled();
            expect(joinerService.startObserving).not.toHaveBeenCalled();

            fixture.detectChanges();
            tick();

            expect(component.currentPartId).toBeDefined();
            expect(joinerService.joinGame).toHaveBeenCalledTimes(1);
            expect(joinerService.startObserving).toHaveBeenCalledTimes(1);
        }));
        it('Initialisation on accepted config should lead to PartCreationComponent to call startGame', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.WITH_ACCEPTED_CONFIG.copy(), PartMocks.INITIAL.copy());
            fixture.detectChanges();

            spyOn(component, 'startGame').and.callThrough();
            expect(component.startGame).not.toHaveBeenCalled();

            tick(); // Finish calling async code from PartCreationComponent initialisation

            expect(component.startGame).toHaveBeenCalledTimes(1);
            fixture.detectChanges(); // Needed so PartCreation is destroyed and GameIncluder Component created
            tick(1);
            tick(component.maximalMoveDuration);
        }));
        it('Some tags are needed before initialisation', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.INITIAL.copy(), PartMocks.INITIAL.copy());
            expect(component).toBeTruthy();
            const compiled = fixture.debugElement.nativeElement;
            const partCreationTag: DebugElement = compiled.querySelector('app-part-creation');
            const gameIncluderTag: DebugElement = compiled.querySelector('app-game-includer');
            const p4Tag: DebugElement = compiled.querySelector('app-p4');
            const chatTag: DebugElement = compiled.querySelector('app-chat');

            expect(component.gameStarted).toBeFalse();
            expect(partCreationTag).toBeFalsy('app-part-creation tag should be present at start');
            expect(gameIncluderTag).toBeFalsy('app-game-includer tag should be absent at start');
            expect(p4Tag).toBeFalsy('app-p4 tag should be absent at start');
            expect(chatTag).toBeTruthy('app-chat tag should be present at start');

            fixture.detectChanges();
            tick(1);
        }));
        it('Some ids are needed before initialisation', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.INITIAL.copy(), PartMocks.INITIAL.copy());
            const partCreationId: DebugElement = fixture.debugElement.query(By.css('#partCreation'));
            const gameId: DebugElement = fixture.debugElement.query(By.css('#game'));
            const chatId: DebugElement = fixture.debugElement.query(By.css('#chat'));

            expect(component.gameStarted).toBeFalse();
            expect(partCreationId).toBeFalsy('partCreation id should be present at start');
            expect(gameId).toBeFalsy('game id should be absent at start');
            expect(chatId).toBeTruthy('chat id should be present at start');

            fixture.detectChanges();
            tick(1);
        }));
        it('Initialisation should make appear PartCreationComponent', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.INITIAL.copy(), PartMocks.INITIAL.copy());
            let partCreationId: DebugElement = fixture.debugElement.query(By.css('#partCreation'));
            expect(partCreationId).toBeFalsy('partCreation id should be absent before ngOnInit');

            fixture.detectChanges();
            tick(1);

            partCreationId = fixture.debugElement.query(By.css('#partCreation'));
            expect(partCreationId).toBeTruthy('partCreation id should be present after ngOnInit');
        }));
        it('StartGame should replace PartCreationComponent by GameIncluderComponent', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.WITH_ACCEPTED_CONFIG.copy(), PartMocks.INITIAL.copy());
            fixture.detectChanges();
            tick();

            fixture.detectChanges();

            const partCreationId: DebugElement = fixture.debugElement.query(By.css('#partCreation'));
            const gameId: DebugElement = fixture.debugElement.query(By.css('#game'));
            const p4Tag: DebugElement = fixture.debugElement.nativeElement.querySelector('app-p4');

            expect(component.gameStarted).toBeTrue();
            expect(partCreationId).toBeFalsy('partCreation id should be absent after startGame call');
            expect(gameId).toBeTruthy('game id should be present after startGame call');
            expect(p4Tag).toBeNull('p4Tag id should still be absent after startGame call');
            flush();
        }));
        it('stage three should make the game component appear at last', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.WITH_ACCEPTED_CONFIG.copy(), PartMocks.INITIAL.copy());
            fixture.detectChanges();
            tick();

            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement.querySelector('app-p4'))
                .toBeNull('p4Tag id should be absent before startGame\'s async method has complete');

            tick(1);

            expect(fixture.debugElement.nativeElement.querySelector('app-p4'))
                .toBeTruthy('p4Tag id should be present after startGame\'s async method has complete');
            flush();
        }));
    });
    describe('for chosenPlayer', () => {
        beforeAll(() => {
            AuthenticationServiceMock.USER = { pseudo: 'chosenPlayer', verified: true };
        });
        it('StartGame should replace PartCreationComponent by GameIncluderComponent', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.WITH_ACCEPTED_CONFIG.copy(), PartMocks.INITIAL.copy());
            fixture.detectChanges();
            tick();

            fixture.detectChanges();

            const partCreationId: DebugElement = fixture.debugElement.query(By.css('#partCreation'));
            const gameId: DebugElement = fixture.debugElement.query(By.css('#game'));
            const p4Tag: DebugElement = fixture.debugElement.nativeElement.querySelector('app-p4');

            expect(component.gameStarted).toBeTrue();
            expect(partCreationId).toBeFalsy('partCreation id should be absent after startGame call');
            expect(gameId).toBeTruthy('game id should be present after startGame call');
            expect(p4Tag).toBeNull('p4Tag id should still be absent after startGame call');
            tick(1);
            tick(component.maximalMoveDuration);
        }));
    });
    it('should redirect to index page if part does not exist', fakeAsync(async() => {
        spyOn(router, 'navigate').and.callThrough();
        AuthenticationServiceMock.USER = { pseudo: 'player', verified: true };
        await prepareComponent(null, null);
        fixture.detectChanges();
        tick();

        expect(router.navigate).toHaveBeenCalledOnceWith(['/notFound']);
    }));
    afterEach(fakeAsync(async() => {
        fixture.destroy();
        await fixture.whenStable();
        tick();
    }));
});
