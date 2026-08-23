export type SettingsPanelType =
  | 'Font'
  | 'Layout'
  | 'Theme'
  | 'Control'
  | 'TTS'
  | 'Language'
  | 'AI'
  | 'Integrations'
  | 'Custom';

export const normalizeSettingsPanel = (panel: SettingsPanelType): SettingsPanelType =>
  panel === 'AI' || panel === 'Integrations' ? 'Font' : panel;
