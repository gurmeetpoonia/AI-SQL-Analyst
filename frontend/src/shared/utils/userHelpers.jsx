/* ========================================
   Load Current User
======================================== */

export const loadCurrentUser = async ({
    getCurrentUser,
    setUser
}) => {

    try {

        const data = await getCurrentUser();

        setUser(data);

    } catch (err) {

        console.error(err);

    }

};