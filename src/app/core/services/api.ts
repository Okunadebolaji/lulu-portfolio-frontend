import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from './auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:5113/api'; // Change to your API URL

  constructor(private http: HttpClient, private auth: Auth) {}

  // 🔧 HELPER: Get headers with JWT token
  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // 📋 PROJECTS
  getProjects(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/project`).pipe(
      map((response: any) => {
        // Handle wrapped response or direct data
        if (response && response.data) {
          return response;
        }
        return response;
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

  // 🔐 ADMIN: Upload project image
  // Returns: { success: true, url: "http://localhost:5113/uploads/abc.png" }
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
          // ✅ Do NOT set Content-Type - let browser set it for FormData
        })
      }
    );
  }

  // 🎯 SKILLS
  getSkills(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/skills`).pipe(
      // Extract the 'data' array from the ApiResponse wrapper
      map((response: any) => {
        // Handle both wrapped response and direct array
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

  // 💼 SERVICES
  getServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/services`);
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

  // ⭐ TESTIMONIALS
  getTestimonials(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/testimonials`);
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

  // 📧 CONTACT MESSAGES
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
        // No auth needed for public contact form
      })
    });
  }

  deleteContactMessage(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/contact/${id}`, {
      headers: this.getHeaders()
    });
  }

  // 📝 ABOUT SECTION
  getAbout(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/about`);
  }

  updateAbout(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/about`, data, {
      headers: this.getHeaders()
    });
  }

  // 📰 BLOG (Optional)
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