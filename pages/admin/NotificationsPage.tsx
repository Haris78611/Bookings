
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Badge } from '../../components/UI';
import { PageHeader, TableWrapper, EmptyState } from '../../components/AdminUI';

const AdminNotificationsPage: React.FC = () => {
    const { emailNotifications } = useAppContext();

    return (
        <>
            <PageHeader title="Email Notification Log" />
            <p className="text-sm text-gray-500 mb-6 -mt-4">This is a log of simulated emails that would be triggered by backend events.</p>
            <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
                <TableWrapper>
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50/80">
                            <tr className="text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Recipient</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {emailNotifications.map(notif => (
                                <tr key={notif.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">{new Date(notif.sentAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800">{notif.to}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{notif.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <Badge variant="success">Sent</Badge>
                                    </td>
                                </tr>
                            ))}
                            {emailNotifications.length === 0 && <EmptyState message="No notifications have been sent yet." />}
                        </tbody>
                    </table>
                </TableWrapper>
            </Card>
        </>
    );
};

export default AdminNotificationsPage;
