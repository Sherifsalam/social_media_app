export const ConfirmEmailKey = (userID: string) =>
  `users:${userID}:confirmEmailOTP`;

export const revokeTokenKey = (userID: string, jwtid: string) =>
  `users:${userID}:revokeToken:${jwtid}`;
