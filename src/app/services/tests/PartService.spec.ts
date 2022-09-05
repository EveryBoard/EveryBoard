import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { PartDAO } from 'src/app/dao/PartDAO';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { Part } from 'src/app/domain/Part';
import { Player } from 'src/app/jscaip/Player';
import { PartService } from '../PartService';

describe('PartService', () => {

    let service: PartService;

    let partDAO: PartDAO;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: PartDAO, useClass: PartDAOMock },
            ],
        }).compileComponents();
        partDAO = TestBed.inject(PartDAO);
        service = TestBed.inject(PartService);
    }));

    describe('updateAndBumpIndex', () => {
        it('Should delegate to update and bump index', async() => {
            // Given a part and an update to make to the part
            spyOn(partDAO, 'update').and.resolveTo();
            const update: Partial<Part> = {
                turn: 42,
            };

            // When calling updateAndBumpIndex
            await service.updateAndBumpIndex('partId', Player.ZERO, 73, update);

            // Then update should have been called with lastUpdate infos added to it
            const expectedUpdate: Partial<Part> = {
                lastUpdate: {
                    index: 74,
                    player: Player.ZERO.value,
                },
                turn: 42,
            };
            expect(partDAO.update).toHaveBeenCalledOnceWith('partId', expectedUpdate);
        });
    });
});
