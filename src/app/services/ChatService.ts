import { Injectable } from '@angular/core';

import { MGPValidation } from '@everyboard/lib';

import { Localized } from '../utils/LocaleUtils';
import { Debug } from '../utils/Debug';
import { Message } from '../domain/Message';
import { BackendService, WebSocketMessage } from './BackendService';
import { Subscription } from 'rxjs';

export class ChatMessages {
    public static readonly CANNOT_SEND_MESSAGE: Localized = () => $localize`You're not allowed to send a message here.`;

    public static readonly FORBIDDEN_MESSAGE: Localized = () => $localize`This message is forbidden.`;
}

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ChatService {

    public constructor(private readonly backendService: BackendService) {
    }

    public async addMessage(message: string): Promise<void> {
        await this.backendService.send(['ChatSend', { message }]);
    }

    public subscribeToMessages(callback: (message: Message) => void): Subscription {
        // Make a new subscription to receive new messages
        this.backendService.setCallback('ChatMessage', (message: WebSocketMessage): void => {
            callback(message.getArgument('message'));
        });
        return new Subscription(() => this.backendService.removeCallback('ChatMessage'));
    }

    public async sendMessage(content: string): Promise<MGPValidation> {
        await this.addMessage(content);
        return MGPValidation.SUCCESS;
    }
}
