import apiClient from './api';
import type { PaymentIntentData, Enrollment } from '../types';

export async function createPaymentIntent(courseId: number): Promise<PaymentIntentData> {
    const { data } = await apiClient.post<PaymentIntentData>('/payments/intent', { courseId });
    return data;
}

export async function confirmPayment(paymentIntentId: string): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>('/payments/confirm', { paymentIntentId });
    return data;
}

export async function requestRefund(enrollmentId: number): Promise<void> {
    await apiClient.post('/payments/refund', { enrollmentId });
}

