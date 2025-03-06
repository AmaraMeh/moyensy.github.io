const db = firebase.firestore();

const profileService = {
    getUserProfile: async (userId) => {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                return { id: userDoc.id, ...userDoc.data() };
            } else {
                throw new Error('User not found');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    updateUserProfile: async (userId, profileData) => {
        try {
            await db.collection('users').doc(userId).update(profileData);
            return { success: true };
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    calculateProfileCompletion: (userData) => {
        const requiredFields = ['fullName', 'email', 'matricule', 'speciality', 'phoneNumber'];
        const optionalFields = ['wilaya', 'commune', 'birthdate', 'instagram', 'interests'];

        let completedRequired = requiredFields.filter(field => userData[field]).length;
        let completedOptional = optionalFields.filter(field => userData[field]).length;

        const requiredPercentage = (completedRequired / requiredFields.length) * 70;
        const optionalPercentage = (completedOptional / optionalFields.length) * 30;

        return Math.round(requiredPercentage + optionalPercentage);
    }
};

export default profileService;