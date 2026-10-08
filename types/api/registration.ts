export type VerifyDataResponse = {
  otp: Otp;
  registration: Registration;
};

export type Otp = {
  code: number;
  purpose: string;
  phone: string;
  token: string;
  expires_at: Date;
  extra_data: ExtraData;
  id: string;
  updated_at: Date;
  created_at: Date;
};

export type ExtraData = {
  name: string;
  email: string;
  phone: string;
};

export type Registration = {
  current_step: number;
  message: string;
  attempts: number;
  max_attempts: number;
};
