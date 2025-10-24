export type TokenApiDto = {
  accessToken: string;
  refreshToken: string;
};

export type EmailModel = {
  to: string;
  subject: string;
  content: string;
};

export type ResetPasswordDto = {
  correo?: string;
  emailToken?: string;
  newPassword?: string;
  confirmPassword?: string;
};