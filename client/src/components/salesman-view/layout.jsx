import SalesmanHeader from "./header";

function SalesmanLayout() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* common header */}
      <SalesmanHeader />
      <main className="flex flex-col w-full">
        {/* <Outlet /> */}
      </main>
    </div>
  );
}

export default SalesmanLayout;
