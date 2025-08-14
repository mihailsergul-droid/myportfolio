import { onMounted, onUnmounted } from 'vue';

interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  callback: () => void;
  description?: string;
}

export const useHotkeys = (hotkeys: HotkeyConfig[]) => {
  const handleKeydown = (event: KeyboardEvent) => {
    for (const hotkey of hotkeys) {
      const keyMatch = event.key.toLowerCase() === hotkey.key.toLowerCase();
      const ctrlMatch = !!hotkey.ctrl === event.ctrlKey;
      const altMatch = !!hotkey.alt === event.altKey;
      const shiftMatch = !!hotkey.shift === event.shiftKey;
      
      if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
        event.preventDefault();
        hotkey.callback();
        break;
      }
    }
  };
  
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
  });
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
  });
  
  return { hotkeys };
};