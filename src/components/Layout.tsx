import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
    const location = useLocation();
    const isChatPage = location.pathname === '/chat';

    return (
        <div className={isChatPage ? "flex flex-col h-screen" : ""}>
            <Navbar />
            <main className={isChatPage ? "flex-1 overflow-hidden" : ""}>
                <Outlet />
            </main>
        </div>
    );
}
