import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Chat } from '../domain/Chat';
import { ChatDAO } from '../dao/ChatDAO';
import { Message } from '../domain/Message';
import { display } from 'src/app/utils/utils';
import { MGPValidation } from '../utils/MGPValidation';
import { ArrayUtils } from '../utils/ArrayUtils';
import { Localized } from '../utils/LocaleUtils';
import { MGPOptional } from '../utils/MGPOptional';

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

    private followedChatObs: MGPOptional<Observable<MGPOptional<Chat>>> = MGPOptional.empty();

    private followedChatSub: Subscription;

    constructor(private readonly chatDAO: ChatDAO) {
        display(ChatService.VERBOSE, 'ChatService.constructor');
    }
    public startObserving(chatId: string, callback: (chat: MGPOptional<Chat>) => void): void {
        display(ChatService.VERBOSE, 'ChatService.startObserving ' + chatId);

        if (this.followedChatId.isAbsent()) {
            display(ChatService.VERBOSE, '[start watching chat ' + chatId);

            this.followedChatId = MGPOptional.of(chatId);
            this.followedChatObs = MGPOptional.of(this.chatDAO.getObsById(chatId));
            this.followedChatSub = this.followedChatObs.get().subscribe(callback);
        } else if (this.followedChatId.equalsValue(chatId)) {
            throw new Error(`WTF :: Already observing chat '${chatId}'`);
        } else {
            throw new Error(`Cannot ask to watch '${chatId}' while watching '${this.followedChatId.get()}'`);
        }
    }
    public stopObserving(): void {
        if (!this.isObserving()) {
            throw new Error('ChatService.stopObserving should not be called if not observing');
        }
        display(ChatService.VERBOSE, 'stopped watching chat ' + this.followedChatId + ']');
        this.followedChatId = MGPOptional.empty();
        this.followedChatSub.unsubscribe();
        this.followedChatObs = MGPOptional.empty();
    }
    public isObserving(): boolean {
        return this.followedChatId.isPresent();
    }
    public async deleteChat(chatId: string): Promise<void> {
        display(ChatService.VERBOSE, 'ChatService.deleteChat ' + chatId);
        return this.chatDAO.delete(chatId);
    }
    public async createNewChat(id: string): Promise<void> {
        return this.chatDAO.set(id, {
            messages: [],
        });
    }
    public async sendMessage(userName: string, content: string, currentTurn?: number)
    : Promise<MGPValidation> {
        if (this.followedChatId.isAbsent()) {
            return MGPValidation.failure('Cannot send message if not observing chat');
        }
        const chatId: string = this.followedChatId.get();
        if (this.userCanSendMessage(userName, chatId) === false) {
            return MGPValidation.failure(ChatMessages.CANNOT_SEND_MESSAGE());
        }
        if (this.isForbiddenMessage(content)) {
            return MGPValidation.failure(ChatMessages.FORBIDDEN_MESSAGE());
        }
        const chat: Chat = (await this.chatDAO.read(chatId)).get();
        const messages: Message[] = ArrayUtils.copyImmutableArray(chat.messages);
        const newMessage: Message = {
            content,
            sender: userName,
            postedTime: Date.now(),
            currentTurn,
        };
        messages.push(newMessage);
        await this.chatDAO.update(chatId, { messages });
        return MGPValidation.SUCCESS;
    }
    private userCanSendMessage(userName: string, _chatId: string): boolean {
        return userName !== ''; // In practice, no user can have this username. This may be extended to other reasons in the future.
    }
    private isForbiddenMessage(message: string): boolean {
        return (message === '');
    }
    public ngOnDestroy(): void {
        if (this.isObserving()) {
            this.stopObserving();
        }
    }
}
