/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { MGPOptional } from '@everyboard/lib';

import { P4Config, P4Rules } from '../../../games/p4/P4Rules';
import { AuthUser } from '../../../services/ConnectedUserService';
import { ConnectedUserServiceMock } from '../../../services/tests/ConnectedUserService.spec';
import { ActivatedRouteStub, expectValidRouting, SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';

import { LocalGameConfigurationComponent } from './local-game-configuration.component';

describe('LocalGameConfigurationComponent', () => {

    let testUtils: SimpleComponentTestUtils<LocalGameConfigurationComponent>;
    const defaultConfig: MGPOptional<P4Config> = P4Rules.get().getDefaultRulesConfig();

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(LocalGameConfigurationComponent, new ActivatedRouteStub('P4'));
    }));

    it('should start the game with default config if we directly press "start"', fakeAsync(async() => {
        // Given a configuration component
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();
        testUtils.detectChanges();

        // When we directly click on "start"
        await testUtils.clickElement('#start-game-with-config');

        // Then it should start the game with the default config
        const expectedRoute: string[] = ['/local', 'P4']; // no config specified means it will use the default config
        expectValidRouting(router, expectedRoute, LocalGameWrapperComponent);
    }));

    it('should support updating config and starting it', fakeAsync(async() => {
        // Given a configuration component with a custom config
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();
        testUtils.detectChanges();

        // custom config happens through updateConfig, called by RulesConfigurationComponent
        const config: P4Config = {
            ...defaultConfig.get(),
            width: 4,
            height: 4,
        };
        await testUtils.getComponent().updateConfig(MGPOptional.of(config));

        // When starting the game
        await testUtils.clickElement('#start-game-with-config');

        // Then it should start the game with the custom config
        const expectedRoute: string[] = ['/local', 'P4'];
        expectValidRouting(router, expectedRoute, LocalGameWrapperComponent, { queryParams: { width: '4', height: '4' } });
    }));

    it('should start with the default config if we change the config and end up with the same as the default', fakeAsync(async() => {
        // Given a configuration component with a custom config, which happens to be the same as the default config
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();
        await testUtils.getComponent().updateConfig(defaultConfig);
        testUtils.detectChanges();

        // When starting the game
        await testUtils.clickElement('#start-game-with-config');

        // Then it should start the game with the custom config
        const expectedRoute: string[] = ['/local', 'P4'];
        expectValidRouting(router, expectedRoute, LocalGameWrapperComponent);
    }));

});

describe('LocalGameConfigurationComponent (configless game)', () => {

    // The atemporal config-less game
    const gameName: string = 'Kamisado';

    it('should directly redirect to the game', fakeAsync(async() => {
        // Given a game without configuration
        const testUtils: SimpleComponentTestUtils<LocalGameConfigurationComponent> =
            await SimpleComponentTestUtils.create(LocalGameConfigurationComponent, new ActivatedRouteStub(gameName));
        ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
        testUtils.prepareFixture(LocalGameConfigurationComponent);
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When loading the component
        testUtils.detectChanges();

        // Then it should start the game directly
        const expectedRoute: string[] = ['/local', gameName];
        expectValidRouting(router, expectedRoute, LocalGameWrapperComponent);
    }));
});
