/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';

import { MGPOptional, Utils } from '@everyboard/lib';

import { LodestoneNode, LodestoneRules } from '../../../games/lodestone/LodestoneRules';
import { P4Move } from '../../../games/p4/P4Move';
import { P4Config, P4Node, P4Rules } from '../../../games/p4/P4Rules';
import { P4State } from '../../../games/p4/P4State';
import { GameNode } from '../../../jscaip/AI/GameNode';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { AbstractRules } from '../../../jscaip/Rules';
import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { Table, TableUtils } from '../../../jscaip/TableUtils';
import { SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { AbstractGameComponent } from '../../game-components/game-component/AbstractGameComponent';
import { TutorialGameWrapperMessages } from '../tutorial-game-wrapper/tutorial-game-wrapper.component';

import { DemoCardWrapperComponent, DemoNodeInfo } from './demo-card-wrapper.component';

describe('DemoCardWrapperComponent', () => {

    let testUtils: SimpleComponentTestUtils<DemoCardWrapperComponent>;

    const defaultConfig: P4Config = P4Rules.get().getDefaultRulesConfig();

    async function loadNode(nodeInfo: DemoNodeInfo): Promise<void> {
        testUtils.setInput('demoNodeInfo', nodeInfo);
        await testUtils.getComponent().ngOnChanges({});
        testUtils.detectChanges();
        tick(1); // Need at least 1ms because of the setTimeout in ngAfterViewInit
    }

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(DemoCardWrapperComponent);
    }));

    it('should display the game interactively from the point of view the current player', fakeAsync(async() => {
        // Given a demo component
        const board: Table<PlayerOrNone> = P4Rules.get().getInitialState(defaultConfig).board; // dummy board

        // When displaying it for a given game
        await loadNode({
            title: 'P4',
            name: 'P4',
            // Current player is player 1
            node: new P4Node(new P4State(board, 1)),
            click: MGPOptional.empty(),
            config: defaultConfig,
        });

        // Then it should display the game
        const game: DebugElement = testUtils.findElement('app-p4');
        expect(game).withContext('game component should be displayed').toBeTruthy();
        // from the point of view of the current player, with interactivity off
        const gameComponent: AbstractGameComponent = testUtils.getComponent().gameComponent;
        expect(gameComponent.getPointOfView()).toBe(Player.ZERO);
        expect(gameComponent.isPlayerTurn()).withContext('Player should not be a player but an observer').toBeFalse();
        expect(gameComponent.isInteractive()).withContext('Interactivity should still be turned on').toBeTrue();
    }));

    it('should simulate clicks', fakeAsync(async() => {
        // Given a demo component
        // When displaying it for a game that has intermediary clicks
        await loadNode({
            title: 'Lodestone',
            name: 'Lodestone',
            node: new LodestoneNode(LodestoneRules.get().getInitialState()),
            click: MGPOptional.of('#lodestone-push-orthogonal-PLAYER_ZERO'),
            config: LodestoneRules.get().getDefaultRulesConfig(),
        });
        // Then it should have performed a click
        testUtils.expectElementToHaveClass('#lodestone-push-orthogonal-PLAYER_ZERO .data-lodestone-main-circle', 'selected-stroke');
    }));

    it('should not allow clicks', fakeAsync(async() => {
        // Given a demo component displayed for a game
        await loadNode({
            title: 'P4',
            name: 'P4',
            node: new GameNode(P4Rules.get().getInitialState(defaultConfig)),
            click: MGPOptional.empty(),
            config: defaultConfig,
        });
        const rules: AbstractRules = testUtils.getComponent().gameComponent.rules;
        spyOn(rules, 'choose').and.callThrough();

        // When trying to perform a click
        await testUtils.expectToDisplayGameMessage(
            TutorialGameWrapperMessages.THIS_IS_A_DEMO(),
            async() => {
                await testUtils.clickElement('#click-2-0');
            },
        );

        // Then it should not call rules.choose
        expect(testUtils.getComponent().gameComponent.rules.choose).not.toHaveBeenCalled();
    }));

    it('should do nothing when you pass', fakeAsync(async() => {
        // Given any starting state of component
        // When passing
        const result: void = await testUtils.getComponent().onCancelMove('not even necessary');
        // Then nothing should have happen (for coverage sake)
        expect(result).withContext('should be null').toBe();
    }));

    it('should reload node when inputs are updated by parents', fakeAsync(async() => {
        // Given a component already initialized with one given set of infos
        await loadNode({
            title: 'P4',
            name: 'P4',
            node: new GameNode(P4Rules.get().getInitialState(defaultConfig)),
            click: MGPOptional.empty(),
            config: defaultConfig,
        });
        testUtils.expectElementNotToExist('#click-0-0 > circle');

        // When loading another component, which triggers ngOnChanges
        const boardWithPiece: Table<PlayerOrNone> = TableUtils.create(7, 6, PlayerOrNone.ZERO);
        const stateWithPieces: P4State = new P4State(boardWithPiece, 42);
        await loadNode({
            title: 'P4',
            name: 'P4',
            node: new GameNode(stateWithPieces),
            click: MGPOptional.empty(),
            config: defaultConfig,
        });
        await testUtils.getComponent().ngOnChanges({});

        // Then we should see that the component has indeed been changed
        testUtils.expectElementToExist('#click-0-0 > circle');
    }));

    it('should not use onLegalUserMove', fakeAsync(async() => {
        spyOn(Utils, 'assert').and.callFake(() => {});
        // Given any demo node
        // When calling onLegalUserMove
        const reason: string = 'DemoCardWrapper should not call applyLegalMove, as it does no move';
        await testUtils.getComponent().onLegalUserMove(null as unknown as P4Move);
        // Then it should throw
        expect(Utils.assert).toHaveBeenCalledOnceWith(false, reason);
    }));

    describe('getConfig', () => {

        it('should provide the demo config to the game component', fakeAsync(async() => {
            // Given a demo card with a specific config
            const demoConfig: P4Config = { width: 4, height: 2 };
            await loadNode({
                title: 'P4',
                name: 'P4',
                node: new P4Node(P4Rules.get().getInitialState(demoConfig)),
                click: MGPOptional.empty(),
                config: demoConfig,
            });

            // When calling getConfig
            const actualConfig: RulesConfig = testUtils.getComponent().getConfig();

            // Then it should return the config carried by the demo
            expect(actualConfig).toBe(demoConfig);
        }));

        it('should update the game component config when the demo changes', fakeAsync(async() => {
            // Given an initialized demo card
            await loadNode({
                title: 'P4',
                name: 'P4',
                node: new P4Node(P4Rules.get().getInitialState(defaultConfig)),
                click: MGPOptional.empty(),
                config: defaultConfig,
            });

            // When its parent provides a demo for another selected config
            const selectedConfig: P4Config = { width: 4, height: 2 };
            await loadNode({
                title: 'P4',
                name: 'P4',
                node: new P4Node(P4Rules.get().getInitialState(selectedConfig)),
                click: MGPOptional.empty(),
                config: selectedConfig,
            });

            // Then the rendered game uses the selected config as well as its initial node
            expect(testUtils.getComponent().gameComponent.config()).toBe(selectedConfig);
        }));

    });

    describe('getPlayer', () => {

        it('should never get called', fakeAsync(async() => {
            // DemoCardWrapper are not allowing clicks.
            // Hence, nowhere any logic needs to check who the current player is,
            // because it's nobody, nobody is doing anything on demo cards !
            // So we just need to cover this here, as we aim for 100% coverage
            expect(testUtils.getComponent().getPlayer()).toBe('no-player');
        }));

    });

});
