import { Routes,Route,Navigate} from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../../auth/pages/Login";
import Register from "../../auth/pages/Register";
import VerifyOTP from "../../auth/pages/VerifyOTP";
import Dashboard from "../../aiAnalyst/pages/Dashboad";
import ForgotPassword from "../../auth/pages/ForgotPassword";
import VerifyResetOTP from "../../auth/pages/VerifyResetOTP";
import ResetPassword from "../../auth/pages/ResetPassword";
import DatasetEditorPage from "../../aiEditor/pages/DatasetEditorPage";
import UploadCSV from "../../aiAnalyst/pages/UploadCSV";
function AppRoutes(){
   
    return(
        
            <Routes>
                <Route
                path="/"
                element={<Navigate to = "/login" replace />}
                />
                <Route
                path="/login"
                element={
                    <Login/>
                }/>

                <Route
                path="/register"
                element={<Register />}
                />

                <Route
                path="/verify-otp"
                element={                
                    <VerifyOTP />}
                />

                <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
                />
                <Route
                    path="/forgot-password"

                    element={

                    <ForgotPassword />
                }
                />

                <Route
                    path="/verify-reset-otp"
                    element={
                    <VerifyResetOTP />
                }
                />

                <Route
                    path="/reset-password"
                    element={
                    <ResetPassword />
                }
                />
              
                

                <Route
    path="/dashboard/editor/:datasetId"
    element={
        <ProtectedRoute>
            <DatasetEditorPage />
        </ProtectedRoute>
    }
/>

            </Routes>

        
    );
}

export default AppRoutes;