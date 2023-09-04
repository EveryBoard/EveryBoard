import { fakeAsync } from '@angular/core/testing';

import { RulesConfigurationComponent } from './rules-configuration.component';
import { ActivatedRouteStub, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';

describe('RulesConfigurationComponent', () => {

    let testUtils: SimpleComponentTestUtils<RulesConfigurationComponent>;

    let component: RulesConfigurationComponent;

    beforeEach(async() => {
        const actRoute: ActivatedRouteStub = new ActivatedRouteStub('whatever-game');
        testUtils = await SimpleComponentTestUtils.create(RulesConfigurationComponent, actRoute);
        component = testUtils.getComponent();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('number config', () => {
        it('should propose a number imput when given a config of type number', fakeAsync(async() => {
            // Given a component loaded with a config description having a number
            component.config = { fields: [{ type: 'number', name: 'nombre', defaultValue: 5 }] };

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
