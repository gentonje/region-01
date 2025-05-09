
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { AccountTypeManager } from "@/components/admin/AccountTypeManager";

const AccountManagement = () => {
  return (
    <div className="mx-1 sm:mx-4 py-4 space-y-6">
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Home" },
          { href: "/admin/users", label: "Admin" },
          { label: "Account Management", isCurrent: true }
        ]}
      />
      
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Account Management</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border">
        <AccountTypeManager />
      </div>
    </div>
  );
};

export default AccountManagement;
