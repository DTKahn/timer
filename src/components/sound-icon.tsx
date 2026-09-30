import { Bell, Bird, Guitar, VolumeX, type LucideIcon } from 'lucide-react-native';

import type { SoundId } from '@/constants/sounds';

const ICONS: Record<SoundId, LucideIcon> = {
  bell: Bell,
  bird: Bird,
  guitar: Guitar,
  silent: VolumeX,
};

export function SoundIcon({ id, color, size = 24 }: { id: SoundId; color: string; size?: number }) {
  const Glyph = ICONS[id];
  return <Glyph size={size} color={color} />;
}
