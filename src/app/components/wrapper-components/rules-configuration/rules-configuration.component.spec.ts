/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RulesConfigurationComponent } from './rules-configuration.component';
import { ActivatedRouteStub, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { MGPValidators, RulesConfigDescription } from '../../normal-component/pick-game/pick-game.component';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Utils } from 'src/app/utils/utils';
import { KamisadoState } from 'src/app/games/kamisado/KamisadoState';

describe('RulesConfigurationComponent', () => {

    let testUtils: SimpleComponentTestUtils<RulesConfigurationComponent>;

    let component: RulesConfigurationComponent;

    async function chooseSecondConfig(): Promise<void> {
        const selectAI: HTMLSelectElement = testUtils.findElement('#ruleSelect').nativeElement;
        selectAI.value = selectAI.options[1].value;
        selectAI.dispatchEvent(new Event('change'));
        testUtils.detectChanges();
        await testUtils.whenStable();
    }

    beforeEach(async() => {
        const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub('whatever-game');
        testUtils = await SimpleComponentTestUtils.create(RulesConfigurationComponent, activatedRoute);
        component = testUtils.getComponent();
        component.stateType = MGPOptional.of(KamisadoState); // A game needing no config
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display default config', fakeAsync(async() => {
        // Given any component from creator point of view
        component.userIsCreator = true;
        component.rulesConfigDescription = new RulesConfigDescription(
            {
                name: (): string => 'the_default_config_name',
                config: {
                    nombre: 5,
                    canailleDeBoule: 12,
                },
            },
            {
                nombre: (): string => 'nombre',
                canailleDeBoule: (): string => 'canaille',
            }, [
            ], {
                nombre: MGPValidators.range(1, 99),
                canailleDeBoule: MGPValidators.range(1, 99),
            },
        );

        // When displaying it
        testUtils.detectChanges();

        // Then default values should be displayed
        testUtils.expectElementToExist('#the_default_config_name_values');
    }));

    it('should not throw when stateType is missing due to unexisting game', fakeAsync(async() => {
        // Given any component from creator point of view
        component.stateType = MGPOptional.empty();
        component.userIsCreator = true;
        component.rulesConfigDescription = new RulesConfigDescription(
            {
                name: (): string => 'the_default_config_name',
                config: {
                    nombre: 5,
                    canailleDeBoule: 12,
                },
            },
            {
                nombre: (): string => 'nombre',
                canailleDeBoule: (): string => 'canaille',
            }, [
            ], {
                nombre: MGPValidators.range(1, 99),
                canailleDeBoule: MGPValidators.range(1, 99),
            },
        );

        // When displaying it
        testUtils.detectChanges();

        // Then the app-demo-card should simply not be there
        testUtils.expectElementNotToExist('#demoCard');
    }));

    it('should allow to change to another standard config', fakeAsync(async() => {
        // Given any component from creator point of view
        component.userIsCreator = true;
        // And a config with two standard config (the default and the other)
        const secondConfig: RulesConfig = { nombre: 42, canailleDeBoule: 42 };
        component.rulesConfigDescription = new RulesConfigDescription(
            {
                name: (): string => 'the_default_config_name',
                config: {
                    nombre: 5,
                    canailleDeBoule: 12,
                },
            },
            {
                nombre: (): string => 'nombre',
                canailleDeBoule: (): string => 'canaille',
            }, [{
                name: (): string => 'the_other_config_name',
                config: secondConfig,
            }], {
                nombre: MGPValidators.range(1, 99),
                canailleDeBoule: MGPValidators.range(1, 99),
            },
        );
        testUtils.detectChanges();
        spyOn(component.updateCallback, 'emit').and.callThrough();

        // When changing the chosen config
        await chooseSecondConfig();
        expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(MGPOptional.of(secondConfig));
    }));

    describe('modifying custom configuration', () => {

        describe('from active point of view', () => {

            it('should throw when editing non-custom config', fakeAsync(async() => {
                // Given a component for creator where we're not editing "Custom"
                component.userIsCreator = true;
                component.rulesConfigDescription = new RulesConfigDescription(
                    {
                        name: (): string => 'name',
                        config: {
                            nombre: 5,
                        },
                    },
                    {
                        nombre: (): string => 'nombre',
                    }, [
                    ], {
                        nombre: MGPValidators.range(1, 99),
                    },
                );
                spyOn(ErrorLoggerService, 'logError').and.resolveTo();
                testUtils.detectChanges();

                // When modifying a value
                component.rulesConfigForm.get('nombre')?.setValue(80);

                // Then it should throw
                const error: string = 'Only Customifiable config should be modified!';
                expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('RulesConfiguration', error);
            }));

            it('should immediately emit on initialisation when no config to fill', fakeAsync(async() => {
                // Given a rules config component provided with an empty configuration
                component.rulesConfigDescription = RulesConfigDescription.DEFAULT;
                spyOn(component.updateCallback, 'emit').and.callThrough();

                // When initializing
                testUtils.detectChanges();

                // Then the callback should have emit {}
                const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({});
                expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
            }));

            beforeEach(() => {
                component.userIsCreator = true;
            });

            describe('number config', () => {

                beforeEach(async() => {
                    component.rulesConfigDescription = new RulesConfigDescription(
                        {
                            name: (): string => 'name',
                            config: {
                                nombre: 5,
                                canailleDeBoule: 12,
                            },
                        },
                        {
                            nombre: (): string => 'nombre',
                            canailleDeBoule: (): string => 'canaille',
                        }, [
                        ], {
                            nombre: MGPValidators.range(1, 99),
                            canailleDeBoule: MGPValidators.range(1, 99),
                        },
                    );
                    await chooseSecondConfig(); // Hence the Custom
                });

                it('should propose a number input when given a config of type number', fakeAsync(async() => {
                    // Given a component loaded with a config description having a number

                    // When rendering component
                    testUtils.detectChanges();
                    // Then there should be a number configurator
                    testUtils.expectElementToExist('#nombre_config');
                }));

                it('should emit new value when changing value', fakeAsync(async() => {
                    // Given a component loaded with a config description
                    testUtils.detectChanges();

                    // When modifying config
                    spyOn(component.updateCallback, 'emit').and.callThrough();
                    component.rulesConfigForm.get('nombre')?.setValue(80);

                    // Then the resulting value
                    const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ nombre: 80, canailleDeBoule: 12 });
                    expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
                }));

                it('should emit default value of the non modified fields when modifying another field', fakeAsync(async() => {
                    // Given a component loaded with a config description
                    testUtils.detectChanges();

                    // When modifying another config
                    spyOn(component.updateCallback, 'emit').and.callThrough();
                    component.rulesConfigForm.get('canailleDeBoule')?.setValue(80);

                    // Then the resulting value should be the default, for the unmodified one
                    const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ nombre: 5, canailleDeBoule: 80 });
                    expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
                }));

                it('should emit an empty optional when applying invalid change', fakeAsync(async() => {
                    // Given a component loaded with a config description that has a validator
                    testUtils.detectChanges();

                    // When modifying config to null or negative
                    spyOn(component.updateCallback, 'emit').and.callThrough();
                    component.rulesConfigForm.get('nombre')?.setValue(0);

                    // Then the resulting value should not have been emitted
                    expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(MGPOptional.empty());
                }));

                describe('MGPValidators.range', () => {

                    it('should display custom validation error when making the value too small', fakeAsync(async() => {
                        // Given a component loaded with a config description that has a validator
                        testUtils.detectChanges();

                        // When modifying config to zero or negative
                        component.rulesConfigForm.get('nombre')?.setValue(0);

                        // Then the resulting value should not have been emitted
                        expect(testUtils.findElement('#nombre_number_config_error').nativeElement.innerHTML).toEqual('0 is too low, minimum is 1');
                    }));

                    it('should display custom validation error when making the value too big', fakeAsync(async() => {
                        // Given a component loaded with a config description that has a validator
                        testUtils.detectChanges();

                        // When modifying config to 100 or more
                        component.rulesConfigForm.get('nombre')?.setValue(100);

                        // Then the resulting value should not have been emitted
                        expect(testUtils.findElement('#nombre_number_config_error').nativeElement.innerHTML).toEqual('100 is too high, maximum is 99');
                    }));

                    it('should display custom validation error when erasing value', fakeAsync(async() => {
                        // Given a component loaded with a config description that has a validator
                        testUtils.detectChanges();

                        // When erasing value
                        component.rulesConfigForm.get('nombre')?.setValue(null);

                        // Then the resulting value should not have been emitted
                        expect(testUtils.findElement('#nombre_number_config_error').nativeElement.innerHTML).toEqual('Value is mandatory');
                    }));

                });

            });

            describe('boolean config', () => {

                beforeEach(async() => {
                    component.rulesConfigDescription =
                    new RulesConfigDescription(
                        {
                            name: (): string => 'config name',
                            config: {
                                booleen: true,
                                truth: false,
                            },
                        },
                        {
                            booleen: (): string => 'booleen',
                            truth: (): string => 'veritasserum',
                        },
                    );
                    await chooseSecondConfig(); // Hence the Custom
                });

                it('should propose a boolean input when given a config of type boolean', fakeAsync(async() => {
                    // Given a component loaded with a config description having a boolean

                    // When rendering component
                    testUtils.detectChanges();
                    // Then there should be a number configurator
                    testUtils.expectElementToExist('#booleen_config');
                }));

                it('should emit new value when changing value', fakeAsync(async() => {
                    // Given a component loaded with a config description
                    testUtils.detectChanges();

                    // When modifying config
                    spyOn(component.updateCallback, 'emit').and.callThrough();
                    component.rulesConfigForm.get('booleen')?.setValue(false);

                    // Then the resulting value
                    const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ booleen: false, truth: false });
                    expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
                }));

                it('should emit default value of the non modified fields when modifying another field', fakeAsync(async() => {
                    // Given a component loaded with a config description
                    testUtils.detectChanges();

                    // When modifying another config
                    spyOn(component.updateCallback, 'emit').and.callThrough();
                    component.rulesConfigForm.get('truth')?.setValue(true);

                    // Then the resulting value should be the default, for the unmodified one
                    const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ booleen: true, truth: true });
                    expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
                }));

            });

        });

        describe('from passive point of view', () => {

            beforeEach(() => {
                component.userIsCreator = false;
            });

            it('should immediately emit on initialisation when no config to fill', fakeAsync(async() => {
                // Given a rules config component provided with an empty configuration
                component.rulesConfigDescription = RulesConfigDescription.DEFAULT;
                // But a config to display is mandatory for non-creator
                component.rulesConfigToDisplay = {}; // Mandatory even if it's a configless game
                spyOn(component.updateCallback, 'emit').and.callThrough();

                // When initializing
                testUtils.detectChanges();

                // Then the callback should have emit {}
                const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({});
                expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
            }));

            it('should throw at creation if rulesConfigToDisplay is missing', fakeAsync(async() => {
                // Given a component intended for passive user with no config to display
                RulesUtils.expectToThrowAndLog(() => {
                    // When rendering it
                    // Then it should throw
                    testUtils.detectChanges();
                }, 'Config should be provided to non-creator in RulesConfigurationComponent');
            }));

            describe('number config', () => {

                beforeEach(() => {
                    component.rulesConfigToDisplay = {
                        nombre: 5,
                        canailleDeBoule: 12,
                    };
                    component.rulesConfigDescription = new RulesConfigDescription(
                        {
                            name: (): string => 'name',
                            config: {
                                nombre: 5,
                                canailleDeBoule: 12,
                            },
                        },
                        {
                            nombre: (): string => 'nombre',
                            canailleDeBoule: (): string => 'canaille',
                        }, [
                        ], {
                            nombre: MGPValidators.range(1, 99),
                            canailleDeBoule: MGPValidators.range(1, 99),
                        },
                    );
                });

                it('should propose a disabled number input when given a config of type number', fakeAsync(async() => {
                    // Given a component loaded with a config description having a number

                    // When rendering component
                    testUtils.detectChanges();
                    // Then there should be a fieldset, but disabled
                    testUtils.expectElementToBeDisabled('#nombre_number_config_input');
                }));

                it('should not trigger update callback when changing value and throw', () => {
                    // Given a component loaded with a config description having a number filled
                    spyOn(ErrorLoggerService, 'logError').and.resolveTo();
                    const error: string = 'Only creator should be able to modify rules config';
                    testUtils.detectChanges();
                    spyOn(component.updateCallback, 'emit').and.callThrough();

                    // When modifying config
                    // (technically impossible but setValue don't need the HTML possibility to do it)
                    // And unit testing that this should not be doable is actually more future proof)
                    component.rulesConfigForm.get('nombre')?.setValue(80);
                    // Then there should have been no emission, but an error
                    expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('RulesConfiguration', error);
                    expect(component.updateCallback.emit).not.toHaveBeenCalled();
                });

            });

            describe('boolean config', () => {

                beforeEach(() => {
                    component.rulesConfigToDisplay = {
                        booleen: false,
                        truth: true,
                    };
                    component.rulesConfigDescription =
                        new RulesConfigDescription(
                            {
                                name: (): string => 'config name',
                                config: {
                                    booleen: true,
                                    truth: false,
                                },
                            },
                            {
                                booleen: (): string => 'booleen',
                                truth: (): string => 'veritasserum',
                            },
                        );
                });

                it('should display value of the rulesConfigToDisplay, not of the default config', fakeAsync(async() => {
                    // Given a board board on which the config 'booleen' is by default checked
                    // but has been changed and is hence unchecked in the config to display
                    // Also testing the opposite for the config 'truth()
                    const defaultConfig: RulesConfig = component.rulesConfigDescription.getDefaultConfig().config;
                    const configToDisplay: RulesConfig = Utils.getNonNullable(component.rulesConfigToDisplay);
                    expect(configToDisplay['booleen']).toBeFalse();
                    expect(defaultConfig['booleen']).toBeTrue();
                    expect(configToDisplay['truth']).toBeTrue();
                    expect(defaultConfig['truth']).toBeFalse();

                    // When displaying it
                    testUtils.detectChanges();

                    // Then the field should be checked if and only if rulesConfigToDisplay is true
                    const elementBooleen: DebugElement = testUtils.findElement('#booleen_boolean_config_input');
                    expect(elementBooleen.nativeElement.checked).toBeFalsy();
                    const elementTruth: DebugElement = testUtils.findElement('#truth_boolean_config_input');
                    expect(elementTruth.nativeElement.checked).toBeTrue();
                }));

                it('should propose a disabled boolean input when given a config of type number', fakeAsync(async() => {
                    // Given a component loaded with a config description having a number

                    // When rendering component
                    testUtils.detectChanges();
                    // Then there should be a fieldset, but disabled
                    testUtils.expectElementToBeDisabled('#booleen_boolean_config_input');
                }));

                it('should not trigger update callback when changing value and throw', () => {
                    // Given a component loaded with a config description having a number filled
                    spyOn(ErrorLoggerService, 'logError').and.resolveTo();
                    const error: string = 'Only creator should be able to modify rules config';
                    testUtils.detectChanges();
                    spyOn(component.updateCallback, 'emit').and.callThrough();

                    // When modifying config
                    // (technically impossible but setValue don't need the HTML possibility to do it)
                    // And unit testing that this should not be doable is actually more future proof)
                    component.rulesConfigForm.get('booleen')?.setValue(false);
                    // Then there should have been no emission, but an error
                    expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('RulesConfiguration', error);
                    expect(component.updateCallback.emit).not.toHaveBeenCalled();
                });

            });

        });

    });

});
