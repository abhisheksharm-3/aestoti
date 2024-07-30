import { Client, Databases, Account, Query, type Models, ID } from 'appwrite';

const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const account = new Account(client);

export interface Session {
    $id: string;
    userId: string;
    startTime: Date;
    duration: number;
    type: string;
}

let currentUserId: string | null = null;

async function signup(email: string, password: string, name: string): Promise<string> {
    try {
        const user = await account.create(ID.unique(), email, password, name);
        currentUserId = user.$id;

        // Automatically log in the user after successful signup
        await account.createEmailPasswordSession(email, password);

        return user.$id;
    } catch (error) {
        console.error('Signup failed:', error);
        throw error;
    }
}

async function login(email: string, password: string): Promise<string> {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        const user = await account.get();
        currentUserId = user.$id;
        return user.$id;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

async function logout(): Promise<void> {
    try {
        await account.deleteSession('current');
        currentUserId = null;
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
}

async function checkLoggedInUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
        const user = await account.get();
        return user;
    } catch (error) {
        console.error('Error checking logged in user:', error);
        return null;
    }
}

async function storeSessionData(startTime: Date, duration: number, type: string): Promise<Models.Document> {
    if (!currentUserId) {
        throw new Error('User not logged in');
    }

    const session: Session = {
        $id: ID.unique(),
        userId: currentUserId,
        startTime,
        duration,
        type,
    };

    return await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_ID,
        session.$id,
        session
    );
}

async function getSessionData(userId: string): Promise<Session[]> {
    const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_ID,
        [Query.equal('userId', userId)]
    );

    return response.documents.map(doc => ({
        $id: doc.$id,
        userId: doc.userId,
        startTime: new Date(doc.startTime),
        duration: doc.duration,
        type: doc.type
    }));
}

async function calculateStatistics(userId: string): Promise<any> {
    const sessions: Session[] = await getSessionData(userId);
    const totalSessions = sessions.length;
    const totalFocusTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageSessionLength = totalFocusTime / totalSessions;
    const longestSession = Math.max(...sessions.map(session => session.duration));
    const totalDays = new Set(sessions.map(session => new Date(session.startTime).toDateString())).size;

    return {
        totalSessions,
        totalFocusTime,
        averageSessionLength,
        longestSession,
        totalDays,
    };
}

export { signup, login, logout, storeSessionData, getSessionData, calculateStatistics, checkLoggedInUser };
