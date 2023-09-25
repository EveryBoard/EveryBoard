/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { PickGameComponent, RulesConfigDescriptions, defaultRCDC } from './pick-game.component';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('PickGameComponent', () => {

    let testUtils: SimpleComponentTestUtils<PickGameComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(PickGameComponent);
        testUtils.detectChanges();
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('should emit an event when a game has been selected', fakeAsync(async() => {
        spyOn(testUtils.getComponent().pickGame, 'emit').and.callThrough();

        const gameSelection: HTMLSelectElement = testUtils.findElement('#gameType').nativeElement;
        gameSelection.value = gameSelection.options[2].value;
        gameSelection.dispatchEvent(new Event('change'));
        testUtils.detectChanges();

        expect(testUtils.getComponent().pickGame.emit).toHaveBeenCalledWith(gameSelection.options[2].innerText);
    }));

});

describe('RulesConfigDescriptions', () => {

    it('should have a i18nName for each description', () => {
        for (const description of RulesConfigDescriptions.ALL) {
            const fields: RulesConfig = description.getDefaultConfig().config;
            for (const field of Object.keys(fields)) {
                expect(description.translations[field]().length).toBeGreaterThan(0);
            }
        }
    });

    it('should have a internationalised name for each standard config', () => {
        for (const description of RulesConfigDescriptions.ALL.concat(defaultRCDC)) {
            for (const standardConfig of description.standardConfigs) {
                expect(standardConfig.name().length).toBeGreaterThan(0);
            }
        }
    });

});
