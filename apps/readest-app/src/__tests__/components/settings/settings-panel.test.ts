import { describe, expect, it } from 'vitest';

import { normalizeSettingsPanel } from '@/components/settings/settingsPanel';

describe('normalizeSettingsPanel', () => {
  it('routes unsupported AI and integration panels to Font', () => {
    expect(normalizeSettingsPanel('AI')).toBe('Font');
    expect(normalizeSettingsPanel('Integrations')).toBe('Font');
  });

  it('preserves every rendered offline settings panel', () => {
    for (const panel of [
      'Font',
      'Layout',
      'Theme',
      'Control',
      'TTS',
      'Language',
      'Custom',
    ] as const) {
      expect(normalizeSettingsPanel(panel)).toBe(panel);
    }
  });
});
