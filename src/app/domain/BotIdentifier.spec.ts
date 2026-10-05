import { BotIdentifier, getUserDisplayName } from './BotIdentifier';
import { MinimalUser } from './MinimalUser';

describe('getUserDisplayName', () => {

    it('should use the bot display name when an identifier is available', () => {
        // Given a bot user and its identifier
        const user: MinimalUser = { id: 'bot-id', name: 'account-name', isBot: true };
        const botIdentifier: BotIdentifier = { displayName: 'Friendly Bot', parameters: {} };

        // When retrieving its display name
        const displayName: string = getUserDisplayName(user, botIdentifier);

        // Then the identifier display name is used
        expect(displayName).toBe('Friendly Bot');
    });

    it('should use the account name when no bot identifier is available', () => {
        // Given a user without a bot identifier
        const user: MinimalUser = { id: 'user-id', name: 'account-name' };

        // When retrieving its display name
        const displayName: string = getUserDisplayName(user, null);

        // Then the account name is used
        expect(displayName).toBe('account-name');
    });

});
