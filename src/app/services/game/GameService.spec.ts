import { fakeAsync, TestBed } from '@angular/core/testing';

import { GameService } from './GameService';
import { PartDAO } from 'src/app/dao/part/PartDAO';
import { of } from 'rxjs';
import { ICurrentPart, ICurrentPartId } from 'src/app/domain/icurrentpart';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { PartDAOMock } from 'src/app/dao/part/PartDAOMock';
import { JoinerDAO } from 'src/app/dao/joiner/JoinerDAO';
import { JoinerDAOMock } from 'src/app/dao/joiner/JoinerDAOMock';
import { ChatDAOMock } from 'src/app/dao/chat/ChatDAOMock';
import { ChatDAO } from 'src/app/dao/chat/ChatDAO';
import { PartMocks } from 'src/app/domain/PartMocks';
import { Player } from 'src/app/jscaip/player/Player';
import { RequestCode } from 'src/app/domain/request';
import { IJoiner } from 'src/app/domain/ijoiner';

describe('GameService', () => {
    let service: GameService;

    let partDao: PartDAO;

    beforeAll(() => {
        GameService.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || GameService.VERBOSE;
    });
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
            ],
        }).compileComponents();
        service = TestBed.get(GameService);
        partDao = TestBed.get(PartDAO);
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
    it('startObserving should throw exception when called while observing ', async() => {
        await partDao.set('myJoinerId', PartMocks.INITIAL.copy());

        expect(() => {
            service.startObserving('myJoinerId', (iPart: ICurrentPartId) => {});
            service.startObserving('myJoinerId', (iPart: ICurrentPartId) => {});
        }).toThrowError('GameService.startObserving should not be called while already observing a game');
    });
    it('should delegate delete to PartDAO', () => {
        spyOn(partDao, 'delete');
        service.deletePart('partId');
        expect(partDao.delete).toHaveBeenCalled();
    });
    it('should forbid to accept a take back that the player proposed himself', async () => {
        const part: ICurrentPart = {
            typeGame: 'Quarto',
            playerZero: 'creator',
            playerOne: 'joiner',
            turn: 2,
            listMoves: [107, 161],
            request: { code: RequestCode.ZERO_ASKED_TAKE_BACK.toInterface().code },
        };
        const getError: (player: Player) => Promise<string> = async(player: Player) => {
            let errorMessage: string;
            try {
                await service.acceptTakeBack('joinerId', part, player);
            } catch (error) {
                errorMessage = error.message;
            }
            return errorMessage;
        };
        const firstError: string = await getError(Player.ZERO);
        part.request.code = RequestCode.ONE_ASKED_TAKE_BACK.toInterface().code;
        const secondError: string = await getError(Player.ONE);
        expect(firstError).toEqual('Illegal to accept your own request.');
        expect(secondError).toEqual('Illegal to accept your own request.');
    });
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
