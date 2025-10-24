import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { EmailModel } from '../types/dto';

dotenv.config();

// Detectar configuración automáticamente
const port = Number(process.env.SMTP_PORT) || 587;
const secure = port === 465;

console.log('📧 Configuración SMTP detectada:', {
  host: process.env.SMTP_HOST,
  port: port,
  secure: secure,
  user: process.env.SMTP_USER
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: port,
  secure: secure, // true para 465, false para 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Configuración adicional para Gmail
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendEmail(emailModel: EmailModel) {
  try {
    console.log('🔄 Verificando conexión SMTP...');
    
    // Verificar la conexión
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada correctamente');

    const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
    
    const mailOptions = {
      from: `"Sistema de Tickets" <${from}>`,
      to: emailModel.to,
      subject: emailModel.subject,
      html: emailModel.content,
    };

    console.log(`📧 Enviando email a: ${emailModel.to}`);
    console.log(`📋 Asunto: ${emailModel.subject}`);
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado exitosamente');
    console.log(`📫 Message ID: ${result.messageId}`);
    console.log(`✅ Response: ${result.response}`);
    
    return result;
    
  } catch (error: any) {
    console.error('❌ Error detallado en sendEmail:');
    console.error(`📧 Destinatario: ${emailModel.to}`);
    console.error(`🔧 Configuración:`, {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      secure: port === 465
    });
    console.error(`💥 Código de error: ${error.code}`);
    console.error(`💥 Mensaje: ${error.message}`);
    
    // Error específico de autenticación
    if (error.code === 'EAUTH') {
      throw new Error('Error de autenticación: Verifica tu usuario y contraseña de aplicación');
    }
    
    // Error de conexión
    if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
      throw new Error('Error de conexión: Verifica la configuración SMTP y el puerto');
    }
    
    throw error;
  }
}