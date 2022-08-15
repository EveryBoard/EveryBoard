/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DebugElement } from '@angular/core';
import { formatDate } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

import { LobbyComponent } from './lobby.component';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { expectValidRouting, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { ActivePartsService } from 'src/app/services/ActivePartsService';
import { PartDocument } from 'src/app/domain/Part';
import { OnlineGameWrapperComponent } from '../../wrapper-components/online-game-wrapper/online-game-wrapper.component';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { User } from 'src/app/domain/User';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ConnectedUserService, GameActionFailure } from 'src/app/services/ConnectedUserService';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';

describe('LobbyComponent', () => {

    let testUtils: SimpleComponentTestUtils<LobbyComponent>;
    let component: LobbyComponent;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(LobbyComponent);
        ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
        component = testUtils.getComponent();
    }));

    it('should create', fakeAsync(async() => {
        expect(component).toBeDefined();
        component.ngOnInit();
    }));

    describe('tab-create element', () => {
        it('should display online-game-selection component when clicking on it when allowed by connectedUserService', fakeAsync(async() => {
            // Given a server page
            testUtils.detectChanges();
            // where you are allowed by connectedUserService
            const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
            spyOn(connectedUserService, 'canUserCreate').and.returnValue(MGPValidation.SUCCESS);

            // When clicking on the 'create game' tab
            await testUtils.clickElement('#tab-create');
            await testUtils.whenStable();

            // Then online-game-selection component is on the page
            testUtils.expectElementToExist('#online-game-selection');
        }));
        it('should refuse to change page when clicking on it while not allowed by connectedUserService, and toast the reason', fakeAsync(async() => {
            // Given a server page
            testUtils.detectChanges();
            // where you are allowed by connectedUserService
            const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);
            spyOn(messageDisplayer, 'criticalMessage').and.callThrough();
            const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
            const error: string = `Si je dit non, c'est non!!!`;
            spyOn(connectedUserService, 'canUserCreate').and.returnValue(MGPValidation.failure(error));

            // When clicking on the 'create game' tab
            await testUtils.clickElement('#tab-create');
            await testUtils.whenStable();
            tick(3000);

            // Then online-game-selection component is on the page
            testUtils.expectElementNotToExist('#online-game-selection');
            expect(messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(error);
        }));
    });

    function setLobbyPartList(list: PartDocument[]): void {
        const activePartsService: ActivePartsService = TestBed.inject(ActivePartsService);
        spyOn(activePartsService, 'getActivePartsObs')
            .and.returnValue(new BehaviorSubject(list).asObservable());
    }
    describe('clicking on a started game', () => {

        let unstartedPartUserCreated: PartDocument;
        let unstartedPartUserDidNotCreate: PartDocument;
        let anotherUnstartedPartUserDidNotCreate: PartDocument;

        let startedPartUserPlay: PartDocument;
        let startedPartUserDoNotPlay: PartDocument;
        let anotherStartedPartUserDoNotPlay: PartDocument;

        beforeEach(fakeAsync(async() => {
            // Unstarted
            unstartedPartUserCreated = new PartDocument('I-create', PartMocks.INITIAL);
            unstartedPartUserDidNotCreate = new PartDocument('I-did-not-create', PartMocks.ANOTHER_UNSTARTED);
            anotherUnstartedPartUserDidNotCreate = new PartDocument('me-no-create-either', PartMocks.ANOTHER_UNSTARTED);

            // Started
            startedPartUserPlay = new PartDocument('I-play', PartMocks.STARTED);
            startedPartUserDoNotPlay = new PartDocument('I-do-not-play', PartMocks.OTHER_STARTED);
            anotherStartedPartUserDoNotPlay = new PartDocument('me-no-play-either', PartMocks.ANOTHER_STARTED);
        }));
        describe('as a user participating to no games', () => {
            beforeEach(() => {
                // Given an user not part of any part
                ConnectedUserServiceMock.setObservedPart(MGPOptional.empty());
            });
            it('Should redirect to /play', fakeAsync(async() => {
                // And a server with one active part
                setLobbyPartList([startedPartUserDoNotPlay]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                await testUtils.clickElement('#part_0');

                // Then the component should navigate to the part
                expectValidRouting(router, ['/play', 'Quarto', startedPartUserDoNotPlay.id], OnlineGameWrapperComponent);
            }));
        });
        describe('as a player', () => {
            beforeEach(() => {
                // Given an user observing a part as a Player
                ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
                    id: startedPartUserPlay.id,
                    role: 'Player',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to join another game', fakeAsync(async() => {
                // And a lobby where the a part user do not play is present
                setLobbyPartList([startedPartUserDoNotPlay]);
                testUtils.detectChanges();

                // When clicking on the part
                spyOn(component.messageDisplayer, 'criticalMessage').and.callThrough();
                await testUtils.clickElement('#part_0');
                tick(3000); // 3 sec of toast display

                // Then the refusal reason should be given
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_PLAYING();
                expect(component.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(reason);
            }));
            it('should allow users to play their games from several tabs', fakeAsync(async() => {
                // And a lobby where the part player plays is present
                setLobbyPartList([startedPartUserPlay]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                await testUtils.clickElement('#part_0');

                // Then we should have went to see the game
                expectValidRouting(router, ['/play', 'Quarto', startedPartUserPlay.id], OnlineGameWrapperComponent);
            }));
        });
        describe('as an observer', () => {
            beforeEach(() => {
                // Given an user observing a part as an Observer
                ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
                    id: startedPartUserDoNotPlay.id,
                    role: 'Observer',
                    typeGame: 'P4',
                }));
            });
            it('should allow to observe a second part', fakeAsync(async() => {
                // And a lobby where another started part that user do not play is present
                setLobbyPartList([anotherStartedPartUserDoNotPlay]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                await testUtils.clickElement('#part_0');

                // Then we should have went to see the game
                expectValidRouting(router, ['/play', 'Quarto', anotherStartedPartUserDoNotPlay.id], OnlineGameWrapperComponent);
            }));
            it('should allow to observe twice the same part', fakeAsync(async() => {
                // Given a lobby where the connected user is already the observer in this part
                setLobbyPartList([startedPartUserDoNotPlay]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                await testUtils.clickElement('#part_0');

                // Then we should have went to see the game
                expectValidRouting(router, ['/play', 'Quarto', startedPartUserDoNotPlay.id], OnlineGameWrapperComponent);
            }));
        });
        describe('as a creator', () => {
            beforeEach(() => {
                // Given an user observing a part as a Creator
                ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
                    id: unstartedPartUserCreated.id,
                    role: 'Creator',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to observe game while creating another one', fakeAsync(async() => {
                // And a lobby where another started part that user do not play is present
                setLobbyPartList([startedPartUserDoNotPlay]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                spyOn(component.messageDisplayer, 'criticalMessage').and.callThrough();
                await testUtils.clickElement('#part_0');
                tick(3000); // 3 sec of toast display

                // Then the refusal reason should be given
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_CREATING();
                expect(component.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(reason);
            }));
        });
        describe('as a candidate', () => {
            beforeEach(() => {
                // Given an user observing a part as a Candidate
                ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
                    id: unstartedPartUserDidNotCreate.id,
                    role: 'Candidate',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to observe game while candidate in another one', fakeAsync((async() => {
                // And a lobby where another unstarted part not linked to user is present
                setLobbyPartList([anotherUnstartedPartUserDidNotCreate]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                spyOn(component.messageDisplayer, 'criticalMessage').and.callThrough();
                await testUtils.clickElement('#part_0');
                tick(3000); // 3 sec of toast display

                // Then the refusal reason should be given
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_CANDIDATE();
                expect(component.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(reason);
            })));
        });
        describe('as chosen opponent', () => {
            beforeEach(() => {
                // Given an user observing a part as a Candidate
                ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
                    id: unstartedPartUserDidNotCreate.id,
                    role: 'ChosenOpponent',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to observe game while chosen opponent in another one', fakeAsync((async() => {
                // And a lobby where another unstarted part not linked to user is present
                setLobbyPartList([anotherUnstartedPartUserDidNotCreate]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                spyOn(component.messageDisplayer, 'criticalMessage').and.callThrough();
                await testUtils.clickElement('#part_0');
                tick(3000); // 3 sec of toast display

                // Then the refusal reason should be given
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT();
                expect(component.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(reason);
            })));
        });
    });

    describe('clicking on a unstarted game', () => {

        let unstartedPartUserCreated: PartDocument;
        let startedPartUserPlay: PartDocument;
        let unstartedPartUserDidNotCreate: PartDocument;
        let anotherUnstartedPartUserDidNotCreate: PartDocument;

        beforeEach(fakeAsync(async() => {
            unstartedPartUserCreated = new PartDocument('the-part-I-create', PartMocks.INITIAL);
            startedPartUserPlay = new PartDocument('the-part-I-created', PartMocks.STARTED);
            unstartedPartUserDidNotCreate = new PartDocument('a-part-I-do-not-create', PartMocks.OTHER_STARTED);
            anotherUnstartedPartUserDidNotCreate = new PartDocument('another-part-user-did-not-createru', PartMocks.ANOTHER_STARTED);
        }));
        describe('as a user part of no games', () => {
            beforeEach(() => {
                // Given an user not part of any part
                ConnectedUserServiceMock.setObservedPart(MGPOptional.empty());
            });
            it('Should redirect to /play', fakeAsync(async() => {
                // And a server with one active part
                setLobbyPartList([unstartedPartUserDidNotCreate]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                await testUtils.clickElement('#part_0');

                // Then the component should navigate to the part
                expectValidRouting(router, ['/play', 'Quarto', unstartedPartUserDidNotCreate.id], OnlineGameWrapperComponent);
            }));
        });
        describe('as a player', () => {
            beforeEach(() => {
                // Given an user already playing a part
                ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
                    id: startedPartUserPlay.id,
                    role: 'Player',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to become candidate while already playing another game', fakeAsync(async() => {
                // And a lobby where the connected user is already the Player in one part
                setLobbyPartList([unstartedPartUserDidNotCreate]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                spyOn(component.messageDisplayer, 'criticalMessage').and.callThrough();
                await testUtils.clickElement('#part_0');
                tick(3000); // 3 sec of toast display

                // Then the refusal reason should be given
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_PLAYING();
                expect(component.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(reason);
            }));
        });
        describe('as a creator', () => {
            beforeEach(() => {
                // Given an user already creator of a part
                ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
                    id: unstartedPartUserCreated.id,
                    role: 'Creator',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to be candidate while already creating another game', fakeAsync(async() => {
                // And a lobby where another unstarted part not linked to user is present
                setLobbyPartList([unstartedPartUserDidNotCreate]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                spyOn(component.messageDisplayer, 'criticalMessage').and.callThrough();
                await testUtils.clickElement('#part_0');
                tick(3000); // 3 sec of toast display

                // Then the refusal reason should be given
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_CREATING();
                expect(component.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(reason);
            }));
            it('should allow user to have his created part in two tabs', fakeAsync(async() => {
                // And a lobby where the same part is obviously already
                setLobbyPartList([unstartedPartUserCreated]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                await testUtils.clickElement('#part_0');

                // Then the refusal reason should be given
                expectValidRouting(router, ['/play', 'Quarto', unstartedPartUserCreated.id], OnlineGameWrapperComponent);
            }));
        });
        describe('as a chosen opponent', () => {
            beforeEach(() => {
                // Given an user observing a part as a chosen opponent
                ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
                    id: unstartedPartUserDidNotCreate.id,
                    role: 'ChosenOpponent',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to be candidate while already chosen opponent in another game', fakeAsync(async() => {
                // Given a lobby where the connected user is already the chosen opponent in one part
                setLobbyPartList([anotherUnstartedPartUserDidNotCreate]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                spyOn(component.messageDisplayer, 'criticalMessage').and.callThrough();
                await testUtils.clickElement('#part_0');
                tick(3000); // 3 sec of toast display

                // Then the refusal reason should be given
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT();
                expect(component.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(reason);
            }));
            it('should allow user to be candidate of the same part in several tabs', fakeAsync(async() => {
                // And a lobby where the same part is obviously already
                setLobbyPartList([unstartedPartUserDidNotCreate]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                await testUtils.clickElement('#part_0');

                // Then the refusal reason should be given
                expectValidRouting(router, ['/play', 'Quarto', unstartedPartUserDidNotCreate.id], OnlineGameWrapperComponent);
            }));
        });
        describe('as a candidate', () => {
            beforeEach(() => {
                // Given an user observing a part as a Candidate
                ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
                    id: unstartedPartUserDidNotCreate.id,
                    role: 'Candidate',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to be candidate in two part as once', fakeAsync(async() => {
                // Given a lobby where the connected user is already the candidate in one part
                setLobbyPartList([anotherUnstartedPartUserDidNotCreate]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                spyOn(component.messageDisplayer, 'criticalMessage').and.callThrough();
                await testUtils.clickElement('#part_0');
                tick(3000); // 3 sec of toast display

                // Then the refusal reason should be given
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_CANDIDATE();
                expect(component.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(reason);
            }));
            it('should allow user to have be candidate of the same part in two tabs', fakeAsync(async() => {
                // And a lobby where the same part is obviously already
                setLobbyPartList([unstartedPartUserDidNotCreate]);
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo();
                testUtils.detectChanges();

                // When clicking on the part
                await testUtils.clickElement('#part_0');

                // Then the refusal reason should be given
                expectValidRouting(router, ['/play', 'Quarto', unstartedPartUserDidNotCreate.id], OnlineGameWrapperComponent);
            }));
        });
    });

    it('should stop watching current part observable and part list when destroying component', fakeAsync(async() => {
        // Given a server page
        testUtils.detectChanges();
        // eslint-disable-next-line dot-notation
        spyOn(component['activePartsSub'], 'unsubscribe').and.callThrough();
        const activePartsService: ActivePartsService = TestBed.inject(ActivePartsService);
        spyOn(activePartsService, 'stopObserving');

        // When destroying the component
        component.ngOnDestroy();

        // Then the router active part observer should have been unsubscribed
        // eslint-disable-next-line dot-notation
        expect(component['activePartsSub'].unsubscribe).toHaveBeenCalledOnceWith();
        // and ActivePartsService should have been told to stop observing
        expect(activePartsService.stopObserving).toHaveBeenCalledOnceWith();
    }));

    it('should display firebase time HH:mm:ss', fakeAsync(async() => {
        // Given a lobby in which we observe tab chat, and where one user is here
        const HH: number = 11 * 3600;
        const mm: number = 34 * 60;
        const ss: number = 56;
        const timeStampInSecond: number = HH + mm + ss;
        const userWithLastChange: User = {
            ...UserMocks.CREATOR,
            last_changed: { seconds: timeStampInSecond, nanoseconds: 0 },
        };
        await TestBed.inject(UserDAO).set(UserMocks.CREATOR_AUTH_USER.id, userWithLastChange);
        tick();
        await testUtils.clickElement('#tab-chat');
        tick();

        // When rendering it
        testUtils.detectChanges();

        // Then the date should be written in format HH:mm:ss (with 1h added due to Locale?)
        const element: DebugElement = testUtils.findElement('#' + UserMocks.CREATOR_MINIMAL_USER.name);
        const time: string = element.nativeElement.innerText;
        const timeAsString: string = formatDate(timeStampInSecond * 1000, 'HH:mm:ss', 'en-US');
        expect(time).toBe(UserMocks.CREATOR_MINIMAL_USER.name + ': ' + timeAsString);
    }));
});
