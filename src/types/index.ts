export type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'STUDENT' | 'TEACHER';
    bio: string;
};

export type UserSnippet = {
    id: number;
    firstName: string;
    lastName: string;
}

export type Category =
    | "CUISINE"
    | "COUTURE"
    | "BRICOLAGE"
    | "MECANIQUE"
    | "JARDINAGE"
    | "AUTRE";

export const CATEGORY_IMAGES: Record<Category, string> = {
    "CUISINE": '/images/cuisine.jpg',
    "COUTURE": '/images/couture.jpg',
    "BRICOLAGE": '/images/bricolage.jpg',
    "MECANIQUE": '/images/mecanique.jpg',
    "JARDINAGE": '/images/jardinage.jpg',
    "AUTRE": '/images/default-course.jpg',
};

export interface Course {
    id: number;
    title: string;
    description: string;
    category: Category;
    price: number;
    city: string;
    courseDateTime: string;
    duration: number;
    maxStudents: number | null;
    enrolledStudentsCount: number;
    createdAt: string;
    teacher: User;
}

export interface PaymentIntentData {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    platformFee: number;
    teacherAmount: number;
    paymentId: number;
    publishableKey: string;
}

export interface Enrollment {
    id: number;
    enrolledAt: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    course: Course;
}

export interface ChatMessageResponse {
    id: number;
    senderId: number;
    senderFirstName: string;
    senderLastName: string;
    content: string;
    timestamp: string;
}

export interface ChatMessage {
    id: number;
    sender: {
        id: number;
        firstName: string;
        lastName: string;
    };
    content: string;
    timestamp: string;
}


export interface ConversationSnippet {
    conversationId: number;
    otherUserFirstName: string;
    otherUserLastName: string;
    otherUserId: number;
    lastMessageContent: string;
    lastMessageTimestamp: string ;
    lastMessageSenderId?: number;
}

export interface TeacherDashboardStats {
    totalCourses: number;
    activeStudents: number;
    monthlyRevenue: number;
    totalRevenue: number;
}