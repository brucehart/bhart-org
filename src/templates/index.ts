// Public templates
import { homeTemplate } from './public/home';
import { aboutTemplate } from './public/about';
import { articleTemplate } from './public/article';
import { projectsTemplate } from './public/projects';
import { archiveTemplate } from './public/archive';
import { newsTemplate } from './public/news';
import { workWithMeTemplate } from './public/workWithMe';
import { contactTemplate } from './public/contact';
import { publicHeaderTemplate } from './public/partials/header';
import { publicFaviconTemplate } from './public/partials/favicon';
import { publicFooterTemplate } from './public/partials/footer';
import { publicFooterCompactTemplate } from './public/partials/footerCompact';

// Admin templates
import { adminListTemplate } from './admin/list';
import { adminMediaTemplate } from './admin/media';
import { adminEditTemplate } from './admin/edit';
import { adminNewsListTemplate } from './admin/newsList';
import { adminNewsEditTemplate } from './admin/newsEdit';

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
  projects: projectsTemplate,
  archive: archiveTemplate,
  news: newsTemplate,
  workWithMe: workWithMeTemplate,
  contact: contactTemplate,
  adminList: adminListTemplate,
  adminMedia: adminMediaTemplate,
  adminEdit: adminEditTemplate,
  adminNewsList: adminNewsListTemplate,
  adminNewsEdit: adminNewsEditTemplate,
  login: loginTemplate,
  unauthorized: unauthorizedTemplate,
  notFound: notFoundTemplate,
  error: errorTemplate,
};

export const partials = {
  publicHeader: publicHeaderTemplate,
  publicFavicon: publicFaviconTemplate,
  publicFooter: publicFooterTemplate,
  publicFooterCompact: publicFooterCompactTemplate,
};
