import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payments = await prisma.payment.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate basic stats for the dashboard
        const stats = {
            totalRevenue: payments.filter(p => p.status === 'SUCCESS').reduce((acc, p) => acc + p.amount, 0),
            totalPromotions: payments.filter(p => p.type === 'PROMOTION' && p.status === 'SUCCESS').length,
            activeRentals: payments.filter(p => p.type === 'RENT' && p.status === 'SUCCESS').length,
            pendingPayouts: 0 // Placeholder
        };

        return NextResponse.json({ payments, stats });
    } catch (error) {
        console.error('Admin payments error:', error);
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }
}
