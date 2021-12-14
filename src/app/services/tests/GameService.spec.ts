import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { GameService, StartingPartConfig } from '../GameService';
import { PartDAO } from 'src/app/dao/PartDAO';
import { of } from 'rxjs';
import { ICurrentPartId, IPart, MGPResult, Part } from 'src/app/domain/icurrentpart';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { JoinerDAOMock } from 'src/app/dao/tests/JoinerDAOMock.spec';
import { ChatDAOMock } from 'src/app/dao/tests/ChatDAOMock.spec';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { Player } from 'src/app/jscaip/Player';
import { Request } from 'src/app/domain/request';
import { IJoiner, PartType } from 'src/app/domain/ijoiner';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { AuthenticationService } from '../AuthenticationService';
import { AuthenticationServiceMock } from './AuthenticationService.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { GameServiceMessages } from '../GameServiceMessages';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Utils } from 'src/app/utils/utils';
import { Router } from '@angular/router';
import { MessageDisplayer } from '../message-displayer/MessageDisplayer';
import { JoinerService } from '../JoinerService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import firebase from 'firebase/app';

describe('GameService', () => {

    let service: GameService;

    let partDao: PartDAO;

    const MOVE_1: number = 161;
    const MOVE_2: number = 107;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: '**', component: BlankComponent },
                ]),
                BrowserAnimationsModule,
            ],
            providers: [
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
            ],
        }).compileComponents();
        service = TestBed.inject(GameService);
        partDao = TestBed.inject(PartDAO);
    });
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    it('startObserving should delegate callback to partDao', () => {
        const myCallback: (iPart: ICurrentPartId) => void = (iPart: ICurrentPartId) => {
            expect(iPart.id).toBe('partId');
        };
        spyOn(partDao, 'getObsById').and.returnValue(of({ id: 'partId', doc: {
            typeGame: 'Quarto',
            playerZero: 'creator',
            playerOne: 'joiner',
            turn: 2,
            listMoves: [MOVE_1, MOVE_2],
            result: MGPResult.UNACHIEVED.value,
        } }));
        service.startObserving('partId', myCallback);
        expect(partDao.getObsById).toHaveBeenCalled();
    });
    it('startObserving should throw exception when called while observing ', fakeAsync(async() => {
        await partDao.set('myJoinerId', PartMocks.INITIAL.doc);

        expect(() => {
            service.startObserving('myJoinerId', (_iPart: ICurrentPartId) => {});
            service.startObserving('myJoinerId', (_iPart: ICurrentPartId) => {});
        }).toThrowError('GameService.startObserving should not be called while already observing a game');
    }));
    it('should delegate delete to PartDAO', () => {
        spyOn(partDao, 'delete');
        service.deletePart('partId');
        expect(partDao.delete).toHaveBeenCalled();
    });
    it('should forbid to accept a take back that the player proposed himself', fakeAsync(async() => {
        for (const player of [Player.ZERO, Player.ONE]) {
            const part: Part = new Part({
                typeGame: 'Quarto',
                playerZero: 'creator',
                playerOne: 'joiner',
                turn: 2,
                listMoves: [MOVE_1, MOVE_2],
                request: Request.takeBackAsked(player),
                result: MGPResult.UNACHIEVED.value,
            });
            const result: Promise<void> = service.acceptTakeBack('joinerId', part, player, [0, 1]);
            await expectAsync(result).toBeRejectedWithError('Assertion failure: Illegal to accept your own request.');
        }
    }));
    it('acceptConfig should delegate to joinerService and call startGameWithConfig', fakeAsync(async() => {
        const joinerService: JoinerService = TestBed.inject(JoinerService);
        const joiner: IJoiner = JoinerMocks.WITH_PROPOSED_CONFIG.doc;
        spyOn(joinerService, 'acceptConfig').and.resolveTo();
        spyOn(partDao, 'update').and.resolveTo();

        await service.acceptConfig('partId', joiner);

        expect(joinerService.acceptConfig).toHaveBeenCalled();
    }));
    describe('createGameAndRedirectOrShowError', () => {
        it('should show toast and navigate when creator is offline', fakeAsync(async() => {
            const router: Router = TestBed.inject(Router);
            const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);
            spyOn(router, 'navigate').and.callThrough();
            spyOn(messageDisplayer, 'infoMessage').and.callThrough();
            spyOn(service, 'isUserOffline').and.returnValue(true);

            // when calling it
            expect(await service.createGameAndRedirectOrShowError('whatever')).toBeFalse();
            tick(3000); // needs to be >2999

            // it should toast, and navigate
            expect(messageDisplayer.infoMessage).toHaveBeenCalledOnceWith(GameServiceMessages.USER_OFFLINE());
            expect(router.navigate).toHaveBeenCalledOnceWith(['/login']);

        }));
        it('should show toast and navigate when creator cannot create game', fakeAsync(async() => {
            const router: Router = TestBed.inject(Router);
            const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);
            spyOn(router, 'navigate').and.callThrough();
            spyOn(messageDisplayer, 'infoMessage').and.callThrough();
            spyOn(service, 'isUserOffline').and.returnValue(false);
            spyOn(service, 'canCreateGame').and.returnValue(false);

            // when calling it
            expect(await service.createGameAndRedirectOrShowError('whatever')).toBeFalse();
            tick(3000); // needs to be >2999

            // it should toast, and navigate
            expect(messageDisplayer.infoMessage).toHaveBeenCalledOnceWith(GameServiceMessages.ALREADY_INGAME());
            expect(router.navigate).toHaveBeenCalledOnceWith(['/server']);
        }));
    });
    describe('getStartingConfig', () => {
        it('should put creator first when math.random() is below 0.5', fakeAsync(async() => {
            // given a joiner config asking random start
            const joiner: IJoiner = {
                candidates: ['joiner'],
                chosenPlayer: 'joiner',
                creator: 'creator',
                firstPlayer: 'RANDOM',
                maximalMoveDuration: 10,
                partStatus: 3,
                partType: PartType.BLITZ.value,
                totalPartDuration: 25,
            };

            // when calling getStartingConfig
            spyOn(Math, 'random').and.returnValue(0.4);
            const startConfig: StartingPartConfig = service.getStartingConfig(joiner);

            // then we should have a creator starting the game
            expect(startConfig.playerZero).toBe(joiner.creator);
            expect(startConfig.playerOne).toBe(Utils.getNonNullable(joiner.chosenPlayer));
        }));
        it('should put chosen player first when math.random() is over 0.5', fakeAsync(async() => {
            // given a joiner config asking random start
            const joiner: IJoiner = {
                candidates: ['joiner'],
                chosenPlayer: 'joiner',
                creator: 'creator',
                firstPlayer: 'RANDOM',
                maximalMoveDuration: 10,
                partStatus: 3,
                partType: PartType.BLITZ.value,
                totalPartDuration: 25,
            };

            // when calling getStartingConfig
            spyOn(Math, 'random').and.returnValue(0.6);
            const startConfig: StartingPartConfig = service.getStartingConfig(joiner);

            // then we should have a creator starting the game
            expect(startConfig.playerZero).toBe(Utils.getNonNullable(joiner.chosenPlayer));
            expect(startConfig.playerOne).toBe(joiner.creator);
        }));
    });
    describe('rematch', () => {
        let joinerService: JoinerService;
        let partDao: PartDAO;
        beforeEach(() => {
            joinerService = TestBed.inject(JoinerService);
            partDao = TestBed.inject(PartDAO);
        });
        it('should send request when proposing a rematch', fakeAsync(async() => {
            spyOn(service, 'sendRequest').and.resolveTo();

            await service.proposeRematch('partId', Player.ZERO);

            expect(service.sendRequest).toHaveBeenCalledTimes(1);
        }));
        it('should start with the other player when first player mentionned in previous game', fakeAsync(async() => {
            // given a previous match with creator starting
            const lastPart: ICurrentPartId = {
                id: 'partId',
                doc: {
                    listMoves: [MOVE_1, MOVE_2],
                    playerZero: 'creator',
                    playerOne: 'joiner',
                    result: MGPResult.VICTORY.value,
                    turn: 2,
                    typeGame: 'laMarelle',
                    beginning: { seconds: 17001025123456, nanoseconds: 680000000 },
                    lastMoveTime: { seconds: 2, nanoseconds: 3000000 },
                    loser: 'creator',
                    winner: 'joiner',
                    request: Request.rematchProposed(Player.ZERO),
                },
            };
            const lastGameJoiner: IJoiner = {
                candidates: ['joiner'],
                chosenPlayer: 'joiner',
                creator: 'creator',
                firstPlayer: 'CREATOR',
                maximalMoveDuration: 10,
                partStatus: 3,
                partType: PartType.BLITZ.value,
                totalPartDuration: 25,
            };
            spyOn(service, 'sendRequest').and.resolveTo();
            spyOn(joinerService, 'readJoinerById').and.returnValue(Promise.resolve(lastGameJoiner));
            let called: boolean = false;
            spyOn(partDao, 'set').and.callFake(async(_id: string, element: IPart) => {
                expect(element.playerZero).toEqual(Utils.getNonNullable(lastPart.doc.playerOne));
                expect(element.playerOne).toEqual(Utils.getNonNullable(lastPart.doc.playerZero));
                called = true;
            });

            // when accepting rematch
            await service.acceptRematch(lastPart);

            // then we should have a part created with playerOne and playerZero switched
            expect(called).toBeTrue();
        }));
        it('should start with the other player when first player was random', fakeAsync(async() => {
            // given a previous match with creator starting
            const lastPart: ICurrentPartId = {
                id: 'partId',
                doc: {
                    listMoves: [MOVE_1, MOVE_2],
                    playerZero: 'joiner',
                    playerOne: 'creator',
                    result: MGPResult.VICTORY.value,
                    turn: 2,
                    typeGame: 'laMarelle',
                    beginning: { seconds: 17001025123456, nanoseconds: 680000000 },
                    lastMoveTime: { seconds: 2, nanoseconds: 3000000 },
                    loser: 'creator',
                    winner: 'joiner',
                    request: Request.rematchProposed(Player.ZERO),
                },
            };
            const lastGameJoiner: IJoiner = {
                candidates: ['joiner'],
                chosenPlayer: 'joiner',
                creator: 'creator',
                firstPlayer: 'RANDOM',
                maximalMoveDuration: 10,
                partStatus: 3,
                partType: PartType.BLITZ.value,
                totalPartDuration: 25,
            };
            spyOn(service, 'sendRequest').and.resolveTo();
            spyOn(joinerService, 'readJoinerById').and.returnValue(Promise.resolve(lastGameJoiner));
            let called: boolean = false;
            spyOn(partDao, 'set').and.callFake(async(_id: string, element: IPart) => {
                expect(element.playerZero).toEqual(Utils.getNonNullable(lastPart.doc.playerOne));
                expect(element.playerOne).toEqual(Utils.getNonNullable(lastPart.doc.playerZero));
                called = true;
            });

            // when accepting rematch
            await service.acceptRematch(lastPart);

            // then we should have a part created with playerOne and playerZero switched
            expect(called).toBeTrue();
        }));
    });
    describe('updateDBBoard', () => {
        const part: Part = new Part({
            typeGame: 'Quarto',
            playerZero: 'creator',
            playerOne: 'joiner',
            turn: 1,
            listMoves: [MOVE_1],
            request: null,
            result: MGPResult.UNACHIEVED.value,
        });
        beforeEach(() => {
            spyOn(partDao, 'read').and.resolveTo(MGPOptional.of(part.doc));
            spyOn(partDao, 'update').and.resolveTo();
        });
        it('should add scores to update when scores are present', fakeAsync(async() => {
            // when updating the board with scores
            const scores: [number, number] = [5, 0];
            await service.updateDBBoard('partId', MOVE_2, [0, 0], scores);
            // then the update should contain the scores
            const expectedUpdate: Partial<IPart> = {
                listMoves: [MOVE_1, MOVE_2],
                turn: 2,
                request: null,
                lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
                scorePlayerZero: 5,
                scorePlayerOne: 0,
            };
            expect(partDao.update).toHaveBeenCalledWith('partId', expectedUpdate);
        }));
        it('should include the draw notification if requested', fakeAsync(async() => {
            // when updating the board to notify of a draw
            await service.updateDBBoard('partId', MOVE_2, [0, 0], undefined, true);
            // then the result is set to draw in the update
            const expectedUpdate: Partial<IPart> = {
                listMoves: [MOVE_1, MOVE_2],
                turn: 2,
                request: null,
                lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
                result: MGPResult.DRAW.value,
            };
            expect(partDao.update).toHaveBeenCalledWith('partId', expectedUpdate);
        }));
    });
    afterEach(() => {
        service.ngOnDestroy();
    });
});
