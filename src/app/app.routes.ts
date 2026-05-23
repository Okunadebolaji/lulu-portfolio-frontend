import { Routes } from '@angular/router';

// Auth Components
import { Login } from './auth/login/login';
import { Register } from './admin/register/register';

// Portfolio Components
import { Home } from './portfolio/home/home';
import { ProjectsComponent } from './portfolio/projects/projects';
import { ProjectDetail } from './portfolio/project-detail/project-detail';
import { About } from './portfolio/about/about';
import { Contact } from './portfolio/contact/contact';

// Admin Components
import { AdminLayout } from './admin/layout/layout';
import { Dashboard } from './admin/dashboard/dashboard';
import { ProjectManager } from './admin/project-manager/project-manager';
import { SkillManager } from './admin/skill-manager/skill-manager';
import { ContactMessagesAdminComponent } from './admin/contact-messages-admin.component';

export const routes: Routes = [
  // 🏠 PUBLIC ROUTES (Portfolio)
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'projects', component: ProjectsComponent },
  { path: 'projects/:id', component: ProjectDetail },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },

  // 🔐 AUTH ROUTES
  { path: 'auth/login', component: Login },

  // 🛠️ ADMIN ROUTES (Protected in component)
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'projects', component: ProjectManager },
      { path: 'skills', component: SkillManager },
      { path: 'messages', component: ContactMessagesAdminComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // 404 Fallback
  { path: '**', redirectTo: 'home' }
];