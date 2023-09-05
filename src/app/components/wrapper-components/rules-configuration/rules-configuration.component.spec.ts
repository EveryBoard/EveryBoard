import { fakeAsync } from '@angular/core/testing';

import { RulesConfigurationComponent } from './rules-configuration.component';
import { ActivatedRouteStub, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { RulesConfig } from 'src/app/jscaip/ConfigUtil';
import { EventEmitter } from '@angular/core';

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
            component.configDescription = { fields: [{ type: 'number', name: 'nombre', defaultValue: 5 }] };
            component.userIsCreator = true;

            // When rendering component
            testUtils.detectChanges();
            // Then there should be a number configurator
            testUtils.expectElementToExist('#nombre_number_config');
        }));
        fit('should allow to choose value', () => {
            // Given a component loaded with a config description having a number filled
            component.configDescription = { fields: [{ type: 'number', name: 'nombre', defaultValue: 5 }] };
            component.userIsCreator = true;
            spyOn(component.updateCallback, 'emit').and.callFake((rulesConfig: RulesConfig) => {
                console.log('coucou bilette', JSON.stringify(rulesConfig))
            });
            testUtils.detectChanges();

            // When modifying config
            testUtils.fillInput('#nombre_number_config', 9 as unknown as string);

            // Then the resulting value
        });
    });
});
