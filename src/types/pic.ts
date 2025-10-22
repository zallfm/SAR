export type UarPic = {
  ID: string;
  PIC_NAME: string;
  DIVISION_ID: number;
  MAIL: string;
};

export type CreateUarPayload = {
  PIC_NAME: string;
  DIVISION_ID: number;
  MAIL: string;
};

export type EditUarPayload = Partial<CreateUarPayload>;

export type BackendGetUarResponse = {
  requestId: string;
  data: UarPic[];
};

export type BackendCreateUarResponse = {
  requestId: string;
  data: UarPic;
};

export type BackendEditUarResponse = {
  requestId: string;
  data: UarPic;
};
