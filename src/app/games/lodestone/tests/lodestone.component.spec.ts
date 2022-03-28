import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { LodestoneComponent } from '../lodestone.component';

describe('LodestoneComponent', () => {
    let testUtils: ComponentTestUtils<LodestoneComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<LodestoneComponent>('Lodestone');
    }));
    fit('should create', () => {
        testUtils.expectToBeCreated();
    });
});
