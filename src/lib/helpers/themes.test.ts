import { Themes } from '$enums';
import { getThemeByTagName } from '$lib/helpers/themes';
import { describe, expect, it } from 'vitest';

describe('Test helper: Themes', () => {
    describe('Test getThemeByTagName', () => {
        it('returns correct theme for known tag', () => {
            expect(getThemeByTagName('lt-architecture')).toBe(Themes.Architecture);
            expect(getThemeByTagName('lt-culture')).toBe(Themes.Culture);
            expect(getThemeByTagName('lt-education')).toBe(Themes.Education);
            expect(getThemeByTagName('lt-famille')).toBe(Themes.Family);
            expect(getThemeByTagName('lt-gastronomie')).toBe(Themes.Gastronomy);
            expect(getThemeByTagName('lt-lacustre')).toBe(Themes.Lacustrine);
            expect(getThemeByTagName('lt-nature')).toBe(Themes.Nature);
            expect(getThemeByTagName('lt-sport')).toBe(Themes.Sport);
            expect(getThemeByTagName('lt-durabilite')).toBe(Themes.Sustainability);
            expect(getThemeByTagName('lt-insolite')).toBe(Themes.Unusual);
            expect(getThemeByTagName('lt-bien-etre')).toBe(Themes.Wellness);
            expect(getThemeByTagName('lt-inexistant')).toBe(undefined);
        });
    });
});