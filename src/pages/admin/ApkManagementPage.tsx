import AdminDashboard from '../AdminDashboard';

const ApkManagementPage = () => {
  return (
    <>
      <header className="bg-[#1A1A1A] border-b border-[#2A2A2A] p-6">
        <h1 className="text-2xl font-bold text-white">APK Management</h1>
      </header>
      <AdminDashboard hideLayout={true} section="apkManagement" />
    </>
  );
};

export default ApkManagementPage;

