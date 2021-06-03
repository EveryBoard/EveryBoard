import { fakeAsync, TestBed } from '@angular/core/testing';

import { GameService } from '../GameService';
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
import { IJoiner } from 'src/app/domain/ijoiner';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthenticationService } from '../AuthenticationService';
import { AuthenticationServiceMock } from './AuthenticationService.spec';

describe('GameService', () => {
    let service: GameService;

    let partDao: PartDAO;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                MatSnackBarModule,
                RouterTestingModule.withRoutes([
                    { path: '**', component: BlankComponent },
                ]),
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
        spyOn(partDao, 'getObsById').and.returnValue(of({ id: 'partId', doc: null }));
        service.startObserving('partId', myCallback);
        expect(partDao.getObsById).toHaveBeenCalled();
    });
    it('startObserving should throw exception when called while observing ', fakeAsync(async() => {
        await partDao.set('myJoinerId', PartMocks.INITIAL.doc);

        expect(() => {
            service.startObserving('myJoinerId', (iPart: ICurrentPartId) => {});
            service.startObserving('myJoinerId', (iPart: ICurrentPartId) => {});
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
                listMoves: [107, 161],
                request: Request.takeBackAsked(player),
                result: MGPResult.UNACHIEVED.value,
            });
            const getError: (player: Player) => Promise<string> = async(player: Player) => {
                let errorMessage: string;
                try {
                    await service.acceptTakeBack('joinerId', part, player);
                } catch (error) {
                    errorMessage = error.message;
                }
                return errorMessage;
            };
            const error: string = await getError(player);
            expect(error).toEqual('Assertion failure: Illegal to accept your own request.');
        }
    }));
    it('acceptConfig should delegate to joinerService and call startGameWithConfig', fakeAsync(async() => {
        const joiner: IJoiner = {
            candidatesNames: [],
            creator: 'creator',
            chosenPlayer: 'hisFriend',
            partStatus: 2,
            firstPlayer: 'CREATOR',
        };
        spyOn(service.joinerService, 'acceptConfig').and.returnValue(null);
        spyOn(partDao, 'update').and.returnValue(null);

        await service.acceptConfig('partId', joiner);

        expect(service.joinerService.acceptConfig).toHaveBeenCalled();
    }));
    it('startGameWithConfig should throw when firstPlayer is not a value of FIRST_PLAYER enum', fakeAsync(async() => {
        const joiner: IJoiner = {
            candidatesNames: [],
            creator: 'creator',
            chosenPlayer: 'hisFriend',
            partStatus: 2,
            firstPlayer: 'somethingElse',
        };
        spyOn(service.joinerService, 'acceptConfig').and.returnValue(null);
        spyOn(partDao, 'update').and.returnValue(null);

        let errorMessage: string;
        try {
            await service.acceptConfig('somePart', joiner);
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('Invalid value for FirstPlayer: somethingElse.');
    }));
});
