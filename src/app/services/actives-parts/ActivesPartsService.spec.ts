import { async } from '@angular/core/testing';

import { ActivesPartsService } from './ActivesPartsService';
import { PartDAO } from 'src/app/dao/part/PartDAO';
import { PartDAOMock } from 'src/app/dao/part/PartDAOMock';

describe('ActivesPartsService', () => {

    let service: ActivesPartsService;

    beforeEach(() => {
        service = new ActivesPartsService(new PartDAOMock() as unknown as PartDAO);
    });
    it('should create', async(() => {
        expect(service).toBeTruthy();
    }));
});