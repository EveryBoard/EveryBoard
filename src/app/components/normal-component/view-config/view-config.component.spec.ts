/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { MGPValidators } from '../../../utils/MGPValidator';
import { ActivatedRouteStub, SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { NumberConfig, RulesConfigDescription } from '../../wrapper-components/rules-configuration/RulesConfigDescription';
import { RulesConfigurationComponent } from '../../wrapper-components/rules-configuration/rules-configuration.component';

import { ViewConfigComponent } from './view-config.component';

describe('ViewConfigComponent', () => {

    let testUtils: SimpleComponentTestUtils<ViewConfigComponent>;

    let component: ViewConfigComponent;

    const rulesConfigDescription: RulesConfigDescription<RulesConfig> =
        new RulesConfigDescription(
            {
                name: (): string => 'default',
                config: {
                    size: new NumberConfig(5, () => 'size', MGPValidators.range(1, 99)),
                },
            },
            [],
        );

    const defaultConfig: RulesConfig = { size: 5 };
    const customConfig: RulesConfig = { size: 42 };

    beforeEach(async() => {
        const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub('whatever-game');
        testUtils = await SimpleComponentTestUtils.create(ViewConfigComponent, activatedRoute);
        component = testUtils.getComponent();
        testUtils.setInput('rulesConfigDescription', rulesConfigDescription);
        testUtils.setInput('gameName', 'whatever-game');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show config when clicking on "show config" (default config)', fakeAsync(async() => {
        // Given a game with default config
        testUtils.setInput('rulesConfig', defaultConfig);
        testUtils.expectElementNotToExist('#rules-config-component');
        // When clicking on "show config" button
        await testUtils.clickElement('#show-config');
        // Then it should show rules config, with the default config selected
        testUtils.expectElementToExist('#rules-config-component');
        const rulesConfigurationComponent: RulesConfigurationComponent =
            testUtils.findElementByDirective(RulesConfigurationComponent).componentInstance;
        expect(rulesConfigurationComponent.rulesConfigToDisplay()).toEqual(defaultConfig);
    }));

    it('should hide config when clicking on close button', fakeAsync(async() => {
        // Given a game with config shown
        testUtils.setInput('rulesConfig', defaultConfig);
        testUtils.expectElementNotToExist('#rules-config-component');
        await testUtils.clickElement('#show-config');
        testUtils.expectElementToExist('#rules-config-component');
        // When clicking on "close config" button
        await testUtils.clickElement('#close-config');
        // Then it should close rules config
        testUtils.expectElementNotToExist('#rules-config-component');
    }));

    it('should show config when clicking on "show config" (custom config)', fakeAsync(async() => {
        // Given a game with custom config
        testUtils.setInput('rulesConfig', customConfig);
        // When clicking on "show config" button
        await testUtils.clickElement('#show-config');
        // Then it should rules config, with the custom config selected
        const rulesConfigurationComponent: RulesConfigurationComponent =
            testUtils.findElementByDirective(RulesConfigurationComponent).componentInstance;
        expect(rulesConfigurationComponent.rulesConfigToDisplay()).toEqual(customConfig);
    }));

    it('should recognize a non-default standard config in a started game', fakeAsync(async() => {
        // Given a started game whose config matches a non-default standard config
        const nonDefaultStandardConfig: RulesConfig = { size: 42 };
        const descriptionWithNonDefaultStandard: RulesConfigDescription<RulesConfig> =
            new RulesConfigDescription(
                rulesConfigDescription.defaultConfigDescription,
                [{
                    name: (): string => 'other standard',
                    config: nonDefaultStandardConfig,
                }],
            );
        testUtils.setInput('rulesConfigDescription', descriptionWithNonDefaultStandard);
        testUtils.setInput('rulesConfig', nonDefaultStandardConfig);

        // When viewing the config after the game has started
        await testUtils.clickElement('#show-config');

        // Then it should show the recognized standard config
        testUtils.expectDropdownOptionToBeSelected('#ruleSelect', 'other standard');
    }));
});
