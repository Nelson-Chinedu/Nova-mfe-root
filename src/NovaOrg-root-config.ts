import { registerApplication, start } from "single-spa";
import { constructApplications, constructRoutes, constructLayoutEngine } from "single-spa-layout";
import microfrontendLayout from "./microfrontend-layout.html";
import { checkAuthStatus } from "@NovaOrg/auth-utils";

const layoutData = {
  loaders: {
    "main-loader": `<div class="spinner-container"><div class="spinner"></div><p>Loading...</p></div>`,
  },
  props: {},
};

const routes = constructRoutes(microfrontendLayout, layoutData);
const applications = constructApplications({
  routes,
  loadApp: async ({ name }) => {
    const protectedApps = [
      "@NovaOrg/nova-mfe-dashboard",
      "@NovaOrg/nova-mfe-payroll",
      "@NovaOrg/nova-mfe-schedule",
      "@NovaOrg/nova-mfe-recruitment",
    ];
    if (protectedApps.includes(name)) {
      const { user } = await checkAuthStatus();

      if (!user?.authenticated) {
        window.location.href = "/auth/signin";
        return null;
      }
    }

    return System.import(name);
  },
});
const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach(registerApplication);
layoutEngine.activate();
start();
