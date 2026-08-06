import toast from "react-hot-toast";

/* ========================================
   Reset Password
======================================== */

export const handleResetPassword = async ({
    user,
    forgotPassword,
    navigate,
    setMenuOpen,
    setPasswordLoading
}) => {

    if (!user?.email) {
        toast.error("User not loaded");
        return;
    }

    try {

        setPasswordLoading(true);

        await forgotPassword(user.email);

        setMenuOpen(false);

        toast.success(`OTP sent to ${user.email}`);

        navigate("/verify-reset-otp", {
            state: {
                email: user.email
            }
        });

    } catch (err) {

        toast.error(
            err.response?.data?.detail ||
            "Failed to send OTP."
        );

    } finally {

        setPasswordLoading(false);

    }

};


/* ========================================
   Logout
======================================== */

export const handleLogout = () => {

    localStorage.removeItem("token");

    window.location.href = "/login";

};


/* ========================================
   User Initials
======================================== */

export const getUserInitials = (name = "") => {

    if (!name)
        return "GP";

    const parts = name.trim().split(" ");

    if (parts.length >= 2) {

        return `${parts[0][0]}${parts[1][0]}`
            .toUpperCase();

    }

    return name.slice(0, 2).toUpperCase();

};