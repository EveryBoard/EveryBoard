import { Injectable } from '@angular/core';

import { Debug } from '../utils/Debug';
import { Message } from '../domain/Message';
import { BackendService, BackendMessage } from './BackendService';
import { Subscription } from 'rxjs';

export abstract class AbstractChatService {
    public abstract subscribeToMessages(callback: (message: Message) => void): Subscription;

    public abstract sendMessage(message: string): Promise<void>;
}

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ChatService extends AbstractChatService {

    public constructor(private readonly backendService: BackendService) {
        super();
    }

    public override subscribeToMessages(callback: (message: Message) => void): Subscription {
        // Make a new subscription to receive new messages
        return this.backendService.setCallback('ChatMessage', (message: BackendMessage): void => {
            callback(message.getArgument('message'));
        });
    }

    public override async sendMessage(message: string): Promise<void> {
        await this.backendService.send(['ChatSend', { message }]);
    }

}
