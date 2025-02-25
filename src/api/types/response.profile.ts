export type ApiResponse<JSON = unknown> = {
  service: {
    id: string;
    name: string;
  };
  error?: {
    id?: number;
    info?: string;
  };
  data: JSON;
  status: {
    id: number;
    info: string;
  };
};
