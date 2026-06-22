export type SoundPresetType = {
  id: string;
  name: string;
  icon: string;
  src: string;
};

/** Persisted ambient + notification sound selection and volumes. */
export type SoundSettingsType = {
  ambientSoundId: string;
  ambientVolume: number;
  notificationSoundId: string;
  notificationVolume: number;
};
