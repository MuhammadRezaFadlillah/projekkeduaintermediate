import HomePage from '../pages/views/HomeView';
import {checkAuthenticatedRoute, checkUnauthenticatedRouteOnly} from "../utils/auth";
import LoginPage from "../pages/views/LoginView";
import RegisterPage from "../pages/views/RegisterView";
import AddPage from "../pages/views/AddView";
import DetailPage from "../pages/views/DetailView";
import BookmarkPage from "../pages/views/BookmarkView";
import NotFound from "../pages/views/NotFound";

const routes = {
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/new': () => checkAuthenticatedRoute(new AddPage()),
  '/story/:id': () => checkAuthenticatedRoute(new DetailPage()),
  '/bookmark': () => checkAuthenticatedRoute(new BookmarkPage()),
  '*': () => checkAuthenticatedRoute(new NotFound()),
};

export default routes;

