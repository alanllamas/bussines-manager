export type ApiResponse<JSON = unknown> = {
  service: {
    id: string;
    name: string;
  };
  data: JSON;
  status: {
    id: number;
    info: string;
  };
};

export type CSFRegimen = {
  k: string;
  v: string;
};

export type CSFResponseData = {
  last_update: string;
  lname?: string;
  name?: string;
  populationid?: string;
  regimen: Array<CSFRegimen>;
  slname?: string;
  start_operations: string;
  status: string;
  taxid: string;
  zip: string;
  comercial_name?: string;
};

export type CSFApiResponse = {
  response: string;
  telemetry: {
    'call-uuid': string;
    latency: number;
  };
  data: {
    pdf_ocr: CSFResponseData;
    qr_webpage: CSFResponseData;
  };
};

export type ExtraordinarySubject = {
  name: string;
  code: string;
  crn: string;
  blocked: boolean;
};
