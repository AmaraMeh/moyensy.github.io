const config = {
    API_URL: process.env.NODE_ENV === 'production' 
        ? 'https://isetcom-api.onrender.com'
        : 'http://localhost:3000',
    DEFAULT_AVATAR: '/assets/img/student-avatar.png'
};

export default config;