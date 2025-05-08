import Navbar from "@/components/Navbar/Navbar";

export default function BelanjaLayout({ children }) {
    return (
        <div className="">
            <Navbar />
            <main className="">{children}</main>
        </div>
    );
}