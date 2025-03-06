const authService = {
    login: async (email, password) => {
        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    },

    logout: async () => {
        try {
            await firebase.auth().signOut();
        } catch (error) {
            console.error("Logout failed:", error);
            throw error;
        }
    },

    onAuthStateChanged: (callback) => {
        firebase.auth().onAuthStateChanged(user => {
            callback(user);
        });
    },

    getCurrentUser: () => {
        return firebase.auth().currentUser;
    }
};

export default authService;