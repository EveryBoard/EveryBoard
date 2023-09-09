/* eslint-disable max-lines-per-function */
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
            component.rulesConfigDescription = { fields: [{ name: 'nombre', defaultValue: 5 }] };
            component.userIsCreator = true;

            // When rendering component
            testUtils.detectChanges();
            // Then there should be a number configurator
            testUtils.expectElementToExist('#nombre_config');
        }));
        it('should trigger update callback when changing value', fakeAsync(async() => {
            // Given a component loaded with a config description having a number filled
            component.rulesConfigDescription = { fields: [{ name: 'nombre', defaultValue: 5 }] };
            component.userIsCreator = true;
            spyOn(component.updateCallback, 'emit').and.callThrough();
            testUtils.detectChanges();

            // When modifying config
            component.rulesConfigForm.get('nombre')?.setValue(149);

            // Then the resulting value
            expect(component.updateCallback.emit).toHaveBeenCalledOnceWith({ nombre: 149 });
        }));
        it('should trigger update callback with default value when not modifying field', fakeAsync(async() => {
            // Given a component loaded with a config description having a number filled
            component.rulesConfigDescription = { fields: [
                { name: 'nombre', defaultValue: 5 },
                { name: 'canailleDeBoule', defaultValue: 12 },
            ] };
            component.userIsCreator = true;
            spyOn(component.updateCallback, 'emit').and.callThrough();
            testUtils.detectChanges();

            // When modifying another config
            component.rulesConfigForm.get('canailleDeBoule')?.setValue(149);

            // Then the resulting value should be the default, for the unmodified one
            expect(component.updateCallback.emit).toHaveBeenCalledOnceWith({ nombre: 5, canailleDeBoule: 149 });
        }));
    });
});
