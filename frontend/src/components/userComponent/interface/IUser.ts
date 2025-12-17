export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tripName: string, file: File | null) => void;
}

export interface HeroSectionProps {
  onUploadClick: () => void;
}