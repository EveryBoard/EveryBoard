import {Injectable} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {IChat, IChatId} from '../domain/ichat';
import {ChatDAO} from '../dao/ChatDAO';
import {IMessage} from '../domain/imessage';

@Injectable({
	providedIn: 'root'
})
export class ChatService {

	static VERBOSE = false;

	private followedChatId: string;
	private followedChatObs: Observable<IChatId>;
	private followedChatSub: Subscription;

	constructor(private chatDao: ChatDAO) {}

	static isForbiddenMessage(message: string): boolean {
		return (message === ''); // TODO: améliorer ?
	}

	sendMessage(userName: string, turn: number, message: string) {
		if (this.userForbid(this.followedChatId, userName)) {
			if (ChatService.VERBOSE) {
				console.log('you\'re not allow to sent message here');
			}
			return;
		}
		if (ChatService.isForbiddenMessage(message)) {
			if (ChatService.VERBOSE) {
				console.log('HOW DARE YOU SAY THAT !');
			}
			return;
		}
		this.chatDao
			.readChatById(this.followedChatId)
			.then( iChat => {
				const messages: IMessage[] = iChat.messages;
				const newMessage: IMessage = {
					content: message,
					sender: userName,
					postedTime: Date.now(), // timeStamp of the publication time
					lastTurnThen: turn // number of the turn when this was write
				};
				messages.push(newMessage);
				this.chatDao
					.updateChatById(this.followedChatId, {messages: messages})
					.then(onFullFilled => console.log('message envoyé'))
					.catch(onRejected => {
						console.log('envoi du message échoué parceque : ');
						console.log(JSON.stringify(onRejected));
					});
			})
			.catch(onRejected => {
				console.log('could not read chat ' + this.followedChatId + ' because');
				console.log(JSON.stringify(onRejected));
			});
	}

	userForbid(chatId: string, userName: string): boolean {
		return false; // TODO: implémenter le blocage de chat
	}

	startObserving(chatId: string, callback: (iChat: IChatId) => void) {
		if (this.followedChatId == null) {
			if (ChatService.VERBOSE) {
				console.log('[start watching chat ' + chatId);
			}
			this.followedChatId = chatId;
			this.followedChatObs = this.chatDao.getChatObsById(chatId);
			this.followedChatSub = this.followedChatObs
				.subscribe(onFullFilled => callback(onFullFilled));
		} else if (chatId === this.followedChatId) { // Should not append, show a bug
			// TODO: make an exception of this
			console.log('!!!already observing this chat (' + chatId + ')');
		} else { // Should not append either
			// TODO: make an exception of this as well
			alert('!!!we were already observing ' + this.followedChatId + ' then you ask to watch' + chatId + 'you are gross (no I\'m bugged)');
			this.stopObserving();
			this.startObserving(chatId, callback);
		}
	}

	stopObserving() {
		if (this.followedChatId == null) { // Should not append, is a bug
			console.log('!!!we already stop watching doc'); // TODO: make an exception of this
		} else {
			console.log('stopped watching chat ' + this.followedChatId + ']');
			this.followedChatId = null;
			this.followedChatSub.unsubscribe();
			this.followedChatObs = null;
		}
	}

	deleteChat(chatId: string): Promise<void> {
		if (ChatService.VERBOSE) {
			console.log('ChatService.deleteChat ' + chatId);
		}
		return new Promise((resolve, reject) => {
			if (chatId == null) {
				console.log('followed chat id is null');
				reject();
			}
			this.chatDao
				.deleteById(chatId)
				.then(onFullFilled => resolve())
				.catch(onRejected => reject(onRejected));
		});
	}

	// delegate

	set(id: string, chat: IChat) {
		return this.chatDao.set(id, chat);
	}

}
