import { fakeAsync } from '@angular/core/testing';

import { GameConfigurationComponent } from './game-configuration.component';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';

describe('GameConfigurationComponent', () => {

    let testUtils: SimpleComponentTestUtils<GameConfigurationComponent>;

    let component: GameConfigurationComponent;

    beforeEach(async() => {
        testUtils = await SimpleComponentTestUtils.create(GameConfigurationComponent);
        component = testUtils.getComponent();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('number config', () => {
        it('should propose a number imput when given a config of type number', fakeAsync(async() => {
            // Given a component loaded with a config description having a number
            component.config = { fields: [{ type: 'number', name: 'nombre' }] };

            // When rendering component
            testUtils.detectChanges();
            // Then there should be a number configurator
            testUtils.expectElementToExist('#nombre_number_config');
        }));
        it('should allow to choose value', () => {
            // Given a component loaded with a config description having a number filled
            // When finalizing config
            // Then the resulting value
        });
    });
});
