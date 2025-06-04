import { Subscription } from 'rxjs';
import { MGPOptional, Utils } from '@everyboard/lib';


import { AbstractChatService } from '../ChatService';
import { Message } from 'src/app/domain/Message';

export class ChatServiceMock extends AbstractChatService {
    private subscribedCallback: MGPOptional<(message: Message) => void> = MGPOptional.empty();

    public override subscribeToMessages(callback: (message: Message) => void): Subscription {
        this.subscribedCallback = MGPOptional.of(callback);
        return new Subscription(() => {
            this.subscribedCallback = MGPOptional.empty();
        });
    }

    public override async sendMessage(message: string): Promise<void> {
    }

    public mockReceiveMessage(message: Message): void {
        Utils.assert(this.subscribedCallback.isPresent(), 'ChatServiceMock should be subscribed');
        this.subscribedCallback.get()(message);
    }
}
