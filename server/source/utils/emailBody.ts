export function emailBody(correo: string, token: string, frontendUrl = 'http://localhost:4200/reset') {
  const url = `${frontendUrl}?email=${encodeURIComponent(correo)}&code=${encodeURIComponent(token)}`;
  return `
  <html>
    <body style="font-family: Arial, Helvetica, sans-serif;">
      <h1>Reset your Password</h1>
      <p>You're receiving this e-mail because you requested a password reset for your Bearfix account.</p>
      <p>Please click the button below to choose a new password.</p>
      <a href="${url}" target="_blank"
         style="background:#0d6efd;color:white;padding:10px;border-radius:4px;text-decoration:none;display:inline-block">
         Reset Password
      </a>
      <p>Kind Regards,<br/>TechShop</p>
    </body>
  </html>`;
}
