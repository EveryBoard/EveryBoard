/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DebugElement } from '@angular/core';
import { formatDate } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { Subscription } from 'rxjs';

import { ActivePartsService } from 'src/app/services/ActivePartsService';
import { ActiveUsersService } from 'src/app/services/ActiveUsersService';
import { GameActionFailure } from 'src/app/services/ConnectedUserService';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { UserDAO } from 'src/app/dao/UserDAO';

import { expectValidRouting, prepareUnsubscribeCheck, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { PartDocument } from 'src/app/domain/Part';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { User } from 'src/app/domain/User';

import { LobbyComponent } from './lobby.component';
import { OnlineGameWrapperComponent } from '../../wrapper-components/online-game-wrapper/online-game-wrapper.component';
import { ObservedPartService } from 'src/app/services/ObservedPartService';
import { ObservedPartServiceMock } from 'src/app/services/tests/ObservedPartService.spec';

describe('LobbyComponent', () => {

    let testUtils: SimpleComponentTestUtils<LobbyComponent>;
    let component: LobbyComponent;
    let router: Router;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(LobbyComponent);
        ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
        component = testUtils.getComponent();
        router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();
    }));

    it('should create', fakeAsync(async() => {
        expect(component).toBeDefined();
        component.ngOnInit();
    }));
    describe('tab-create element', () => {
        it('should display online-game-selection component when clicking on it when allowed by connectedUserService', fakeAsync(async() => {
            // Given a server page
            testUtils.detectChanges();
            // where you are allowed by observedPartService
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            spyOn(observedPartService, 'canUserCreate').and.returnValue(MGPValidation.SUCCESS);

            // When clicking on the 'create game' tab
            await testUtils.clickElement('#tab-create');
            await testUtils.whenStable();

            // Then online-game-selection component should be on the page
            testUtils.expectElementToExist('#online-game-selection');
        }));
        it('should refuse to change page when clicking on it while not allowed by connectedUserService, and toast the reason', fakeAsync(async() => {
            // Given a server page
            testUtils.detectChanges();
            // where you are forbidden by connectedUserService
            const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);
            spyOn(messageDisplayer, 'criticalMessage').and.resolveTo();
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            const error: string = `Si je dit non, c'est non!!!`;
            spyOn(observedPartService, 'canUserCreate').and.returnValue(MGPValidation.failure(error));

            // When clicking on the 'create game' tab
            await testUtils.clickElement('#tab-create');
            await testUtils.whenStable();

            // Then online-game-selection component should not be visible and an error should be toasted
            testUtils.expectElementNotToExist('#online-game-selection');
            expect(messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(error);
        }));
    });

    function setLobbyPartList(list: PartDocument[]): void {
        const activePartsService: ActivePartsService = TestBed.inject(ActivePartsService);
        spyOn(activePartsService, 'subscribeToActiveParts')
            .and.callFake((callback: (parts: PartDocument[]) => void) => {
                callback(list);
                return new Subscription();
            });
    }
    async function shouldAllowJoinPart(partList: PartDocument[]): Promise<void> {
        // Given a server with the given partList
        setLobbyPartList(partList);
        testUtils.detectChanges();

        // When clicking on the first part
        await testUtils.clickElement('#part_0');

        // Then the component should have navigate to the part
        expectValidRouting(router, ['/play', 'Quarto', partList[0].id], OnlineGameWrapperComponent);
    }
    async function shouldForbidToJoinPart(partList: PartDocument[], reason: string): Promise<void> {
        setLobbyPartList(partList);
        testUtils.detectChanges();

        // When clicking on the part
        spyOn(component.messageDisplayer, 'criticalMessage').and.resolveTo(); // Skip 3000ms of toast
        await testUtils.clickElement('#part_0');

        // Then the refusal reason should be given
        expect(component.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(reason);
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
            unstartedPartUserDidNotCreate = new PartDocument('I-did-not-create', PartMocks.OTHER_UNSTARTED);
            anotherUnstartedPartUserDidNotCreate = new PartDocument('me-no-create-either', PartMocks.OTHER_UNSTARTED);

            // Started
            startedPartUserPlay = new PartDocument('I-play', PartMocks.STARTED);
            startedPartUserDoNotPlay = new PartDocument('I-do-not-play', PartMocks.OTHER_STARTED);
            anotherStartedPartUserDoNotPlay = new PartDocument('me-no-play-either', PartMocks.OTHER_STARTED);
        }));
        describe('as a user participating to no games', () => {
            beforeEach(() => {
                // Given an user not part of any part
                ObservedPartServiceMock.setObservedPart(MGPOptional.empty());
            });
            it('should redirect to /play', fakeAsync(async() => {
                // And a server with one active part
                await shouldAllowJoinPart([startedPartUserDoNotPlay]);
            }));
        });
        describe('as a player', () => {
            beforeEach(() => {
                // Given an user observing a part as a Player
                ObservedPartServiceMock.setObservedPart(MGPOptional.of({
                    id: startedPartUserPlay.id,
                    role: 'Player',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to join another game', fakeAsync(async() => {
                // And a lobby where the a part user do not play is present
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_PLAYING();
                await shouldForbidToJoinPart([startedPartUserDoNotPlay], reason);
            }));
            it('should allow users to play their games from several tabs', fakeAsync(async() => {
                // And a lobby where the part player plays is present
                await shouldAllowJoinPart([startedPartUserPlay]);
            }));
        });
        describe('as an observer', () => {
            beforeEach(() => {
                // Given an user observing a part as an Observer
                ObservedPartServiceMock.setObservedPart(MGPOptional.of({
                    id: startedPartUserDoNotPlay.id,
                    role: 'Observer',
                    typeGame: 'P4',
                }));
            });
            it('should allow to observe a second part', fakeAsync(async() => {
                // And a lobby where another started part that user do not play is present
                await shouldAllowJoinPart([anotherStartedPartUserDoNotPlay]);
            }));
            it('should allow to observe twice the same part', fakeAsync(async() => {
                // Given a lobby where the connected user is already the observer in this part
                await shouldAllowJoinPart([startedPartUserDoNotPlay]);
            }));
        });
        describe('as a creator', () => {
            beforeEach(() => {
                // Given an user observing a part as a Creator
                ObservedPartServiceMock.setObservedPart(MGPOptional.of({
                    id: unstartedPartUserCreated.id,
                    role: 'Creator',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to observe game while creating another one', fakeAsync(async() => {
                // And a lobby where another started part that user do not play is present
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_CREATING();
                await shouldForbidToJoinPart([startedPartUserDoNotPlay], reason);
            }));
        });
        describe('as a candidate', () => {
            beforeEach(() => {
                // Given an user observing a part as a Candidate
                ObservedPartServiceMock.setObservedPart(MGPOptional.of({
                    id: unstartedPartUserDidNotCreate.id,
                    role: 'Candidate',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to observe game while candidate in another one', fakeAsync((async() => {
                // And a lobby where another unstarted part not linked to user is present
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_CANDIDATE();
                await shouldForbidToJoinPart([anotherUnstartedPartUserDidNotCreate], reason);
            })));
        });
        describe('as chosen opponent', () => {
            beforeEach(() => {
                // Given an user observing a part as a Candidate
                ObservedPartServiceMock.setObservedPart(MGPOptional.of({
                    id: unstartedPartUserDidNotCreate.id,
                    role: 'ChosenOpponent',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to observe game while chosen opponent in another one', fakeAsync((async() => {
                // And a lobby where another unstarted part not linked to user is present
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT();
                await shouldForbidToJoinPart([anotherUnstartedPartUserDidNotCreate], reason);
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
            anotherUnstartedPartUserDidNotCreate = new PartDocument('another-part-user-did-not-createru', PartMocks.OTHER_STARTED);
        }));
        describe('as a user part of no games', () => {
            beforeEach(() => {
                // Given an user not part of any part
                ObservedPartServiceMock.setObservedPart(MGPOptional.empty());
            });
            it('should redirect to /play', fakeAsync(async() => {
                // And a server with one active part
                await shouldAllowJoinPart([unstartedPartUserDidNotCreate]);
            }));
        });
        describe('as a player', () => {
            beforeEach(() => {
                // Given an user already playing a part
                ObservedPartServiceMock.setObservedPart(MGPOptional.of({
                    id: startedPartUserPlay.id,
                    role: 'Player',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to become candidate while already playing another game', fakeAsync(async() => {
                // And a lobby where the connected user is already the Player in one part
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_PLAYING();
                await shouldForbidToJoinPart([unstartedPartUserDidNotCreate], reason);
            }));
        });
        describe('as a creator', () => {
            beforeEach(() => {
                // Given an user already creator of a part
                ObservedPartServiceMock.setObservedPart(MGPOptional.of({
                    id: unstartedPartUserCreated.id,
                    role: 'Creator',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to be candidate while already creating another game', fakeAsync(async() => {
                // And a lobby where another unstarted part not linked to user is present
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_CREATING();
                await shouldForbidToJoinPart([unstartedPartUserDidNotCreate], reason);
            }));
            it('should allow user to have his created part in two tabs', fakeAsync(async() => {
                // And a lobby where the same part is obviously already
                await shouldAllowJoinPart([unstartedPartUserCreated]);
            }));
        });
        describe('as a chosen opponent', () => {
            beforeEach(() => {
                // Given an user observing a part as a chosen opponent
                ObservedPartServiceMock.setObservedPart(MGPOptional.of({
                    id: unstartedPartUserDidNotCreate.id,
                    role: 'ChosenOpponent',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to be candidate while already chosen opponent in another game', fakeAsync(async() => {
                // Given a lobby where the connected user is already the chosen opponent in one part
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT();
                await shouldForbidToJoinPart([anotherUnstartedPartUserDidNotCreate], reason);
            }));
            it('should allow user to be candidate of the same part in several tabs', fakeAsync(async() => {
                // And a lobby where the same part is obviously already
                await shouldAllowJoinPart([unstartedPartUserDidNotCreate]);
            }));
        });
        describe('as a candidate', () => {
            beforeEach(() => {
                // Given an user observing a part as a Candidate
                ObservedPartServiceMock.setObservedPart(MGPOptional.of({
                    id: unstartedPartUserDidNotCreate.id,
                    role: 'Candidate',
                    typeGame: 'P4',
                }));
            });
            it('should forbid user to be candidate in two part as once', fakeAsync(async() => {
                // Given a lobby where the connected user is already the candidate in one part
                const reason: string = GameActionFailure.YOU_ARE_ALREADY_CANDIDATE();
                await shouldForbidToJoinPart([anotherUnstartedPartUserDidNotCreate], reason);
            }));
            it('should allow user to have be candidate of the same part in two tabs', fakeAsync(async() => {
                // And a lobby where the same part is obviously already
                await shouldAllowJoinPart([unstartedPartUserDidNotCreate]);
            }));
        });
    });
    it('should unsubscribe from active parts when destroying component', fakeAsync(async() => {
        // Given the lobby
        const expectUnsubscribeToHaveBeenCalled: () => void =
            prepareUnsubscribeCheck(TestBed.inject(ActivePartsService), 'subscribeToActiveParts');
        testUtils.detectChanges();

        // When it is destroyed
        component.ngOnDestroy();

        // Then it should have unsubscrbed from active parts
        expectUnsubscribeToHaveBeenCalled();
    }));
    it('should unsubscribe from active users when destroying component', fakeAsync(async() => {
        // Given an initialized lobby
        const expectUnsubscribeToHaveBeenCalled: () => void =
            prepareUnsubscribeCheck(TestBed.inject(ActiveUsersService), 'subscribeToActiveUsers');
        testUtils.detectChanges();

        // When it is destroyed
        component.ngOnDestroy();

        // Then it should have unsubscrbed from active users
        expectUnsubscribeToHaveBeenCalled();
    }));
    it('should unsubscribe from observed part when destroying component', fakeAsync(async() => {
        // Given an initialized lobby
        const expectUnsubscribeToHaveBeenCalled: () => void =
            prepareUnsubscribeCheck(TestBed.inject(ObservedPartService), 'subscribeToObservedPart');
        testUtils.detectChanges();

        // When it is destroyed
        component.ngOnDestroy();

        // Then it should have unsubscrbed from active users
        expectUnsubscribeToHaveBeenCalled();
    }));
    it('should display firebase time HH:mm:ss', fakeAsync(async() => {
        // Given a lobby in which we observe tab chat, and where one user is here
        const HH: number = 11 * 3600;
        const mm: number = 34 * 60;
        const ss: number = 56;
        const timeStampInSecond: number = HH + mm + ss;
        const userWithLastUpdateTime: User = {
            ...UserMocks.CREATOR,
            lastUpdateTime: new Timestamp(timeStampInSecond, 0),
        };
        await TestBed.inject(UserDAO).set(UserMocks.CREATOR_AUTH_USER.id, userWithLastUpdateTime);
        tick();
        await testUtils.clickElement('#tab-chat');
        tick();

        // When rendering the board
        testUtils.detectChanges();

        // Then the date should be written in format HH:mm:ss
        const element: DebugElement = testUtils.findElement('#' + UserMocks.CREATOR_MINIMAL_USER.name);
        const time: string = element.nativeElement.innerText;
        const timeAsString: string = formatDate(timeStampInSecond * 1000, 'HH:mm:ss', 'en-US');
        expect(time).toBe(UserMocks.CREATOR_MINIMAL_USER.name + ': ' + timeAsString);
    }));
    it('should display turn for humans', fakeAsync(async() => {
        // Given a server with an existing part
        setLobbyPartList([new PartDocument('started', PartMocks.STARTED)]);

        // When displaying it
        testUtils.detectChanges();

        // Then it should show the turn, starting at turn 0 instead of -1
        testUtils.expectElementToExist('#part_0 > .turn');
        const turn: DebugElement = testUtils.findElement('#part_0 > .turn');
        expect(turn.nativeElement.innerText).toEqual('1');
    }));
});
