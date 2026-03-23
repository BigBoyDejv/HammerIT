import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contractService } from '../services';

interface Contract {
    id: string;
    job_request_id: string;
    craftsman_id: string;
    client_id: string;
    final_price: number;
    status: 'active' | 'completed' | 'cancelled' | 'disputed';
    payment_status: 'pending' | 'paid' | 'refunded';
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    job?: {
        title: string;
        description: string;
        location: string;
    };
    craftsman?: {
        full_name: string;
        avatar_url: string | null;
    };
    client?: {
        full_name: string;
        avatar_url: string | null;
    };
}

export function ContractsPage() {
    const { user, profile } = useAuth();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    useEffect(() => {
        loadContracts();
    }, [profile]);

    const loadContracts = async () => {
        setLoading(true);
        try {
            let data;
            if (profile?.role === 'client') {
                data = await contractService.getMyContractsAsClient(user!.id);
            } else {
                data = await contractService.getMyContractsAsCraftsman(user!.id);
            }
            setContracts(data || []);
        } catch (error) {
            console.error('Error loading contracts:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredContracts = contracts.filter(c =>
        activeTab === 'active'
            ? c.status === 'active'
            : c.status === 'completed'
    );

    const getStatusBadge = (status: string, paymentStatus: string) => {
        if (status === 'active') {
            return <span className="status-badge bg-yellow-100 text-yellow-800">Prebieha</span>;
        } else if (status === 'completed') {
            return <span className="status-badge bg-green-100 text-green-800">Dokončená</span>;
        } else if (status === 'cancelled') {
            return <span className="status-badge bg-red-100 text-red-800">Zrušená</span>;
        }
        return null;
    };

    const getPaymentBadge = (paymentStatus: string) => {
        if (paymentStatus === 'paid') {
            return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Zaplatené</span>;
        } else if (paymentStatus === 'pending') {
            return <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Čaká na platbu</span>;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#191970]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Moje zmluvy</h1>

            {/* Taby */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'active'
                            ? 'border-b-2 border-[#191970] text-[#191970]'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Aktívne ({contracts.filter(c => c.status === 'active').length})
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'completed'
                            ? 'border-b-2 border-[#191970] text-[#191970]'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Dokončené ({contracts.filter(c => c.status === 'completed').length})
                </button>
            </div>

            {filteredContracts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Žiadne zmluvy</h3>
                    <p className="text-gray-500">
                        {activeTab === 'active'
                            ? 'Momentálne nemáte žiadne aktívne zmluvy.'
                            : 'Momentálne nemáte žiadne dokončené zmluvy.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredContracts.map((contract) => (
                        <div key={contract.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {contract.job?.title || 'Neznáma práca'}
                                        </h3>
                                        {getStatusBadge(contract.status, contract.payment_status)}
                                    </div>

                                    <p className="text-gray-600 mb-3 line-clamp-2">
                                        {contract.job?.description}
                                    </p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <span>📍 {contract.job?.location || 'Neznáma lokalita'}</span>
                                        <span>💰 {contract.final_price}€</span>
                                        <span>📅 {new Date(contract.created_at).toLocaleDateString('sk-SK')}</span>
                                        {getPaymentBadge(contract.payment_status)}
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        {profile?.role === 'client' ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Remeselník:</span>
                                                <span className="font-medium">{contract.craftsman?.full_name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Klient:</span>
                                                <span className="font-medium">{contract.client?.full_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Link
                                    to={`/contracts/${contract.id}`}
                                    className="btn-outline ml-4"
                                >
                                    Detail
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}