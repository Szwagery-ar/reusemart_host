import Navbar from "@/components/Navbar/Navbar";
import Footer from '../../components/Footer/Footer';

export default function BelanjaLayout({ children }) {
    return (
        <div className="">
            <Navbar />
            <main className="">{children}</main>
            <Footer />
        </div>
    );
}