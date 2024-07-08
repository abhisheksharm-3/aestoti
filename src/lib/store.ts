import { writable } from "svelte/store";
export interface Settings {
  auto_time: boolean;
  sound: boolean;
  notification: boolean;
  focus_length: number;
  long_break_interval: number;
  short_length: number;
  long_length: number;
}

const initialSettings: Settings = {
  auto_time: false,
  sound: false,
  notification: false,
  focus_length: 25,
  long_break_interval: 3,
  short_length: 5,
  long_length: 15,
};

export const settings = writable<Settings>(initialSettings);
