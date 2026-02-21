import { TestBed } from '@angular/core/testing';

import { setupEmulators } from '../../utils/tests/TestUtils.spec';
import { PartDAO } from '../PartDAO';

// eslint-disable-next-line max-lines-per-function

describe('PartDAO', () => {

    let partDAO: PartDAO;

    beforeEach(async() => {
        await setupEmulators();
        partDAO = TestBed.inject(PartDAO);
    });

    it('should be created', () => {
        expect(partDAO).toBeTruthy();
    });

});
