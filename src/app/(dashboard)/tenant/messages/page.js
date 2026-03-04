import MessageCenter from '@/components/MessageCenter';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = { title: 'Messages - Renta' };

export default function TenantMessagesPage() {
    return (
        <div className="fade-in">
            <header className="mb-6">
                <h1 style={{ fontSize: 'var(--text-2xl)' }}>Messages</h1>
                <p className="text-muted">Chat directly with your landlords.</p>
            </header>
            <Suspense fallback={<div className="flex justify-center p-12 text-muted"><Loader2 className="animate-spin" /></div>}>
                <MessageCenter />
            </Suspense>
        </div>
    );
}