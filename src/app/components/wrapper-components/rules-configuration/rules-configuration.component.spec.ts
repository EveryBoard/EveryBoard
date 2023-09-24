/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { RulesConfigurationComponent } from './rules-configuration.component';
import { ActivatedRouteStub, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { MGPValidator, MGPValidators, RulesConfigDescription, defaultRCDC } from '../../normal-component/pick-game/pick-game.component';

describe('RulesConfigurationComponent', () => {

    let testUtils: SimpleComponentTestUtils<RulesConfigurationComponent>;

    let component: RulesConfigurationComponent;

    let isValid: MGPValidator;

    beforeEach(async() => {
        const actRoute: ActivatedRouteStub = new ActivatedRouteStub('whatever-game');
        testUtils = await SimpleComponentTestUtils.create(RulesConfigurationComponent, actRoute);
        component = testUtils.getComponent();
        isValid = MGPValidators.range(1, 99); // TODO MOVE UP
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should immediately emit on initialisation when no config to fill', fakeAsync(async() => {
        // Given a rules config component provided with an empty configuration
        component.rulesConfigDescription = defaultRCDC;
        spyOn(component.updateCallback, 'emit').and.callThrough();

        // When initialising
        testUtils.detectChanges();

        // Then the callback should have emit {}
        const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({});
        expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
    }));

    describe('from active point of view', () => {

        beforeEach(() => {
            component.userIsCreator = true;
        });

        describe('number config', () => {

            beforeEach(() => {
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

            it('should propose a number input when given a config of type number', fakeAsync(async() => {
                // Given a component loaded with a config description having a number

                // When rendering component
                testUtils.detectChanges();
                // Then there should be a number configurator
                testUtils.expectElementToExist('#nombre_config');
            }));

            it('should emit new value when changing value', fakeAsync(async() => {
                // Given a component loaded with a config description
                spyOn(component.updateCallback, 'emit').and.callThrough();
                testUtils.detectChanges();

                // When modifying config
                component.rulesConfigForm.get('nombre')?.setValue(80);

                // Then the resulting value
                const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ nombre: 80, canailleDeBoule: 12 });
                expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
            }));

            it('should emit default value of the non modified fields when modifying another field', fakeAsync(async() => {
                // Given a component loaded with a config description
                spyOn(component.updateCallback, 'emit').and.callThrough();
                testUtils.detectChanges();

                // When modifying another config
                component.rulesConfigForm.get('canailleDeBoule')?.setValue(80);

                // Then the resulting value should be the default, for the unmodified one
                const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ nombre: 5, canailleDeBoule: 80 });
                expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
            }));

            it('should emit an empty optional when applying invalid change', fakeAsync(async() => {
                // Given a component loaded with a config description that has a validator
                spyOn(component.updateCallback, 'emit').and.callThrough();
                testUtils.detectChanges();

                // When modifying config to null or negative
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

            beforeEach(() => {
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

            it('should propose a boolean input when given a config of type boolean', fakeAsync(async() => {
                // Given a component loaded with a config description having a boolean

                // When rendering component
                testUtils.detectChanges();
                // Then there should be a number configurator
                testUtils.expectElementToExist('#booleen_config');
            }));

            it('should emit new value when changing value', fakeAsync(async() => {
                // Given a component loaded with a config description
                spyOn(component.updateCallback, 'emit').and.callThrough();
                testUtils.detectChanges();

                // When modifying config
                component.rulesConfigForm.get('booleen')?.setValue(false);

                // Then the resulting value
                const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ booleen: false, truth: false });
                expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
            }));

            it('should emit default value of the non modified fields when modifying another field', fakeAsync(async() => {
                // Given a component loaded with a config description
                spyOn(component.updateCallback, 'emit').and.callThrough();
                testUtils.detectChanges();

                // When modifying another config
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
                spyOn(component.updateCallback, 'emit').and.callThrough();
                spyOn(ErrorLoggerService, 'logError').and.resolveTo();
                const error: string = 'Only creator should be able to modify rules config';
                testUtils.detectChanges();

                // When modifying config (technically impossible but setValue don't need the HTML possibility to do it)
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
                    truth: true, // TODO check that you display this, not the default
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

            it('should propose a disabled boolean input when given a config of type number', fakeAsync(async() => {
                // Given a component loaded with a config description having a number

                // When rendering component
                testUtils.detectChanges();
                // Then there should be a fieldset, but disabled
                testUtils.expectElementToBeDisabled('#booleen_boolean_config_input');
            }));

            it('should not trigger update callback when changing value and throw', () => {
                // Given a component loaded with a config description having a number filled
                spyOn(component.updateCallback, 'emit').and.callThrough();
                spyOn(ErrorLoggerService, 'logError').and.resolveTo();
                const error: string = 'Only creator should be able to modify rules config';
                testUtils.detectChanges();

                // When modifying config (technically impossible but setValue don't need the HTML possibility to do it)
                // And unit testing that this should not be doable is actually more future proof)
                component.rulesConfigForm.get('booleen')?.setValue(false);
                // Then there should have been no emission, but an error
                expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('RulesConfiguration', error);
                expect(component.updateCallback.emit).not.toHaveBeenCalled();
            });

        });

    });

});
