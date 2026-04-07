import { Injectable, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { Message } from '../domain/Message';
import { Debug } from '../utils/Debug';

import { BackendService, BackendMessage } from './BackendService';

export abstract class AbstractChatService {
    public abstract subscribeToMessages(callback: (message: Message) => void): Subscription;

    public abstract sendMessage(message: string): Promise<void>;
}

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ChatService extends AbstractChatService {

    private readonly backendService: BackendService = inject(BackendService);

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
