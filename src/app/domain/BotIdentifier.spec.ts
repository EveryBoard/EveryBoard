import { BotIdentifier, getUserDisplayName } from './BotIdentifier';
import { MinimalUser } from './MinimalUser';

describe('getUserDisplayName', () => {

    it('should return the identifier display name for a bot', () => {
        // Given a bot user and its identifier
        const user: MinimalUser = { id: 'bot-id', name: 'account-name', isBot: true };
        const botIdentifier: BotIdentifier = { displayName: 'Friendly Bot', parameters: {} };

        // When retrieving its display name
        const displayName: string = getUserDisplayName(user, botIdentifier);

        // Then the identifier display name is used
        expect(displayName).toBe('Friendly Bot');
    });

    it('should return the account name for a human', () => {
        // Given a user without a bot identifier
        const user: MinimalUser = { id: 'user-id', name: 'account-name' };

        // When retrieving its display name
        const displayName: string = getUserDisplayName(user, null);

        // Then the account name is used
        expect(displayName).toBe('account-name');
    });

});
