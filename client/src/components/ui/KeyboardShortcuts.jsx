import Modal from './Modal';

const shortcuts = [
  { key: 'N', description: 'New Assignment' },
  { key: 'T', description: 'Timer' },
  { key: 'G', description: 'Goals' },
  { key: 'C', description: 'Calendar' },
  { key: 'S', description: 'Subjects' },
  { key: '?', description: 'Show this modal' },
];

export default function KeyboardShortcuts({ open, onClose }) {
  return (
    <Modal open={open} title="Keyboard Shortcuts" onClose={onClose}>
      <div className="space-y-2">
        {shortcuts.map(({ key, description }) => (
          <div key={key} className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-white/80">{description}</span>
            <kbd className="px-2 py-1 rounded bg-navy-700 text-neon-primary font-mono text-sm border border-white/10">{key}</kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
}
