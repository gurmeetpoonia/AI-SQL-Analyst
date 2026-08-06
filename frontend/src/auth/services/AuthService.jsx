import api from "../../shared/services/api";

/*
==========================
Login
==========================
*/
export const loginUser = async (data) => {
    const response= await api.post(
        "/auth/login", 
        data
    );

    return response.data;
};

/*
==========================
Register
==========================
*/
export const registerUser= async (data) =>
{
    const response= await api.post (
        "/auth/register",
        data
    );
    return response.data;
};

/*
==========================
Verify OTP
==========================
*/

export const verifyOTP =async(data) => {
    const response=await api.post(
        "/auth/verify-otp",
        data
    );
    return response.data;
}

/*
==========================
Resend OTP
==========================
*/
export const resendOTP = async(email)=> {
    const response= await api.post(
        "/auth/resend-otp",
        {
            email
        }
    );
    return response.data
};



export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data.data;
};

