import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

interface ToastNotificationProps {
    show: boolean;
    message: string;
    onClose: () => void;
}

export default function ToastNotification({ show, message, onClose }: ToastNotificationProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-emerald-600 text-white py-3 px-6 rounded-full shadow-lg z-50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    role="alert"
                >
                    <FiCheck className="h-5 w-5" />
                    <p className="font-semibold">{message}</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
