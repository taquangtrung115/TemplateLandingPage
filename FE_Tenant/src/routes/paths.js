export const paths = { overview: "/overview", tenants: "/tenants" };

export function tenantPath(key, section, appKey) {
  const suffix = { members: "members", settings: "settings", store: "apps" }[section];
  const path = key && suffix ? paths.tenants + "/" + encodeURIComponent(key) + "/" + suffix : paths[section] || paths.tenants;
  return suffix && key && appKey ? path + "?app=" + encodeURIComponent(appKey) : path;
}
