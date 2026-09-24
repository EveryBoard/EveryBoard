import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { RulesConfig } from '@everyboard/games';
import { GameState } from '@everyboard/games';
import { RulesConfigDescription } from '@everyboard/games';
import { MGPOptional, Utils } from '@everyboard/lib';

import { BaseComponent } from '../BaseComponent';
import { GameInfo } from '../normal-component/pick-game/GameInfo';


export abstract class BaseWrapperComponent extends BaseComponent {

    protected readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

    protected getGameUrlName(): string {
        return Utils.getNonNullable(this.activatedRoute.snapshot.paramMap.get('game'));
    }

    protected getGameName(): MGPOptional<string> {
        // May be empty if the game does not actually exist
        return GameInfo.getByUrlName(this.getGameUrlName()).map((info: GameInfo) => info.name);
    }

    public getRulesConfigDescription(): RulesConfigDescription<RulesConfig> {
        const urlName: string = this.getGameUrlName();
        return this.getRulesConfigDescriptionByName(urlName);
    }

    private getRulesConfigDescriptionByName(gameName: string): RulesConfigDescription<RulesConfig> {
        const gameInfos: MGPOptional<GameInfo> = GameInfo.getByUrlName(gameName);
        Utils.assert(gameInfos.isPresent(), `Game does not exist: ${gameName}`);
        return gameInfos.get().getRulesConfigDescription();
    }

    public getStateProvider(): MGPOptional<(config: RulesConfig) => GameState> {
        return GameInfo.getStateProvider(this.getGameUrlName());
    }

}
