import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { JSONValue, MGPOptional, Utils } from '@everyboard/lib';

import { AbstractGameService } from '../GameService';
import { Game, GameEvent } from 'src/app/domain/Game';

@Injectable({ providedIn: 'root' })
export class GameServiceMock extends AbstractGameService {

    private subscribedCallback: MGPOptional<{
        gameUpdate: (game: Game) => Promise<void>,
        gameEvent: (event: GameEvent, serverTime: number) => Promise<void>,
        error: (reason: string) => void,
    }> = MGPOptional.empty();

    public override async subscribeTo(_gameId: string,
                                      gameUpdate: (game: Game) => Promise<void>,
                                      gameEvent: (event: GameEvent, serverTime: number) => Promise<void>,
                                      error: (reason: string) => void)
    : Promise<Subscription> {
        this.subscribedCallback = MGPOptional.of({
            gameUpdate,
            gameEvent,
            error,
        });
        return new Subscription(() => {
            this.subscribedCallback = MGPOptional.empty();
        });
    }

    public override async createGame(_gameName: string): Promise<string> {
        return 'gameId';
    }

    protected override async gameAction(_action: JSONValue): Promise<void> {
    }

    public async mockGameUpdate(game: Game): Promise<void> {
        Utils.assert(this.subscribedCallback.isPresent(), 'GameServiceMock should be subscribed');
        return this.subscribedCallback.get().gameUpdate(game);
    }

    public async mockGameEvent(event: GameEvent, serverTime: number): Promise<void> {
        Utils.assert(this.subscribedCallback.isPresent(), 'GameServiceMock should be subscribed');
        return this.subscribedCallback.get().gameEvent(event, serverTime);
    }

    public mockError(reason: string): void {
        Utils.assert(this.subscribedCallback.isPresent(), 'GameServiceMock should be subscribed');
        return this.subscribedCallback.get().error(reason);
    }
}
