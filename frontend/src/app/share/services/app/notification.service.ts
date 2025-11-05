import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

export enum TipoMessage {
    success = 'success',
    info = 'info',
    warning = 'warning',
    error = 'error',
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(private router: Router) { }

    mensaje(
        title: string | null,
        message: string,
        type: TipoMessage,
        duration: number = 3000
    ): void {
        const options = {
            duration,
            position: 'top-center' as const,  
            style: {
                fontSize: '16px',        
                padding: '16px 20px',        
                minHeight: '100px',           
                borderRadius: '12px',    
                fontWeight: '500',          
            },
            className: 'custom-toast',       
        };


        switch (type) {
            case TipoMessage.success:
                toast.success(title ? `${title}: ${message}` : message, options);
                break;
            case TipoMessage.info:
                toast.message(title ? `${title}: ${message}` : message, options);
                break;
            case TipoMessage.warning:
                toast.warning(title ? `${title}: ${message}` : message, options);
                break;
            case TipoMessage.error:
                toast.error(title ? `${title}: ${message}` : message, options);
                break;
        }
    }

    mensajeRedirect(
        title: string | null,
        message: string,
        type: TipoMessage,
        redirectTo: string,
        duration: number = 3000
    ): void {
        this.mensaje(title, message, type, duration);
        setTimeout(() => this.router.navigate([redirectTo]), duration);
    }

    success(title: string | null, message: string, duration?: number, redirectTo?: string): void {
        if (redirectTo) {
            this.mensajeRedirect(title, message, TipoMessage.success, redirectTo, duration);
        } else {
            this.mensaje(title, message, TipoMessage.success, duration);
        }
    }

    info(title: string | null, message: string, duration?: number, redirectTo?: string): void {
        if (redirectTo) {
            this.mensajeRedirect(title, message, TipoMessage.info, redirectTo, duration);
        } else {
            this.mensaje(title, message, TipoMessage.info, duration);
        }
    }

    warning(title: string | null, message: string, duration?: number, redirectTo?: string): void {
        if (redirectTo) {
            this.mensajeRedirect(title, message, TipoMessage.warning, redirectTo, duration);
        } else {
            this.mensaje(title, message, TipoMessage.warning, duration);
        }
    }

    error(title: string | null, message: string, duration?: number, redirectTo?: string): void {
        if (redirectTo) {
            this.mensajeRedirect(title, message, TipoMessage.error, redirectTo, duration);
        } else {
            this.mensaje(title, message, TipoMessage.error, duration);
        }
    }
}
