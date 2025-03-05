import { db } from '../firebase.js';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

class ModuleSubscription {
    constructor() {
        this.userId = null;
        this.initUserId();
    }

    // Initialize or retrieve the user ID
    async initUserId() {
        let userId = localStorage.getItem('campusElkseurUserId');
        
        if (!userId) {
            // Generate a random user ID if none exists
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('campusElkseurUserId', userId);
        }
        
        this.userId = userId;
        return userId;
    }

    // Subscribe to a module
    async subscribeToModule(moduleId, moduleName) {
        try {
            const userId = await this.initUserId();
            const subscriptionRef = doc(db, "subscriptions", `${userId}_${moduleId}`);
            
            await setDoc(subscriptionRef, {
                userId: userId,
                moduleId: moduleId,
                moduleName: moduleName,
                subscribedAt: new Date(),
                active: true,
                lastNotified: null
            });
            
            return true;
        } catch (error) {
            console.error("Error subscribing to module:", error);
            return false;
        }
    }

    // Unsubscribe from a module
    async unsubscribeFromModule(moduleId) {
        try {
            const userId = await this.initUserId();
            const subscriptionRef = doc(db, "subscriptions", `${userId}_${moduleId}`);
            
            await deleteDoc(subscriptionRef);
            return true;
        } catch (error) {
            console.error("Error unsubscribing from module:", error);
            return false;
        }
    }

    // Check if user is subscribed to a module
    async isSubscribed(moduleId) {
        try {
            const userId = await this.initUserId();
            const subscriptionRef = doc(db, "subscriptions", `${userId}_${moduleId}`);
            const docSnap = await getDoc(subscriptionRef);
            
            return docSnap.exists();
        } catch (error) {
            console.error("Error checking subscription:", error);
            return false;
        }
    }

    // Get all user subscriptions
    async getUserSubscriptions() {
        try {
            const userId = await this.initUserId();
            const subscriptionsRef = collection(db, "subscriptions");
            const q = query(subscriptionsRef, where("userId", "==", userId));
            
            const querySnapshot = await getDocs(q);
            const subscriptions = [];
            
            querySnapshot.forEach((doc) => {
                subscriptions.push(doc.data());
            });
            
            return subscriptions;
        } catch (error) {
            console.error("Error getting subscriptions:", error);
            return [];
        }
    }

    // Request notification permission
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }
        
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    // Send a test notification
    async sendTestNotification() {
        if (!('Notification' in window)) {
            return false;
        }
        
        if (Notification.permission === 'granted') {
            new Notification('Campus Elkseur', {
                body: 'Les notifications sont activées!',
                icon: '/assets/img/LOGO.png'
            });
            return true;
        } else {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification('Campus Elkseur', {
                    body: 'Les notifications sont activées!',
                    icon: '/assets/img/LOGO.png'
                });
                return true;
            }
        }
        return false;
    }
}

export default ModuleSubscription;