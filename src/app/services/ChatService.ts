import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IChat, IChatId } from '../domain/ichat';
import { ChatDAO } from '../dao/ChatDAO';
import { IMessage } from '../domain/imessage';
import { assert, display } from 'src/app/utils/utils';
import { MGPValidation } from '../utils/MGPValidation';

export class ChatMessages {
    public static readonly CANNOT_SEND_MESSAGE: string = $localize`You're not allowed to send e massege here.`;

    public static readonly FORBIDDEN_MESSAGE: string = $localize`This message is forbidden.`;
}
@Injectable({
    providedIn: 'root',
})
export class ChatService implements OnDestroy {
    public static VERBOSE: boolean = false;

    private followedChatId: string;

    private followedChatObs: Observable<IChatId>;

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
            throw new Error('WTF :: Already observing chat \'' + chatId + '\'');
        } else {
            throw new Error('Cannot ask to watch \'' + chatId + '\' while watching \'' + this.followedChatId + '\'');
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
        if (this.userCanSendMessage(userName, this.followedChatId) === false) {
            return MGPValidation.failure(ChatMessages.CANNOT_SEND_MESSAGE);
        }
        if (this.isForbiddenMessage(content)) {
            return MGPValidation.failure(ChatMessages.FORBIDDEN_MESSAGE);
        }
        const chat: IChat = await this.chatDao.read(this.followedChatId);
        const messages: IMessage[] = chat.messages;
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
    private userCanSendMessage(userName: string, chatId: string): boolean {
        // TODO FOR REVIEW: should check that user is part of the game or is an observer
        // Quentin: it seems that this should be encoded in the security rules, not in the application logic.
        // If it is not encoded in the security rules, it is possible to craft firebase queries to send messages where we're not supposed to.
        // And if it is encoded, there is duplication between the app logic and the security rules.
        // Also, checking it in the app is useless in the sense that userCanSendMessage *should* never be false: if we reach sendMessage, this is by doing actions that the user can.
        // The best IMHO is: encode it in the security rules, catch "write" failures to firebase in DAO, and propagate that back
        // If we agree, we can remove this check and the corresponding TODO.
        return userName != null;
    }
    private isForbiddenMessage(message: string): boolean {
        // TODO FOR REVIEW: improve? what should be forbidden in a message?
        // Quentin: I think here the only check should be indeed for '', but nothing else.
        // I don't see a reason to forbid anything else.
        // If we agree, we can remove the TODO.
        return (message === '');
    }
    public ngOnDestroy(): void {
        if (this.isObserving()) {
            this.stopObserving();
        }
    }
}
