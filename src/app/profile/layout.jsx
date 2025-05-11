import ProfileSidebar from "@/components/ProfileSidebar/ProfileSidebar";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

export default function ProfileLayout({ children }) {
    return (
        <div className="">
            <Navbar />
            <div className="px-20 my-20 min-h-200">
                <div className="mt-25 gap-4">
                    <ProfileSidebar />
                    <main className="ml-70">{children}</main>
                </div>

            </div>
            <Footer />
        </div>
    );
}