import React from 'react';
import AdminGuard from './AdminGuard';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminCounter from './AdminCounter';
import AdminProducts from './AdminProducts';
import AdminInventory from './AdminInventory';
import AdminOrders from './AdminOrders';
import AdminReturns from './AdminReturns';
import AdminBilling from './AdminBilling';
import AdminCustomers from './AdminCustomers';
import AdminSupport from './AdminSupport';
import AdminCoupons from './AdminCoupons';
import AdminReviews from './AdminReviews';
import AdminBulkEmail from './AdminBulkEmail';
import AdminSeo from './AdminSeo';
import type { AdminSection } from '../../types';
import { FEATURES } from '../../config/features';


interface Props {
  section?: AdminSection;
}

const AdminPage: React.FC<Props> = ({ section = 'dashboard' }) => {
  const activeSection =
    (!FEATURES.reviewsAndFeedback && section === 'reviews') ||
    (!FEATURES.counterSale && section === 'counter') ||
    section === 'compliance' ||
    section === 'analytics'
      ? 'dashboard'
      : section;

  return (
    <AdminGuard>
      <AdminLayout section={activeSection}>
        {activeSection === 'dashboard' && <AdminDashboard />}
        {FEATURES.counterSale && activeSection === 'counter' && <AdminCounter />}
        {activeSection === 'products' && <AdminProducts />}
        {activeSection === 'inventory' && <AdminInventory />}
        {activeSection === 'orders' && <AdminOrders />}
        {activeSection === 'returns' && <AdminReturns />}
        {activeSection === 'billing' && <AdminBilling />}
        {activeSection === 'customers' && <AdminCustomers />}
        {activeSection === 'support' && <AdminSupport />}
        {activeSection === 'coupons' && <AdminCoupons />}
        {FEATURES.reviewsAndFeedback && activeSection === 'reviews' && <AdminReviews />}
        {activeSection === 'bulk-email' && <AdminBulkEmail />}
        {activeSection === 'seo' && <AdminSeo />}
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminPage;
