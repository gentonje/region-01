
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { AccountTypeManager } from "@/components/admin/AccountTypeManager";

const AccountManagement = () => {
  return (
    <div className="w-full py-4 space-y-1">
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Home" },
          { href: "/admin/users", label: "Admin" },
          { label: "Account Management", isCurrent: true }
        ]}
      />
      
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Account Management</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border w-full">
        <AccountTypeManager />
      </div>
    </div>
  );
};

export default AccountManagement;
