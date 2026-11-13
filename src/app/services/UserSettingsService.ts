import { Injectable } from '@angular/core';

import { Locale, LocaleUtils } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

export type Language = Locale;


@Injectable({
    providedIn: 'root',
})
export class UserSettingsService {

    private static readonly AVAILABLE_LANGUAGES: Language[] = ['en', 'fr'];
    private static readonly LOCALE_KEY: string = 'locale';
    private static readonly PENDING_LOCALE_KEY: string = 'pendingLocale';

    public changeTheme(theme: string): void {
        localStorage.setItem('theme', theme);
    }
    public getTheme(): MGPOptional<string> {
        return MGPOptional.ofNullable(localStorage.getItem('theme'));
    }
    public activateLanguage(language: Language): void {
        localStorage.setItem(UserSettingsService.LOCALE_KEY, language);
        localStorage.removeItem(UserSettingsService.PENDING_LOCALE_KEY);
    }
    public scheduleLanguageChange(language: Language): void {
        localStorage.setItem(UserSettingsService.PENDING_LOCALE_KEY, language);
    }
    public static applyPendingLanguageChange(): void {
        const pendingLanguage: string | null = localStorage.getItem(UserSettingsService.PENDING_LOCALE_KEY);
        if (UserSettingsService.isLanguage(pendingLanguage)) {
            localStorage.setItem(UserSettingsService.LOCALE_KEY, pendingLanguage);
        }
        localStorage.removeItem(UserSettingsService.PENDING_LOCALE_KEY);
    }
    private static isLanguage(language: string | null): language is Language {
        return language != null &&
            UserSettingsService.AVAILABLE_LANGUAGES.some((available: Language): boolean => available === language);
    }
    public getLanguage(): Language {
        return LocaleUtils.getLocale();
    }
}
