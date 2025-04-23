DEFAULT AVATAR USAGE INSTRUCTIONS

The file default-avatar.svg is provided as a placeholder avatar image for users who have not uploaded their own profile picture.

HOW TO USE:
1. In your user profile code, check if the user has an avatar image.
2. If no custom avatar exists, use the default image path: "/img/default-avatar.svg"

Example implementation in Thymeleaf:
<img th:src="${user.hasAvatar()} ? @{'/img/avatars/' + ${user.avatarFilename}} : @{'/img/default-avatar.svg'}" alt="User Avatar" class="profile-image">

Example implementation in JavaScript:
const avatarImg = document.getElementById('userAvatar');
avatarImg.src = userData.avatarUrl || '/img/default-avatar.svg';

CUSTOMIZATION:
- You can modify the default-avatar.svg file to change the appearance of the default avatar.
- If needed, create different versions with varied colors or sizes by duplicating and modifying the SVG file.

BENEFITS OF USING THE DEFAULT AVATAR:
- Consistent user interface when user images are missing
- Lightweight SVG format loads quickly
- Can be easily styled or colorized using CSS 