export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tripName: string, file: File | null) => void;
  isLoading?: boolean;
}

export interface HeroSectionProps {
  onUploadClick: () => void;
}

export interface TripsListTableProps {
  onTripSelect?: (tripIds: string[]) => void;
  onDelete?: (tripIds: string[]) => void;
  onOpen?: (tripId: string) => void;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}