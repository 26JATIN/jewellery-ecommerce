"use client";
import Users from '../../components/Users';
import withAdminAuth from '../../components/withAdminAuth';

function UsersPage() {
    return <Users />;
}

export default withAdminAuth(UsersPage);