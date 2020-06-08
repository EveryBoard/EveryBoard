import { async } from '@angular/core/testing';

import { ActivesPartsService } from './ActivesPartsService';
import { PartDAO } from 'src/app/dao/part/PartDAO';

const partDAOStub = {
};
describe('ActivesPartsService', () => {

    let service: ActivesPartsService;

    beforeAll(() => {
        ActivesPartsService.IN_TESTING = true;
    });
    beforeEach(() => {
        service = new ActivesPartsService(partDAOStub as PartDAO);
    });
    it('should create', async(() => {
        expect(service).toBeTruthy();
    }));
    afterAll(() => {
        ActivesPartsService.IN_TESTING = false;
    });
});