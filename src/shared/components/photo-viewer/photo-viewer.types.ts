export type PhotoViewerProps = {
  visible: boolean;
  images: string[];
  // The photo shown first; swiping moves through the rest.
  initialIndex?: number;
  onClose: () => void;
};
