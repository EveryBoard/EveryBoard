import { async } from '@angular/core/testing';

import { ActivesPartsService } from './ActivesPartsService';
import { PartDAO } from 'src/app/dao/PartDAO';

const partDAOStub = {
};
describe('ActivesPartsService', () => {

    let service: ActivesPartsService;

    beforeEach(() => {
        service = new ActivesPartsService(partDAOStub as PartDAO);
    });
    it('should create', async(() => {
        expect(service).toBeTruthy();
    }));
});