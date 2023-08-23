import React, { useEffect } from "react";
import {
  Navigate,
  useNavigate,
  useLocation,
  Routes,
  Route,
} from "react-router-dom";

import DashboardPage from "components/dashboard/DashboardPage";
import LoginPage from "components/LoginPage";
import Unauthorized from "components/UnauthorizedPage";
import ForgotPassword from "components/login/ForgotPassword";
import { useAuthStateWatcher } from "hooks/firebase/auth";
import { useViewsList } from "./dashboard/views/viewsList";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStateWatcher();
  const userAuthorized = true;
  const viewsList = useViewsList(user);

  // Global login checks
  useEffect(() => {
    if (
      !user &&
      location.pathname !== "/login" &&
      location.pathname !== "/forgot-password"
    ) {
      return navigate("/login", { state: { from: location }, replace: true });
    }
    if (user && !userAuthorized) {
      return navigate("/unauthorized", {
        state: { from: location },
        replace: true,
      });
    }
  }, [user, userAuthorized, navigate, location]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<DashboardPage user={user} />}>
        <Route
          index
          element={<Navigate to={`/dashboard/${viewsList[0].key}`} replace />}
        />
        {viewsList.map((view) => (
          <Route
            key={view.key}
            path={`${view.key}`}
            element={<view.component />}
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
