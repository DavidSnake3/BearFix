import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private baseUrl = environment.apiURL;
  
  constructor(private http: HttpClient) {}

  upload(file: File, previousImage: string | null | undefined): Observable<any> {
    const formData: FormData = new FormData();

    formData.append('file', file);
    if (previousImage !== null && previousImage !== undefined) {
      formData.append('previousFileName', previousImage);
    } else {
      formData.append('previousFileName', '');
    }

    return this.http.post<any>(`${this.baseUrl}/images/upload`, formData);
  }

  getFiles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/images/files`);
  }
}