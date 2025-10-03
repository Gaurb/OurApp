export const host = process.env.REACT_APP_BACKEND_URL;

// Auth Routes
export const loginRoute = `${host}/api/auth/login`;
export const registerRoute = `${host}/api/auth/register`;
export const refreshRoute = `${host}/api/auth/refresh`;
export const logoutRoute = `${host}/api/auth/logout`;

// User Routes
export const setAvatarRoute = `${host}/api/user/setAvatar`;
export const getAvatarRoute = `${host}/api/user/getAvatars`;
export const addFriendRoute = `${host}/api/user/addFriend`;
export const searchFriendRoute = `${host}/api/user/searchFriend`;
export const allUsersRoute = `${host}/api/user/getFriends`;

// Private Message Routes
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getmsg`;

// WebSocket Route
export const wsRoute = `${host}/ws`;

// Group Chat Routes
export const createRoomRoute = `${host}/api/rooms/create`;
export const getAllRoomsRoute = `${host}/api/rooms/all`;
export const getRoomByNameRoute = (roomName) => `${host}/api/rooms/${encodeURIComponent(roomName)}`;
export const updateRoomNameRoute = `${host}/api/rooms/update-name`;
export const updateGroupPhotoRoute = `${host}/api/rooms/update-photo`;
export const addMembersRoute = `${host}/api/rooms/add-members`;
export const removeMemberRoute = `${host}/api/rooms/remove-member`;
export const leaveRoomRoute = (roomName) => `${host}/api/rooms/${encodeURIComponent(roomName)}/leave`;
export const deleteRoomRoute = (roomName) => `${host}/api/rooms/${encodeURIComponent(roomName)}`;
export const getGroupMessagesRoute = (roomName) => `${host}/group-messages/${encodeURIComponent(roomName)}`;

