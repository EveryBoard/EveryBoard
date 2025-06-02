import { Subscription } from 'rxjs';

import { JSONValue } from '@everyboard/lib';

import { AbstractBackendService, BackendMessage } from '../BackendService';

export class BackendServiceMock extends AbstractBackendService {

    protected override async subscribeTo(subscription: string, gameId?: string): Promise<Subscription> {
        return new Subscription();
    }

    public override async send(message: JSONValue): Promise<void> {
        return;
    }

    public mockReceivedMessage(tag: string, args: JSONValue): void {
        this.receive(new BackendMessage(tag, args));
    }

}
