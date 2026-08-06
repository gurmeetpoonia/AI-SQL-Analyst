import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/context/AuthContext";
import AppRoutes from "./shared/routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Toaster
          position="top-right"
          reverseOrder={false}
        />

        <AppRoutes />

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;