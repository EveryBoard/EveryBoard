import { Component, OutputEmitterRef, Signal, WritableSignal, inject, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { Theme, ThemeService } from '../../../services/ThemeService';
import { Language, UserSettingsService } from '../../../services/UserSettingsService';

type SettingOption<T> = { value: T; name: string }

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    imports: [ReactiveFormsModule],
})
export class SettingsComponent {

    private readonly userSettingsService: UserSettingsService = inject(UserSettingsService);
    private readonly themeService: ThemeService = inject(ThemeService);

    public readonly availableLanguages: SettingOption<Language>[] = [
        { value: 'fr', name: 'Français' },
        { value: 'en', name: 'English' },
    ];
    public readonly availableThemes: SettingOption<Theme>[] = [
        { value: 'light', name: $localize`Light` },
        { value: 'dark', name: $localize`Dark` },
    ];
    public readonly currentTheme: Signal<Theme> = this.themeService.theme;
    public readonly currentLanguage: Language;
    public readonly candidateLanguage: WritableSignal<Language | null> = signal(null);
    public readonly settingsClosed: OutputEmitterRef<void> = output();

    public constructor() {
        this.currentLanguage = this.userSettingsService.getLanguage();
    }
    public changeLanguage(event: Event): void {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const selectedLanguage: SettingOption<Language> | undefined =
            this.availableLanguages.find(
                (language: SettingOption<Language>): boolean => language.value === target.value,
            );
        if (selectedLanguage != null && selectedLanguage.value !== this.currentLanguage) {
            this.candidateLanguage.set(selectedLanguage.value);
        } else {
            this.candidateLanguage.set(null);
        }
    }
    public reloadWithCandidateLanguage(): void {
        const candidateLanguage: Language | null = this.candidateLanguage();
        if (candidateLanguage != null) {
            this.userSettingsService.activateLanguage(candidateLanguage);
            this.reload();
        }
    }
    public applyCandidateLanguageNextTime(): void {
        const candidateLanguage: Language | null = this.candidateLanguage();
        if (candidateLanguage != null) {
            this.userSettingsService.scheduleLanguageChange(candidateLanguage);
            this.candidateLanguage.set(null);
            this.settingsClosed.emit();
        }
    }
    public cancelLanguageChange(): void {
        this.candidateLanguage.set(null);
    }
    public changeTheme(event: Event): void {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const selectedTheme: SettingOption<Theme> | undefined =
            this.availableThemes.find((theme: SettingOption<Theme>): boolean => theme.value === target.value);
        if (selectedTheme != null) {
            this.userSettingsService.changeTheme(selectedTheme.value);
            this.themeService.loadTheme(selectedTheme.value);
        }
    }
    private reload(): void {
        // Reload app to apply changes
        window.open(window.location.href, '_self');
    }
}
