import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        localStorage.getItem("access_token")
    );

    // Forgot Password Flow
    const [resetEmail, setResetEmail] = useState("");
    const [isOTPVerified, setIsOTPVerified] = useState(false);
    const [resetToken, setResetToken] = useState("");

    const login = (token) => {
        localStorage.setItem("access_token", token);
        setToken(token);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setToken(null);
    };

    // OTP Verify hone ke baad call hoga
    const allowPasswordReset = (email,token) => {
        setResetEmail(email);
        setResetToken(token);
        setIsOTPVerified(true);
    };

    // Password reset hone ke baad call hoga
    const clearPasswordReset = () => {
        setResetToken("");
        setResetEmail("");
        setIsOTPVerified(false);
    };
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <AuthContext.Provider
            value={{
                token,
                login,
                logout,

                // Forgot Password
                resetEmail,
                resetToken,
                isOTPVerified,
                allowPasswordReset,
                clearPasswordReset,
                user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}