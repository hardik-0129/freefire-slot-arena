import { useEffect } from 'react';
import type { NotificationItem } from './NotificationBell';

interface Props {
  open: boolean;
  onClose: () => void;
  item: NotificationItem | null;
}

export default function MatchNotificationModal({ open, onClose, item }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) {
      document.addEventListener('keydown', onKey);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  const md = item.metadata || {} as any;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white text-black rounded-lg p-4 w-96 max-w-[90vw]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Match Details</h3>
          <button onClick={onClose} className="text-sm">Close</button>
        </div>
        <div className="space-y-1 text-sm text-black">
          <div><span className="font-medium">Room ID:</span> {md.roomId}</div>
          <div><span className="font-medium">Match Date:</span> {md.matchDate ? new Date(md.matchDate).toLocaleDateString() : '-'}</div>
          <div><span className="font-medium">Match Time:</span> {md.matchTime ? new Date(md.matchTime).toLocaleTimeString() : '-'}</div>
          <div><span className="font-medium">Password:</span> {md.matchPassword || '-'}</div>
          <div><span className="font-medium">Slot Number:</span> {md.slotNumber || '-'}</div>
        </div>
      </div>
    </div>
  );
}


