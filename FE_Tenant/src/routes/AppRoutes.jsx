import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import App from "../App";
import { paths, tenantPath } from "./paths";

function EntryRedirect() {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const tenantKey = query.get("tenant")?.trim().toLowerCase();
  const target = tenantKey && /^[a-z0-9-]{1,63}$/.test(tenantKey)
    ? tenantPath(tenantKey, query.get("view") === "store" ? "store" : "members") : paths.overview;
  return <Navigate to={target} replace />;
}

export default function AppRoutes() {
  return <Routes>
    <Route element={<App />}>
      <Route path={paths.overview} element={<></>} />
      <Route path={paths.tenants} element={<></>} />
      <Route path={paths.tenants + "/:tenantKey/apps"} element={<></>} />
      <Route path={paths.tenants + "/:tenantKey/members"} element={<></>} />
      <Route path={paths.tenants + "/:tenantKey/settings"} element={<></>} />
    </Route>
    <Route path="*" element={<EntryRedirect />} />
  </Routes>;
}
