import { encryptId } from "../helpers/CommonFunctions.js";
const userResource = async (users) => {
    return Promise.all(users.map(async (user) => ({
        id: encryptId(user.id),
        name: user.name,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        city: user.city,
        address: user.address,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
    })));
};

  export default userResource 