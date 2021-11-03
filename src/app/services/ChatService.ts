import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IChat, IChatId } from '../domain/ichat';
import { ChatDAO } from '../dao/ChatDAO';
import { IMessage } from '../domain/imessage';
import { assert, display, Utils } from 'src/app/utils/utils';
import { MGPValidation } from '../utils/MGPValidation';
import { ArrayUtils } from '../utils/ArrayUtils';
import { Localized } from '../utils/LocaleUtils';

export class ChatMessages {
    public static readonly CANNOT_SEND_MESSAGE: Localized = () => $localize`You're not allowed to send a message here.`;

    public static readonly FORBIDDEN_MESSAGE: Localized = () => $localize`This message is forbidden.`;
}
@Injectable({
    providedIn: 'root',
})
export class ChatService implements OnDestroy {
    public static VERBOSE: boolean = false;

    private followedChatId: string | null;

    private followedChatObs: Observable<IChatId> | null;

    private followedChatSub: Subscription;

    constructor(private chatDao: ChatDAO) {
        display(ChatService.VERBOSE, 'ChatService.constructor');
    }
    public startObserving(chatId: string, callback: (iChat: IChatId) => void): void {
        display(ChatService.VERBOSE, 'ChatService.startObserving ' + chatId);

        if (this.followedChatId == null) {
            display(ChatService.VERBOSE, '[start watching chat ' + chatId);

            this.followedChatId = chatId;
            this.followedChatObs = this.chatDao.getObsById(chatId);
            this.followedChatSub = this.followedChatObs
                .subscribe((onFullFilled: IChatId) => callback(onFullFilled));
        } else if (chatId === this.followedChatId) {
            throw new Error(`WTF :: Already observing chat '${chatId}'`);
        } else {
            throw new Error(`Cannot ask to watch '${chatId}' while watching '${this.followedChatId}'`);
        }
    }
    public stopObserving(): void {
        if (!this.isObserving()) {
            throw new Error('ChatService.stopObserving should not be called if not observing');
        }
        display(ChatService.VERBOSE, 'stopped watching chat ' + this.followedChatId + ']');
        this.followedChatId = null;
        this.followedChatSub.unsubscribe();
        this.followedChatObs = null;
    }
    public isObserving(): boolean {
        return this.followedChatId != null;
    }
    public async deleteChat(chatId: NonNullable<string>): Promise<void> {
        display(ChatService.VERBOSE, 'ChatService.deleteChat ' + chatId);

        assert(chatId != null, 'cannot delete chat of null id');
        return this.chatDao.delete(chatId);
    }
    public async createNewChat(id: string): Promise<void> {
        return this.chatDao.set(id, {
            messages: [],
        });
    }
    public async sendMessage(userName: string, currentTurn: number, content: string): Promise<MGPValidation> {
        if (this.followedChatId == null) {
            return MGPValidation.failure('Cannot send message if not observing chat');
        }
        if (this.userCanSendMessage(userName, this.followedChatId) === false) {
            return MGPValidation.failure(ChatMessages.CANNOT_SEND_MESSAGE());
        }
        if (this.isForbiddenMessage(content)) {
            return MGPValidation.failure(ChatMessages.FORBIDDEN_MESSAGE());
        }
        const chat: IChat = Utils.getNonNullOrFail(await this.chatDao.read(this.followedChatId));
        const messages: IMessage[] = ArrayUtils.copyImmutableArray(chat.messages);
        const newMessage: IMessage = {
            content,
            sender: userName,
            postedTime: Date.now(),
            currentTurn,
        };
        messages.push(newMessage);
        await this.chatDao.update(this.followedChatId, { messages });
        return MGPValidation.SUCCESS;
    }
    private userCanSendMessage(userName: string, _chatId: string): boolean {
        return userName !== '';
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
