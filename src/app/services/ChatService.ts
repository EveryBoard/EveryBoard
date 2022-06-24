import { Injectable, OnDestroy } from '@angular/core';
import { ChatDAO } from '../dao/ChatDAO';
import { Message } from '../domain/Message';
import { display } from 'src/app/utils/utils';
import { MGPValidation } from '../utils/MGPValidation';
import { Localized } from '../utils/LocaleUtils';
import { MGPOptional } from '../utils/MGPOptional';
import { Unsubscribe } from '@angular/fire/firestore';
import { ErrorLoggerService } from './ErrorLoggerService';
import { serverTimestamp } from 'firebase/firestore';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { MinimalUser } from '../domain/MinimalUser';
import { assert } from '../utils/assert';

export class ChatMessages {
    public static readonly CANNOT_SEND_MESSAGE: Localized = () => $localize`You're not allowed to send a message here.`;

    public static readonly FORBIDDEN_MESSAGE: Localized = () => $localize`This message is forbidden.`;
}
@Injectable({
    providedIn: 'root',
})
export class ChatService implements OnDestroy {
    public static VERBOSE: boolean = false;

    private followedChatId: MGPOptional<string> = MGPOptional.empty();

    private followedChatUnsubscribe: MGPOptional<Unsubscribe> = MGPOptional.empty();

    constructor(private readonly chatDAO: ChatDAO) {
        display(ChatService.VERBOSE, 'ChatService.constructor');
    }
    public startObserving(chatId: string, callback: FirestoreCollectionObserver<Message>): void {
        display(ChatService.VERBOSE, 'ChatService.startObserving ' + chatId);

        if (this.followedChatId.isAbsent()) {
            display(ChatService.VERBOSE, '[start watching chat ' + chatId);

            this.followedChatId = MGPOptional.of(chatId);
            this.followedChatUnsubscribe = MGPOptional.of(this.chatDAO.subscribeToMessages(chatId, callback));
        } else if (this.followedChatId.equalsValue(chatId)) {
            ErrorLoggerService.logErrorAndFail('ChatService', 'Already observing same chat', { chatId });
        } else {
            ErrorLoggerService.logErrorAndFail('ChatService',
                                               'Already observing another chat',
                                               { chatId, followedChatId: this.followedChatId.get() });
        }
    }
    public stopObserving(): void {
        display(ChatService.VERBOSE, 'stopped watching chat ' + this.followedChatId + ']');
        if (this.followedChatUnsubscribe.isPresent()) {
            this.followedChatId = MGPOptional.empty();
            this.followedChatUnsubscribe.get()();
            this.followedChatUnsubscribe = MGPOptional.empty();
        }
    }
    public isObserving(): boolean {
        return this.followedChatId.isPresent();
    }
    public async deleteChat(chatId: string): Promise<void> {
        display(ChatService.VERBOSE, 'ChatService.deleteChat ' + chatId);
        return this.chatDAO.delete(chatId);
    }
    public async createNewChat(id: string): Promise<void> {
        return this.chatDAO.set(id, {});
    }
    public async sendMessage(sender: MinimalUser, content: string, currentTurn?: number)
    : Promise<MGPValidation> {
        if (this.followedChatId.isAbsent()) {
            return MGPValidation.failure('Cannot send message if not observing chat');
        }
        const chatId: string = this.followedChatId.get();
        if (this.userCanSendMessage(sender.name, chatId) === false) {
            return MGPValidation.failure(ChatMessages.CANNOT_SEND_MESSAGE());
        }
        if (this.isForbiddenMessage(content)) {
            return MGPValidation.failure(ChatMessages.FORBIDDEN_MESSAGE());
        }
        const newMessage: Message = {
            content,
            sender,
            postedTime: serverTimestamp(),
            currentTurn,
        };
        await this.chatDAO.addMessage(chatId, newMessage);
        return MGPValidation.SUCCESS;
    }
    private userCanSendMessage(userName: string, _chatId: string): boolean {
        return userName !== ''; // In practice, no user can have this username. This may be extended to other reasons in the future.
    }
    private isForbiddenMessage(message: string): boolean {
        return (message === '');
    }
    public ngOnDestroy(): void {
        assert(this.followedChatUnsubscribe.isAbsent(), 'ChatService should have unsubscribed before being destroyed');
    }
}
