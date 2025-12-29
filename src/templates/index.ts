// Public templates
import { homeTemplate } from './public/home';
import { aboutTemplate } from './public/about';
import { articleTemplate } from './public/article';

// Admin templates
import { adminListTemplate } from './admin/list';
import { adminMediaTemplate } from './admin/media';
import { adminEditTemplate } from './admin/edit';

// Auth templates
import { loginTemplate } from './auth/login';
import { unauthorizedTemplate } from './auth/unauthorized';

// Error templates
import { notFoundTemplate } from './errors/notFound';
import { errorTemplate } from './errors/error';

export const templates = {
  home: homeTemplate,
  about: aboutTemplate,
  article: articleTemplate,
  adminList: adminListTemplate,
  adminMedia: adminMediaTemplate,
  adminEdit: adminEditTemplate,
  login: loginTemplate,
  unauthorized: unauthorizedTemplate,
  notFound: notFoundTemplate,
  error: errorTemplate,
};
