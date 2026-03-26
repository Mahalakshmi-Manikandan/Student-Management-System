import Navbar from "./Navbar";
// import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div
      className="min-h-screen bg-white bg-contain bg-no-repeat bg-center bg-fixed"
      style={{ backgroundImage: "url('/college.png')" }}
    >
      {/* <Sidebar /> */}

      <div>
        <Navbar />

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}