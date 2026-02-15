import { ActivatedRoute } from '@angular/router';

import { MGPOptional, Utils } from '@everyboard/lib';

import { RulesConfig } from '../../jscaip/RulesConfigUtil';
import { GameState } from '../../jscaip/state/GameState';
import { BaseComponent } from '../BaseComponent';
import { GameInfo } from '../normal-component/pick-game/pick-game.component';
import { RulesConfigDescription } from './rules-configuration/RulesConfigDescription';

export abstract class BaseWrapperComponent extends BaseComponent {

    public constructor(public readonly activatedRoute: ActivatedRoute) {
        super();
    }

    protected getGameUrlName(): string {
        return Utils.getNonNullable(this.activatedRoute.snapshot.paramMap.get('game'));
    }

    protected getGameName(): MGPOptional<string> {
        // May be empty if the game does not actually exist
        return GameInfo.getByUrlName(this.getGameUrlName()).map((info: GameInfo) => info.name);
    }

    public getRulesConfigDescription(): MGPOptional<RulesConfigDescription<RulesConfig>> {
        const urlName: string = this.getGameUrlName();
        return this.getRulesConfigDescriptionByName(urlName);
    }

    private getRulesConfigDescriptionByName(gameName: string): MGPOptional<RulesConfigDescription<RulesConfig>> {
        const gameInfos: MGPOptional<GameInfo> = GameInfo.getByUrlName(gameName);
        if (gameInfos.isAbsent()) {
            return MGPOptional.empty();
        } else {
            return gameInfos.get().getRulesConfigDescription();
        }
    }

    public getStateProvider(): MGPOptional<(config: MGPOptional<RulesConfig>) => GameState> {
        return GameInfo.getStateProvider(this.getGameUrlName());
    }

}
