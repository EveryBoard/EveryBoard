import { TestBed } from '@angular/core/testing';

import { setupEmulators } from '../../utils/tests/TestUtils.spec';
import { ConfigRoomDAO } from '../ConfigRoomDAO';

describe('ConfigRoomDAO', () => {

    let configRoomDAO: ConfigRoomDAO;

    beforeEach(async() => {
        await setupEmulators();
        configRoomDAO = TestBed.inject(ConfigRoomDAO);
    });
    it('should be created', () => {
        expect(configRoomDAO).toBeTruthy();
    });

});
