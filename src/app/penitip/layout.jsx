import PenitipSidebar from "@/components/PenitipSidebar/PenitipSidebar";

export default function PenitipLayout({ children }) {
    return (
        <div className="">
              <PenitipSidebar />
              <main className="ml-64 p-6">{children}</main>
        </div>
    )
}