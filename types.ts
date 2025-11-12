export interface AspectRatioOption {
  label: string;
  value: string;
}

export interface HistoryItem {
  image: string; // base64 data URL
  prompt: string;
}

export interface CameraControlState {
  rotation: number;
  zoom: number; // Renamed from move forward/close-up for clarity
  verticalAngle: number;
  wideAngle: boolean;
}
