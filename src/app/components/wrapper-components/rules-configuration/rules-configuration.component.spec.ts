/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';

import { MGPOptional, Utils, MGPValidation } from '@everyboard/lib';
import { TestUtils } from '@everyboard/lib/testing';

import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { MGPValidators } from '../../../utils/MGPValidator';
import { ActivatedRouteStub, SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';

import { RulesConfigDescription, NumberConfig, BooleanConfig, EnumConfig, RulesConfigDescriptionLocalizable } from './RulesConfigDescription';
import { RulesConfigurationComponent } from './rules-configuration.component';

describe('RulesConfigurationComponent', () => {

    let testUtils: SimpleComponentTestUtils<RulesConfigurationComponent>;

    let component: RulesConfigurationComponent;

    function expectConfigToBeSelected(selectedConfigName: string): void {
        testUtils.expectDropdownOptionToBeSelected('#ruleSelect', selectedConfigName);
    }

    function setConfigValue(configName: string, newValue: string | boolean | number | null): void {
        component.rulesConfigForm.get(configName)?.setValue(newValue);
        tick(1);
    }

    async function selectOption(dropDownName: string, childName: string): Promise<void> {
        await testUtils.selectChildElementOfDropDown(
            '#' + dropDownName + '_enum_config_input',
            dropDownName + '_value_' + childName,
        );
        tick(1);
    }

    function setEditableInput(editable: boolean): void {
        testUtils.setInput('editable', editable);
        testUtils.detectChanges();
        tick(1);
    }

    function setCreatorMode(creatorMode: boolean): void {
        testUtils.setInput('creatorMode', creatorMode);
    }

    function callChooseConfig(configName: string): void {
        (component as unknown as { chooseConfig: (configName: string) => void }).chooseConfig(configName);
    }

    function expectErrorToBe(expectedError: string): void {
        testUtils.expectElementToExist('#form-error');
        const errorElement: DebugElement = testUtils.findElement('#form-error > div');
        expect(errorElement.nativeElement.innerHTML).toEqual(expectedError);
    }

    beforeEach(async() => {
        const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub('whatever-game');
        testUtils = await SimpleComponentTestUtils.create(RulesConfigurationComponent, activatedRoute);
        component = testUtils.getComponent();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    type TestRulesConfig = RulesConfig & {

        nombre: number;

        canailleDeBoule: number;

    };

    const secondConfig: TestRulesConfig = { nombre: 42, canailleDeBoule: 42 };

    const rulesConfigDescriptionWithNumber: RulesConfigDescription<TestRulesConfig> =
        new RulesConfigDescription<TestRulesConfig>(
            {
                name: (): string => 'the_default_config_name',
                config: {
                    nombre: new NumberConfig(5, () => 'nombre', MGPValidators.range(1, 99)),
                    canailleDeBoule: new NumberConfig(12, () => 'canaille', MGPValidators.range(1, 99)),
                },
            }, [{
                name: (): string => 'the_other_config_name',
                config: secondConfig,
            }],
        );

    const rulesConfigDescriptionWithBooleans: RulesConfigDescription<RulesConfig> = new RulesConfigDescription(
        {
            name: (): string => 'config name',
            config: {
                booleen: new BooleanConfig(false, () => 'booleen'),
                truth: new BooleanConfig(false, () => 'veritaserum'),
            },
        },
    );

    const rulesConfigDescriptionWithEnums: RulesConfigDescription<RulesConfig> = new RulesConfigDescription(
        {
            name: (): string => 'config name',
            config: {
                difficulty: new EnumConfig(
                    'EASY',
                    () => 'difficulty',
                    { 'EASY': () => 'EASY', 'MEDIUM': () => 'MEDIUM' },
                ),
                harderDifficulty: new EnumConfig(
                    'MEDIUM',
                    () => 'harderDifficulty',
                    { 'MEDIUM': () => 'MEDIUM', 'HARD': () => 'HARD' },
                ),
            },
        },
    );

    describe('editable behavior', () => {

        beforeEach(fakeAsync(async() => {
            // Given an editable component
            setCreatorMode(true);
            testUtils.setInput('editable', true);
        }));

        it('should display enabled rules selection', fakeAsync(async() => {
            // Given an editable component with a config
            testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);

            // When displaying it

            // Then the rule selection form element should be enabled
            testUtils.expectElementToExist('#ruleSelect');
            testUtils.expectElementToBeEnabled('#ruleSelect');
        }));

        it('should display default config', fakeAsync(async() => {
            // Given an editable component with a config
            testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);

            // When displaying it

            // Then default values should be displayed
            testUtils.expectElementToExist('#the_default_config_name_values');
        }));

        it('should allow to change to another standard config', fakeAsync(async() => {
            // Given an editable component with a config
            testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);

            // Given a game with two standard config (the default and the other)
            testUtils.detectChanges();
            spyOn(component.updateCallback, 'emit').and.callThrough();

            // When changing the chosen config
            await testUtils.chooseConfig('the_other_config_name');
            expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(MGPOptional.of(secondConfig));
            expectConfigToBeSelected('the_other_config_name');
        }));

        it('should not emit from controls that belonged to a previously selected config', fakeAsync(async() => {
            // Given a custom config form that is about to be replaced
            testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
            await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);
            const previousControl: AbstractControl = component.rulesConfigForm.controls['nombre'];
            spyOn(component.updateCallback, 'emit').and.callThrough();

            // When replacing the form with a standard config, then modifying the stale control
            await testUtils.chooseConfig('the_other_config_name');
            previousControl.setValue(80);
            tick(1);

            // Then only the standard config selection should have emitted
            expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(MGPOptional.of(secondConfig));
        }));

        it('should immediately emit on initialization when there is no config to fill', fakeAsync(async() => {
            // Given an editable rules config component provided with no configuration
            testUtils.setInput('rulesConfigDescription', RulesConfigDescription.EMPTY);
            spyOn(component.updateCallback, 'emit').and.callThrough();

            // When initializing
            testUtils.detectChanges();

            // Then the callback should have emit {}
            const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({});
            expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
        }));

        it('should immediately emit on initialization when there is a config because default config is valid', fakeAsync(async() => {
            // Given a rules config component provided with an empty configuration
            testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
            spyOn(component.updateCallback, 'emit').and.callThrough();

            // When initializing
            testUtils.detectChanges();

            // Then the callback should have been called with the default config
            const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({
                nombre: 5,
                canailleDeBoule: 12,
            });
            expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
            expectConfigToBeSelected('the_default_config_name');
        }));

        describe('modifying custom configuration', () => {

            describe('number config', () => {

                it('should propose a number input when given a config of type number', fakeAsync(async() => {
                    // Given a chosen customizable config
                    testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
                    await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);

                    // When rendering component
                    testUtils.detectChanges();

                    // Then there should be a number configurator
                    testUtils.expectElementToExist('#nombre_config');
                    testUtils.expectElementToExist('#nombre_number_config_input');
                }));

                it('should emit new config when changing value', fakeAsync(async() => {
                    // Given a chosen customizable config
                    testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
                    await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);
                    testUtils.detectChanges();

                    // When modifying config
                    spyOn(component.updateCallback, 'emit').and.callThrough();
                    setConfigValue('nombre', 80);

                    // Then the resulting value should be updated
                    const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ nombre: 80, canailleDeBoule: 12 });
                    expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
                    // And the name of the config should be to 'Custom'
                    expectConfigToBeSelected(component.CUSTOM_CONFIG_NAME);
                }));

                it('should emit default value of the non modified fields when modifying another field', fakeAsync(async() => {
                    // Given a chosen customizable config
                    testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
                    await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);
                    testUtils.detectChanges();

                    // When modifying another config
                    spyOn(component.updateCallback, 'emit').and.callThrough();
                    setConfigValue('canailleDeBoule', 80);

                    // Then the resulting value should be the default, for the unmodified one
                    const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ nombre: 5, canailleDeBoule: 80 });
                    expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
                    // And the name of the config should be to 'Custom'
                    expectConfigToBeSelected(component.CUSTOM_CONFIG_NAME);
                }));

                it('should emit an empty optional when applying invalid change', fakeAsync(async() => {
                    // Given a chosen customizable config
                    testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
                    await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);
                    testUtils.detectChanges();

                    // When modifying config to zero or negative
                    spyOn(component.updateCallback, 'emit').and.callThrough();
                    setConfigValue('nombre', 0);

                    // Then an optional should have been emitted to inform parent that child is failing math class !
                    expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(MGPOptional.empty());
                    expectConfigToBeSelected(component.CUSTOM_CONFIG_NAME);
                }));

                describe('MGPValidators.range', () => {

                    it('should display custom validation error when making the value too small', fakeAsync(async() => {
                        // Given a chosen customizable config
                        testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
                        await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);
                        testUtils.detectChanges();

                        // When modifying config to below the validator lower bound
                        spyOn(component.updateCallback, 'emit').and.callThrough();
                        setConfigValue('nombre', 0);

                        // Then error reason should have been displayed
                        expect(testUtils.findElement('#nombre-error').nativeElement.innerHTML).toEqual('0 is too small, the minimum is 1');
                        // and the component should have emitted an empty optional
                        expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(MGPOptional.empty());
                        expectConfigToBeSelected(component.CUSTOM_CONFIG_NAME);
                    }));

                    it('should display custom validation error when making the value too big', fakeAsync(async() => {
                        // Given a chosen customizable config
                        testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
                        await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);
                        testUtils.detectChanges();

                        // When modifying config to above the validator upper bound
                        spyOn(component.updateCallback, 'emit').and.callThrough();
                        setConfigValue('nombre', 100);

                        // Then error reason should have been displayed
                        expect(testUtils.findElement('#nombre-error').nativeElement.innerHTML).toEqual('100 is too big, the maximum is 99');
                        // and the component should have emitted an empty optional
                        expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(MGPOptional.empty());
                        expectConfigToBeSelected(component.CUSTOM_CONFIG_NAME);
                    }));

                    it('should display custom validation error when erasing value', fakeAsync(async() => {
                        // Given a chosen customizable config
                        testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
                        await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);
                        testUtils.detectChanges();

                        // When erasing value
                        spyOn(component.updateCallback, 'emit').and.callThrough();
                        setConfigValue('nombre', null);

                        // Then error reason should have been displayed
                        expect(testUtils.findElement('#nombre-error').nativeElement.innerHTML).toEqual('This value is mandatory');
                        // and the component should have emitted an empty optional
                        expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(MGPOptional.empty());
                        expectConfigToBeSelected(component.CUSTOM_CONFIG_NAME);
                    }));

                });

            });

            describe('boolean config', () => {

                it('should propose a boolean input when given a config of type boolean', fakeAsync(async() => {
                    // Given an editable component with a boolean config option
                    testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithBooleans);
                    await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);

                    // When rendering component
                    testUtils.detectChanges();

                    // Then there should be a boolean configurator
                    testUtils.expectElementToExist('#booleen_config');
                    testUtils.expectElementToExist('#booleen_boolean_config_input');
                }));

                it('should emit new value when changing value', fakeAsync(async() => {
                    // Given an editable component with a boolean config option
                    testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithBooleans);
                    await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);
                    testUtils.detectChanges();

                    // When modifying config
                    spyOn(component.updateCallback, 'emit').and.callThrough();
                    setConfigValue('booleen', false);

                    // Then the resulting value should be updated
                    const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ booleen: false, truth: false });
                    expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
                    expectConfigToBeSelected(component.CUSTOM_CONFIG_NAME);
                }));

                it('should emit default value of the non modified fields when modifying another field', fakeAsync(async() => {
                    // Given an editable component with a boolean config option
                    testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithBooleans);
                    await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);

                    // When modifying another config
                    spyOn(component.updateCallback, 'emit').and.callThrough();
                    setConfigValue('truth', true);

                    // Then the resulting value should be the default, from the unmodified one
                    const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ booleen: false, truth: true });
                    expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
                    expectConfigToBeSelected(component.CUSTOM_CONFIG_NAME);
                }));

            });

            describe('enum config', () => {

                it('should propose a drop down input when given a config of type enum', fakeAsync(async() => {
                    // Given an editable component with a enum config option
                    testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithEnums);
                    await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);

                    // When rendering component
                    testUtils.detectChanges();

                    // Then there should be a enum configurator
                    testUtils.expectElementToExist('#difficulty_config');
                    testUtils.expectElementToExist('#difficulty_enum_config_input');
                }));

                it('should emit new value when changing value', fakeAsync(async() => {
                    // Given an editable component with a boolean config option
                    testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithEnums);
                    await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);
                    testUtils.detectChanges();

                    // When modifying config
                    spyOn(component.updateCallback, 'emit').and.callThrough();
                    await selectOption('harderDifficulty', 'HARD');

                    // Then the resulting value should be updated
                    const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ difficulty: 'EASY', harderDifficulty: 'HARD' });
                    expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
                    expectConfigToBeSelected(component.CUSTOM_CONFIG_NAME);
                }));

                it('should have a select that you cannot change', fakeAsync(async() => {
                    // Given an editable component with a boolean config option
                    // but not in "custom" mode, so the fields should be disabled
                    testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithEnums);
                    testUtils.detectChanges();

                    // When rendering config
                    // Then the select should be disabled
                    testUtils.expectElementToBeDisabled('#harderDifficulty_enum_config_input');
                }));

            });

            describe('multi-field change', () => {

                const rulesConfigDescriptionWithMultiFieldValidation: RulesConfigDescription<TestRulesConfig> =
                    new RulesConfigDescription(
                        {
                            name: (): string => 'config name',
                            config: {
                                nombre: new NumberConfig(40, () => 'nombre', MGPValidators.range(1, 99)),
                                canailleDeBoule: new NumberConfig(50, () => 'canaille', MGPValidators.range(1, 99)),
                            },
                            validators: [
                                (config: TestRulesConfig): MGPValidation => {
                                    if ((config.nombre + config.canailleDeBoule) > 100) {
                                        return MGPValidation.failure('The sum of both fields must be <= 100');
                                    } else {
                                        return MGPValidation.SUCCESS;
                                    }
                                },
                            ],
                        }, [{
                            name: (): string => 'the_other_config_name',
                            config: { nombre: 42, canailleDeBoule: 42 },
                        }],
                    );

                it('should not emit when a multiple field validator fails', fakeAsync(async() => {
                    // Given a rules config description with two number fields whose sum must be <= 100
                    testUtils.setInput('rulesConfigDescription',
                                       rulesConfigDescriptionWithMultiFieldValidation);
                    await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);
                    testUtils.detectChanges();
                    spyOn(component.updateCallback, 'emit').and.callThrough();

                    // When modifying a field so that the sum of both is > 100
                    setConfigValue('canailleDeBoule', 80);

                    // Then the component should not emit anything because the multi-field validation fails
                    expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(MGPOptional.empty());
                    expectConfigToBeSelected(component.CUSTOM_CONFIG_NAME);
                }));

                it('should display multi-field failure reason', fakeAsync(async() => {
                    // Given a rules config description with two number fields whose sum must be <= 100
                    testUtils.setInput('rulesConfigDescription',
                                       rulesConfigDescriptionWithMultiFieldValidation);
                    await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);
                    testUtils.detectChanges();
                    spyOn(component.updateCallback, 'emit').and.callThrough();

                    // When modifying a field so that the sum of both is > 100
                    setConfigValue('canailleDeBoule', 80);

                    // Then the component should not emit anything because the multi-field validation fails
                    expectErrorToBe('The sum of both fields must be &lt;= 100');
                }));

            });

        });

    });

    describe('non-editable behavior', () => {

        beforeEach(() => {
            // Given a component in non-editable mode
            setCreatorMode(false);
            testUtils.setInput('editable', false);
            // rulesConfigToDisplay is mandatory whenever the component is not editable
            testUtils.setInput('rulesConfigToDisplay', rulesConfigDescriptionWithNumber.getDefaultConfig().config);
        });

        it('should display options in a disabled style', fakeAsync(async() => {
            // Given a component with some config
            testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);

            // When displaying it
            testUtils.detectChanges();

            // Then rulesSelect should not be present
            testUtils.expectElementToExist('#ruleSelect');
            testUtils.expectElementToBeDisabled('#ruleSelect');
        }));

        it('should immediately emit on initialization when no config to fill', fakeAsync(async() => {
            // Given a rules config component provided with an empty configuration
            testUtils.setInput('rulesConfigDescription', RulesConfigDescription.EMPTY);
            spyOn(component.updateCallback, 'emit').and.callThrough();

            // When initializing
            testUtils.detectChanges();

            // Then the callback should have emit {}
            const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({});
            expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
        }));

        describe('modifying custom configuration', () => {

            it('should throw at initialization if rulesConfigToDisplay is missing', fakeAsync(async() => {
                // Given a component intended for non-creator user with no config to display
                testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
                testUtils.setInput('rulesConfigToDisplay', undefined);

                TestUtils.expectToThrowAndLog(() => {
                    // When rendering it
                    testUtils.detectChanges();
                    // Then it should throw
                }, 'Config should be provided if RulesConfigurationComponent is not editable');
            }));

            it('should recognize default config even when custom', () => {
                // Given a displayed "custom" config that match a standard config named 'the_other_config_name'
                testUtils.setInput('rulesConfigToDisplay', {
                    nombre: 42,
                    canailleDeBoule: 42,
                });
                testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);

                // When rendering component
                testUtils.detectChanges();

                // Then the name of the config should still be to 'the_other_config_name'
                expectConfigToBeSelected('the_other_config_name');
            });

            it('should recognize real custom config when the localized custom label is translated', () => {
                // Given a displayed config that match no other config
                spyOn(RulesConfigDescriptionLocalizable, 'CUSTOM').and.returnValue('Personnalisé');
                testUtils.setInput('rulesConfigToDisplay', {
                    nombre: 1,
                    canailleDeBoule: 99,
                });
                testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);

                // When rendering component
                testUtils.detectChanges();

                // Then the name of the config should be 'Custom'
                expectConfigToBeSelected(component.CUSTOM_CONFIG_NAME);
                expect(testUtils.findElement('#config-dropdown-custom').nativeElement.innerText).toEqual('Custom');
            });

            describe('number config', () => {

                it('should propose a disabled number input', fakeAsync(async() => {
                    // Given a component loaded with a config description having a number
                    testUtils.setInput('rulesConfigToDisplay', {
                        nombre: 5,
                        canailleDeBoule: 12,
                    });
                    testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);

                    // When rendering component
                    testUtils.detectChanges();

                    // Then there should be a fieldset, but disabled
                    testUtils.expectElementToBeDisabled('#nombre_number_config_input');
                }));

            });

            describe('boolean config', () => {

                it('should display value of the rulesConfigToDisplay, not of the default config', fakeAsync(async() => {
                    // Given a board board on which the config 'booleen' is by default checked
                    // but has been changed and is hence unchecked in the config to display
                    // Also testing the opposite for the config 'truth'
                    testUtils.setInput('rulesConfigToDisplay', {
                        booleen: true,
                        truth: true,
                    });
                    testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithBooleans);
                    const defaultConfig: RulesConfig =
                        component.rulesConfigDescription().getDefaultConfig().config;
                    const configToDisplay: RulesConfig = Utils.getNonNullable(component.rulesConfigToDisplay());
                    // eslint-disable-next-line dot-notation
                    expect(configToDisplay['booleen']).toBeTrue();
                    // eslint-disable-next-line dot-notation
                    expect(configToDisplay['truth']).toBeTrue();
                    // eslint-disable-next-line dot-notation
                    expect(defaultConfig['booleen']).toBeFalse();
                    // eslint-disable-next-line dot-notation
                    expect(defaultConfig['truth']).toBeFalse();

                    // When displaying it
                    testUtils.detectChanges();

                    // Then the field should be checked if and only if rulesConfigToDisplay is true
                    const elementBooleen: DebugElement = testUtils.findElement('#booleen_boolean_config_input');
                    expect(elementBooleen.nativeElement.checked).toBeTrue();
                    const elementTruth: DebugElement = testUtils.findElement('#truth_boolean_config_input');
                    expect(elementTruth.nativeElement.checked).toBeTrue();
                }));

                it('should propose a disabled boolean input', fakeAsync(async() => {
                    // Given a component loaded with a config description having a boolean
                    testUtils.setInput('rulesConfigToDisplay', {
                        booleen: true,
                        truth: true,
                    });
                    testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithBooleans);

                    // When rendering component
                    testUtils.detectChanges();

                    // Then there should be a fieldset, but disabled
                    testUtils.expectElementToBeDisabled('#booleen_boolean_config_input');
                }));

            });

        });

    });

    it('should be able switch from editable to non-editable', fakeAsync(async() => {
        // Given an editable component with some custom config
        setCreatorMode(true);
        testUtils.setInput('editable', true);
        testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
        testUtils.setInput('rulesConfigToDisplay', rulesConfigDescriptionWithNumber.getDefaultConfig().config);
        await testUtils.chooseConfig(component.CUSTOM_CONFIG_NAME);

        // When switching to non-editable
        setEditableInput(false);

        // Then it should disable the fields
        testUtils.expectElementToBeDisabled('#nombre_number_config_input');
    }));

    it('should be able to switch from non-editable to editable', fakeAsync(async() => {
        // Given a non-editable component with some custom config
        setCreatorMode(true);
        testUtils.setInput('editable', false);
        testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
        testUtils.setInput('rulesConfigToDisplay', {
            nombre: 1,
            canailleDeBoule: 99,
        });
        testUtils.detectChanges();

        // When switching to editable
        setEditableInput(true);

        // Then it should enable the fields
        testUtils.expectElementToBeEnabled('#nombre_number_config_input');
    }));

    it('should do nothing when switching from non-editable to non-editable', fakeAsync(async() => {
        // Given a non-editable component with some custom config
        setCreatorMode(true);
        testUtils.setInput('editable', false);
        testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
        testUtils.setInput('rulesConfigToDisplay', {
            nombre: 1,
            canailleDeBoule: 99,
        });
        testUtils.detectChanges();

        // When switching to non-editable
        setEditableInput(false);

        // Then the fields remain disabled
        testUtils.expectElementToBeDisabled('#nombre_number_config_input');
    }));

    it('should update displayed config when creator review config changes while mounted', fakeAsync(async() => {
        // Given a mounted creator component in non-editable review mode
        setCreatorMode(true);
        testUtils.setInput('editable', false);
        testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
        testUtils.setInput('rulesConfigToDisplay', rulesConfigDescriptionWithNumber.getDefaultConfig().config);
        testUtils.detectChanges();

        // When the config to display changes
        testUtils.setInput('rulesConfigToDisplay', secondConfig);
        testUtils.detectChanges();
        tick(1);

        // Then the displayed read-only form is refreshed
        expectConfigToBeSelected('the_other_config_name');
        expect(component.rulesConfigForm.controls['nombre'].value).toEqual(42);
        expect(component.rulesConfigForm.controls['canailleDeBoule'].value).toEqual(42);
        testUtils.expectElementToBeDisabled('#nombre_number_config_input');
    }));

    it('should throw when trying to select a config outside creator mode', fakeAsync(async() => {
        // Given a read-only component
        setCreatorMode(false);
        testUtils.setInput('editable', false);
        testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
        testUtils.setInput('rulesConfigToDisplay', rulesConfigDescriptionWithNumber.getDefaultConfig().config);
        testUtils.detectChanges();

        TestUtils.expectToThrowAndLog(() => {
            callChooseConfig(component.CUSTOM_CONFIG_NAME);
        }, 'RulesConfigurationComponent should only allow creator to choose config');
    }));

    it('should throw when trying to select a config while not editable', fakeAsync(async() => {
        // Given a creator component currently in review mode
        setCreatorMode(true);
        testUtils.setInput('editable', false);
        testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);
        testUtils.setInput('rulesConfigToDisplay', rulesConfigDescriptionWithNumber.getDefaultConfig().config);
        testUtils.detectChanges();

        TestUtils.expectToThrowAndLog(() => {
            callChooseConfig(component.CUSTOM_CONFIG_NAME);
        }, 'RulesConfigurationComponent should only allow choosing config while editable');
    }));

    it('should throw when configured as editable outside creator mode', fakeAsync(async() => {
        // Given an invalid input combination
        setCreatorMode(false);
        testUtils.setInput('editable', true);
        testUtils.setInput('rulesConfigDescription', rulesConfigDescriptionWithNumber);

        TestUtils.expectToThrowAndLog(() => {
            testUtils.detectChanges();
        }, 'RulesConfigurationComponent should not be editable when not in creator mode');
    }));

});
