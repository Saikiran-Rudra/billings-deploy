'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Company } from '@/types';
import { CompanyOverviewCard } from '@/components/settings/CompanyOverviewCard';
import { TaxInfoCard } from '@/components/settings/TaxInfoCard';
import { BankDetailsCard } from '@/components/settings/BankDetailsCard';
import { ModulesCard } from '@/components/settings/ModulesCard';
import { UsersTable, CompanyUser } from '@/components/settings/UsersTable';

type CompanySettingsUpdatePayload = Partial<Company> & {
  taxInfo?: Partial<NonNullable<Company['taxInfo']>>;
};

export default function CompanySettingsPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = company?._id;

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const response = await api.get<{ company: Company }>('/companies/my-company');
        setCompany(response.company);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch company');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!companyId) return;
      try {
        setUsersLoading(true);
        const response = await api.get<{ users: CompanyUser[] }>('/companies/users');
        setUsers(response.users);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setUsersLoading(false);
      }
    };

    if (companyId) {
      fetchUsers();
    }
  }, [companyId]);

  // Save handler for all card updates
  const handleSaveCompanyData = async (data: CompanySettingsUpdatePayload) => {
    try {
      const response = await api.put<{ company: Company }>(
        `/companies/${company?._id}`,
        data
      );
      setCompany(response.company);
      setError(null);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to save changes');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company settings...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-medium">Company not found</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
        <p className="text-gray-600 mt-2">Manage your company information, team members, and billing settings.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Company Overview Section */}
      <section>
        <CompanyOverviewCard 
          company={company}
          onSave={handleSaveCompanyData}
        />
      </section>

      {/* Settings Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaxInfoCard 
          company={company}
          onSave={handleSaveCompanyData}
        />
        <BankDetailsCard 
          company={company}
          onSave={handleSaveCompanyData}
        />
      </section>

      {/* Modules Section */}
      <section>
        <ModulesCard company={company} />
      </section>

      {/* Users & Permissions Section */}
      <section>
        <UsersTable
          users={users}
          isLoading={usersLoading}
        />
      </section>
    </div>
  );
}
