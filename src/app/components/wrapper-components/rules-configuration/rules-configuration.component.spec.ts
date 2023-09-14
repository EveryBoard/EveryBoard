/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { RulesConfigurationComponent } from './rules-configuration.component';
import { ActivatedRouteStub, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { RulesConfig } from 'src/app/jscaip/ConfigUtil';

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
    it('should immediately emit on initialisation when no config to fill', fakeAsync(async() => {
        // Given a rules config component provided with an empty configuration
        component.rulesConfigDescription = { fields: [] };
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
                component.rulesConfigDescription = { fields: [
                    { name: 'nombre', i18nName: (): string => 'nombre', defaultValue: 5 },
                    { name: 'canailleDeBoule', i18nName: (): string => 'canaille', defaultValue: 12 },
                ] };
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
                component.rulesConfigForm.get('nombre')?.setValue(149);

                // Then the resulting value
                const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ nombre: 149, canailleDeBoule: 12 });
                expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
            }));
            it('should emit default value of the non modified fields when modifying another field', fakeAsync(async() => {
                // Given a component loaded with a config description
                spyOn(component.updateCallback, 'emit').and.callThrough();
                testUtils.detectChanges();

                // When modifying another config
                component.rulesConfigForm.get('canailleDeBoule')?.setValue(149);

                // Then the resulting value should be the default, for the unmodified one
                const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ nombre: 5, canailleDeBoule: 149 });
                expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
            }));
            it('should emit an empty optional when changing value to 0 or bellow', fakeAsync(async() => {
                // Given a component loaded with a config description
                spyOn(component.updateCallback, 'emit').and.callThrough();
                testUtils.detectChanges();

                // When modifying config to null or negative
                component.rulesConfigForm.get('nombre')?.setValue(0);

                // Then the resulting value should not have been emitted
                expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(MGPOptional.empty());
            }));
        });
        describe('boolean config', () => {
            beforeEach(() => {
                component.rulesConfigDescription = { fields: [
                    { name: 'boolean', i18nName: (): string => 'all hail Georges Bool', defaultValue: true },
                    { name: 'truth', i18nName: (): string => 'Truth', defaultValue: false },
                ] };
            });
            it('should propose a boolean input when given a config of type boolean', fakeAsync(async() => {
                // Given a component loaded with a config description having a boolean

                // When rendering component
                testUtils.detectChanges();
                // Then there should be a number configurator
                testUtils.expectElementToExist('#boolean_config');
            }));
            it('should emit new value when changing value', fakeAsync(async() => {
                // Given a component loaded with a config description
                spyOn(component.updateCallback, 'emit').and.callThrough();
                testUtils.detectChanges();

                // When modifying config
                component.rulesConfigForm.get('boolean')?.setValue(false);

                // Then the resulting value
                const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ boolean: false, truth: false });
                expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
            }));
            it('should emit default value of the non modified fields when modifying another field', fakeAsync(async() => {
                // Given a component loaded with a config description
                spyOn(component.updateCallback, 'emit').and.callThrough();
                testUtils.detectChanges();

                // When modifying another config
                component.rulesConfigForm.get('truth')?.setValue(true);

                // Then the resulting value should be the default, for the unmodified one
                const expectedValue: MGPOptional<RulesConfig> = MGPOptional.of({ boolean: true, truth: true });
                expect(component.updateCallback.emit).toHaveBeenCalledOnceWith(expectedValue);
            }));
            // TODO: CHECK IF CLICKING THEM BOOLEAN WORK TOO
        });
    });
    describe('from passive point of view', () => {
        beforeEach(() => {
            component.userIsCreator = false;
            component.rulesConfigToDisplay = {
                nombre: 5,
                canailleDeBoule: 12,
            };
        });
        describe('number config', () => {
            beforeEach(() => {
                component.rulesConfigDescription = { fields: [
                    { name: 'nombre', i18nName: (): string => 'nombre', defaultValue: 5 },
                    { name: 'canailleDeBoule', i18nName: (): string => 'canaille', defaultValue: 12 },
                ] };
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
                component.rulesConfigForm.get('nombre')?.setValue(149);
                // Then there should have been no emission, but an error
                expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('RulesConfiguration', error);
                expect(component.updateCallback.emit).not.toHaveBeenCalled();
            });
        });
        describe('boolean config', () => {
            beforeEach(() => {
                component.rulesConfigDescription = { fields: [
                    { name: 'boolean', i18nName: (): string => 'all hail Georges Bool', defaultValue: true },
                    { name: 'truth', i18nName: (): string => 'Truth', defaultValue: false },
                ] };
            });
            it('should propose a disabled boolean input when given a config of type number', fakeAsync(async() => {
                // Given a component loaded with a config description having a number

                // When rendering component
                testUtils.detectChanges();
                // Then there should be a fieldset, but disabled
                testUtils.expectElementToBeDisabled('#boolean_boolean_config_input');
            }));
            it('should not trigger update callback when changing value and throw', () => {
                // Given a component loaded with a config description having a number filled
                spyOn(component.updateCallback, 'emit').and.callThrough();
                spyOn(ErrorLoggerService, 'logError').and.resolveTo();
                const error: string = 'Only creator should be able to modify rules config';
                testUtils.detectChanges();

                // When modifying config (technically impossible but setValue don't need the HTML possibility to do it)
                // And unit testing that this should not be doable is actually more future proof)
                component.rulesConfigForm.get('boolean')?.setValue(false);
                // Then there should have been no emission, but an error
                expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('RulesConfiguration', error);
                expect(component.updateCallback.emit).not.toHaveBeenCalled();
            });
        });
    });
});
