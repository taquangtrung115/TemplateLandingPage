import { client } from "./client";
export const tenantApi = {
  login: (email, password) => client.post("/auth/login", { email, password }),
  me: (signal) => client.get("/auth/me", { signal }),
  list: (page = 1, signal, search = "") =>
    client.get("/platform/tenants", {
      params: { page, pageSize: 20, search },
      signal,
    }),
  create: (value) => client.post("/platform/tenants", value),
  detail: (tenantId, signal) => client.get("/platform/tenants/" + encodeURIComponent(tenantId), { signal }),
  detailByKey: (key, signal) => client.get("/platform/tenants/by-key/" + encodeURIComponent(key), { signal }),
  remove: (tenantId, value) => client.delete("/platform/tenants/" + encodeURIComponent(tenantId), { data: value }),
  update: (tenantId, value) =>
    client.put("/platform/tenants/" + tenantId, value),
  configure: (tenantId, appKey, value) =>
    client.put(
      "/platform/tenants/" + tenantId + "/applications/" + appKey,
      value,
    ),
  uninstall: (tenantId, appKey, purgeData) =>
    client.delete("/platform/tenants/" + tenantId + "/applications/" + appKey, { params: { purgeData } }),
  users: (tenantId, page, search, signal) =>
    client.get("/platform/tenants/" + tenantId + "/members", { params: { page, search }, signal }),
  setWorkspaceMember: (tenantId, value) =>
    client.put("/platform/tenants/" + tenantId + "/workspace-membership", value),
  updateMemberProfile: (tenantId, userId, value) =>
    client.put("/platform/tenants/" + tenantId + "/members/" + userId, value),
  removeMember: (tenantId, appKey, userId) =>
    client.delete("/platform/tenants/" + tenantId + "/applications/" + appKey + "/members/" + userId),
  members: (tenantId, appKey, page = 1, signal) =>
    client.get(
      "/platform/tenants/" + tenantId + "/applications/" + appKey + "/members",
      { params: { page }, signal },
    ),
  setMember: (tenantId, appKey, value) =>
    client.put(
      "/platform/tenants/" + tenantId + "/applications/" + appKey + "/members",
      value,
    ),
  createMember: (tenantId, appKey, value) =>
    client.post(
      "/platform/tenants/" + tenantId + "/applications/" + appKey + "/members",
      value,
    ),
  createUser: (value) =>
    client.post("/platform/users", { ...value, role: "User" }),
};
