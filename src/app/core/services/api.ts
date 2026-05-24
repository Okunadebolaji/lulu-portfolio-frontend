import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from './auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient, private auth: Auth) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getProjects(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/project`).pipe(
      map((response: any) => {
        if (response && response.data && Array.isArray(response.data)) {
          return response;
        }
        if (Array.isArray(response)) {
          return { data: response };
        }
        return { data: [] };
      })
    );
  }

  getProjectById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/project/${id}`);
  }

  createProject(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/project`, data, {
      headers: this.getHeaders()
    });
  }

  updateProject(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/project/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/project/${id}`, {
      headers: this.getHeaders()
    });
  }

  uploadProjectImage(file: File): Observable<any> {
    const token = this.auth.getToken();
    
    if (!token) {
      return new Observable(observer => {
        observer.error({
          status: 401,
          error: { message: 'Authentication required. Please login again.' }
        });
      });
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(
      `${this.apiUrl}/project/upload`,
      formData,
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      }
    );
  }

  getSkills(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/skills`).pipe(
      map((response: any) => {
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }

  getSkillById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/skills/${id}`);
  }

  createSkill(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/skills`, data, {
      headers: this.getHeaders()
    });
  }

  updateSkill(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/skills/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteSkill(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/skills/${id}`, {
      headers: this.getHeaders()
    });
  }

  getServices(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/services`).pipe(
      map((response: any) => {
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }

  getServiceById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/services/${id}`);
  }

  createService(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/services`, data, {
      headers: this.getHeaders()
    });
  }

  updateService(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/services/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteService(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/services/${id}`, {
      headers: this.getHeaders()
    });
  }

  getTestimonials(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/testimonials`).pipe(
      map((response: any) => {
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }

  getTestimonialById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/testimonials/${id}`);
  }

  createTestimonial(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/testimonials`, data, {
      headers: this.getHeaders()
    });
  }

  updateTestimonial(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/testimonials/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteTestimonial(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/testimonials/${id}`, {
      headers: this.getHeaders()
    });
  }

  getContactMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contact`, {
      headers: this.getHeaders()
    });
  }

  getContactMessageById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contact/${id}`, {
      headers: this.getHeaders()
    });
  }

  createContactMessage(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contact`, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  deleteContactMessage(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/contact/${id}`, {
      headers: this.getHeaders()
    });
  }

  getAbout(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/about`);
  }

  updateAbout(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/about`, data, {
      headers: this.getHeaders()
    });
  }

  getBlogPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/blog`);
  }

  getBlogPostById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/blog/${id}`);
  }

  createBlogPost(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/blog`, data, {
      headers: this.getHeaders()
    });
  }

  updateBlogPost(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/blog/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteBlogPost(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/blog/${id}`, {
      headers: this.getHeaders()
    });
  }
}