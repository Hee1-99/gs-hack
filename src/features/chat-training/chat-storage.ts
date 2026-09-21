import { CHAT_STORAGE_KEY, CHAT_UPDATED_EVENT } from './types';
/** Clears guest demo chat only. Account/store records use separate keys and require their own authorized controls. */
export function resetChatHistory(): boolean {
  try {
    window.localStorage.removeItem(CHAT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(CHAT_UPDATED_EVENT));
    return true;
  } catch { return false; }
}
