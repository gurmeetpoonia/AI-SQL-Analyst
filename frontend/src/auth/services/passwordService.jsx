import api from "../../shared/services/api";

export const forgotPassword = async (email) => {
    const response = await api.post(
        "/password/forgot-password",
        {
            email
        }
    );

    return response.data;
};

export const verifyResetOTP = async (email, otp) => {
    const response = await api.post(
        "/password/verify-reset-otp",
        {
            email,
            otp
        }
    );

    return response.data;
};

export const resetPassword = async (
    email,
    newPassword,
    resetToken
) => {
    const response = await api.post(
        "/password/reset-password",
        {
            email,
            new_password: newPassword,
            reset_token: resetToken,
        }
    );

    return response.data;
};

export const resendResetOTP = async (email) => {

    const response = await api.post(
        "/password/resend-reset-otp",
        {
            email
        }
    );

    return response.data;

};