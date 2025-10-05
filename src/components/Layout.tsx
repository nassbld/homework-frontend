import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
    return (
        <div>
            <Navbar />
            <main>
                <Outlet /> {/* Les pages (HomePage, LoginPage, etc.) seront rendues ici */}
            </main>
        </div>
    );
}
