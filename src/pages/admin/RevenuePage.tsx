import AdminDashboard from '../AdminDashboard';

const RevenuePage = () => {
  return (
    <>
      <header className="bg-[#1A1A1A] border-b border-[#2A2A2A] p-6">
        <h1 className="text-2xl font-bold text-white">Revenue & Withdrawals</h1>
      </header>
      <AdminDashboard hideLayout={true} section="revenue" />
    </>
  );
};

export default RevenuePage;

