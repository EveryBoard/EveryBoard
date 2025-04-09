/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { MGPOptional } from '@everyboard/lib';

import { ComponentTestUtils, expectValidRouting } from 'src/app/utils/tests/TestUtils.spec';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { P4Component } from 'src/app/games/p4/p4.component';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { LocalGameConfigurationComponent } from '../local-game-configuration/local-game-configuration.component';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { P4State } from 'src/app/games/p4/P4State';
import { P4Config, P4Rules } from 'src/app/games/p4/P4Rules';

describe('LocalGameWrapperComponent (rules config phase)', () => {

    let testUtils: ComponentTestUtils<P4Component>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<P4Component>('P4', true);
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        TestBed.inject(ErrorLoggerService);
    }));

    it('should redirect to configuration if the provided config is invalid (due to missing elements)', fakeAsync(async() => {
        // Given a game configured with an invalid config
        const config: MGPOptional<RulesConfig> = MGPOptional.of({
            invalid: true,
        });
        const state: P4State = P4Rules.get().getInitialState(P4Rules.get().getDefaultRulesConfig());

        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When displaying it
        await testUtils.setupState(state, { config });

        // Then it should redirect to the configuration page
        const expectedRoute: string[] = ['/local', 'P4', 'config'];
        expectValidRouting(router, expectedRoute, LocalGameConfigurationComponent);
    }));

    it('should redirect to configuration if the provided config is invalid (due to invalid elements)', fakeAsync(async() => {
        // Given a game configured with an invalid config
        const config: MGPOptional<P4Config> = MGPOptional.of({
            width: -10,
            height: 42,
        });
        const state: P4State = P4Rules.get().getInitialState(P4Rules.get().getDefaultRulesConfig());

        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When displaying it
        await testUtils.setupState(state, { config });

        // Then it should redirect to the configuration page
        const expectedRoute: string[] = ['/local', 'P4', 'config'];
        expectValidRouting(router, expectedRoute, LocalGameConfigurationComponent);
    }));


    it('should redirect to configuration if the provided config is missing elements', fakeAsync(async() => {
        // Given a game configured with a config where all provided elements are valid, but some are missing
        const config: MGPOptional<RulesConfig> = MGPOptional.of({
            width: 4,
        });
        const state: P4State = P4Rules.get().getInitialState(P4Rules.get().getDefaultRulesConfig());

        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When displaying it
        await testUtils.setupState(state, { config });

        // Then it should redirect to the configuration page
        const expectedRoute: string[] = ['/local', 'P4', 'config'];
        expectValidRouting(router, expectedRoute, LocalGameConfigurationComponent);
    }));

    it('should redirect to configuration if the provided config is nesting JSON objects', fakeAsync(async() => {
        // Given a game configured with a config where all provided elements are valid, but some are missing
        const config: MGPOptional<RulesConfig> = MGPOptional.of({
            width: 4,
            height: {
                lol: 42,
            },
        } as unknown as RulesConfig /* we are lying to typescript for the test */);
        const state: P4State = P4Rules.get().getInitialState(P4Rules.get().getDefaultRulesConfig());

        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When displaying it
        await testUtils.setupState(state, { config });

        // Then it should redirect to the configuration page
        const expectedRoute: string[] = ['/local', 'P4', 'config'];
        expectValidRouting(router, expectedRoute, LocalGameConfigurationComponent);
    }));

});
