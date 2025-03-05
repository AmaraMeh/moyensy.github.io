import { db } from '../firebase.js';
import { doc, getDoc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

class DownloadTracker {
    // Track a new download
    static async trackDownload(resourceId, moduleId) {
        try {
            const resourceRef = doc(db, "resources", resourceId);
            const docSnap = await getDoc(resourceRef);
            
            if (docSnap.exists()) {
                await updateDoc(resourceRef, {
                    downloads: increment(1),
                    lastDownloaded: new Date()
                });
            } else {
                // Create a new document for this resource
                await setDoc(resourceRef, {
                    resourceId: resourceId,
                    moduleId: moduleId,
                    downloads: 1,
                    firstTracked: new Date(),
                    lastDownloaded: new Date()
                });
            }
            return true;
        } catch (error) {
            console.error("Error tracking download:", error);
            return false;
        }
    }

    // Get the download count for a resource
    static async getDownloadCount(resourceId) {
        try {
            const resourceRef = doc(db, "resources", resourceId);
            const docSnap = await getDoc(resourceRef);
            
            if (docSnap.exists()) {
                return docSnap.data().downloads || 0;
            }
            return 0;
        } catch (error) {
            console.error("Error getting download count:", error);
            return 0;
        }
    }

    // Check if a resource is popular (more than 50 downloads)
    static async isPopular(resourceId) {
        const downloads = await this.getDownloadCount(resourceId);
        return downloads >= 50;
    }

    // Check if a resource is very popular (more than 100 downloads)
    static async isVeryPopular(resourceId) {
        const downloads = await this.getDownloadCount(resourceId);
        return downloads >= 100;
    }
}

export default DownloadTracker;