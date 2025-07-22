export const host = process.env.REACT_APP_BACKEND_URL;
export const loginRoute = `${host}/api/auth/login`;
export const registerRoute = `${host}/api/auth/register`;
export const refreshRoute = `${host}/api/auth/refresh`;
export const logoutRoute = `${host}/api/auth/logout`;
export const setAvatarRoute = `${host}/api/user/setAvatar`;
export const getAvatarRoute = `${host}/api/user/getAvatars`;
export const addFriendRoute = `${host}/api/user/addFriend`;
export const searchFriendRoute = `${host}/api/user/searchFriend`;
export const allUsersRoute = `${host}/api/user/getFriends`;
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getmsg`;
export const wsRoute = `${host}/ws`;

