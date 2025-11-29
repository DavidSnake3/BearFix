import fs from 'fs';
import path from 'path';

export function emailBody(correo: string, token: string, frontendUrl = 'http://localhost:4200/reset') {
  const url = `${frontendUrl}?email=${encodeURIComponent(correo)}&code=${encodeURIComponent(token)}`;
  const currentYear = new Date().getFullYear();
  
  let logoBase64 = '';
  try {
    const logoPath = path.join(__dirname, '/server/assets/uploads/logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = logoBuffer.toString('base64');
  } catch (error) {
    console.log('Logo no encontrado, usando texto en su lugar');
  }
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña - BearFix</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            color: #333333;
            line-height: 1.6;
        }
        
        .email-wrapper {
            max-width: 680px;
            margin: 0 auto;
            background: #ffffff;
        }
        
        .header {
            background: #ffffff;
            padding: 40px 40px 20px 40px;
            border-bottom: 1px solid #eaeaea;
            text-align: center;
        }
        
        .logo {
            max-width: 200px;
            height: auto;
        }
        
        .logo-text {
            font-size: 28px;
            font-weight: 700;
            color: #2c5aa0;
            margin: 0;
        }
        
        .content {
            padding: 40px;
        }
        
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #2c5aa0;
            margin-bottom: 25px;
        }
        
        .message {
            font-size: 16px;
            color: #555555;
            margin-bottom: 25px;
            line-height: 1.7;
        }
        
        .action-section {
            background: #f8f9fa;
            border: 1px solid #eaeaea;
            border-radius: 8px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
        }
        
        .action-title {
            font-size: 18px;
            font-weight: 600;
            color: #2c5aa0;
            margin-bottom: 20px;
        }
        
        .reset-button {
            display: inline-block;
            background: #2c5aa0;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 35px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            border: none;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .reset-button:hover {
            background: #1e3d72;
        }
        
        .link-alternative {
            margin-top: 25px;
            padding: 20px;
            background: #ffffff;
            border-radius: 6px;
            border: 1px solid #eaeaea;
        }
        
        .link-text {
            font-size: 14px;
            color: #666666;
            margin-bottom: 10px;
        }
        
        .alternative-link {
            color: #2c5aa0;
            font-size: 14px;
            word-break: break-all;
            text-decoration: none;
        }
        
        .details-box {
            background: #ffffff;
            border: 1px solid #eaeaea;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .details-title {
            font-size: 16px;
            font-weight: 600;
            color: #2c5aa0;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eaeaea;
        }
        
        .detail-item {
            margin-bottom: 12px;
            display: flex;
        }
        
        .detail-label {
            font-weight: 600;
            color: #555555;
            min-width: 180px;
        }
        
        .detail-value {
            color: #333333;
            flex: 1;
        }
        
        .security-notice {
            background: #fff8e6;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .security-title {
            font-weight: 600;
            color: #856404;
            margin-bottom: 8px;
        }
        
        .security-text {
            font-size: 14px;
            color: #856404;
            line-height: 1.5;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            border-top: 1px solid #eaeaea;
            text-align: center;
        }
        
        .footer-text {
            font-size: 14px;
            color: #666666;
            margin-bottom: 10px;
            line-height: 1.5;
        }
        
        .contact-info {
            font-size: 14px;
            color: #666666;
            margin: 15px 0;
        }
        
        .copyright {
            font-size: 12px;
            color: #999999;
            margin-top: 20px;
        }
        
        @media (max-width: 680px) {
            .email-wrapper {
                margin: 10px;
            }
            
            .header {
                padding: 30px 20px 15px 20px;
            }
            
            .content {
                padding: 25px;
            }
            
            .action-section {
                padding: 25px;
            }
            
            .detail-item {
                flex-direction: column;
            }
            
            .detail-label {
                min-width: auto;
                margin-bottom: 5px;
            }
            
            .footer {
                padding: 25px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
            ${logoBase64 ? 
                `<img src="data:image/png;base64,${logoBase64}" alt="BearFix" class="logo" style="max-width: 200px; height: auto;">` : 
                '<h1 class="logo-text">BearFix</h1>'
            }
        </div>
        
        <!-- Content -->
        <div class="content">
            <p class="greeting">Hola,</p>
            
            <p class="message">
                Has solicitado restablecer tu contraseña para tu cuenta en BearFix - Sistema de Gestión de Tickets. 
                Para completar este proceso, por favor utiliza el siguiente enlace.
            </p>
            
            <div class="action-section">
                <p class="action-title">Restablecer Contraseña</p>
                <a href="${url}" class="reset-button" style="color: #ffffff; text-decoration: none;">
                    Restablecer Contraseña
                </a>
                
                <div class="link-alternative">
                    <p class="link-text">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <a href="${url}" class="alternative-link">${url}</a>
                </div>
            </div>
            
            <div class="details-box">
                <p class="details-title">Detalles de la Solicitud</p>
                
                <div class="detail-item">
                    <span class="detail-label">Correo Electrónico:</span>
                    <span class="detail-value">${correo}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Solicitado el:</span>
                    <span class="detail-value">${new Date().toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Válido hasta:</span>
                    <span class="detail-value">${new Date(Date.now() + 15 * 60 * 1000).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                </div>
            </div>
            
            <div class="security-notice">
                <p class="security-title">Importante</p>
                <p class="security-text">
                    Este enlace de restablecimiento es válido por 15 minutos. Por seguridad, no compartas este enlace con nadie. 
                    Si no realizaste esta solicitud, puedes ignorar este mensaje y tu contraseña permanecerá sin cambios.
                </p>
            </div>
            
            <p class="message">
                Si tienes alguna pregunta o necesitas asistencia, no dudes en contactar a nuestro equipo de soporte.
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                BearFix - Sistema de Gestión de Tickets
            </p>
            
            <div class="contact-info">
                <strong>Soporte:</strong> soporte@bearfix.com<br>
                <strong>Sitio web:</strong> www.bearfix.com
            </div>
            
            <p class="copyright">
                &copy; ${currentYear} BearFix. Todos los derechos reservados.<br>
                Este es un mensaje automático, por favor no respondas a este correo.
            </p>
        </div>
    </div>
</body>
</html>`;
}