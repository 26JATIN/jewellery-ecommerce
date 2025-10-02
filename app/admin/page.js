"use client";
import Dashboard from '../components/Dashboard';
import withAdminAuth from '../components/withAdminAuth';

function AdminPage() {
    return <Dashboard />;
}

export default withAdminAuth(AdminPage);