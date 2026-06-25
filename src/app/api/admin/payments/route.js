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
                rental: {
                    include: {
                        tenant: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate pending payouts
        const pendingWithdrawals = await prisma.withdrawalRequest.aggregate({
            _sum: { amount: true },
            where: { status: 'PENDING' }
        });

        // Calculate basic stats for the dashboard
        const stats = {
            totalRevenue: payments.filter(p => p.status === 'SUCCESS').reduce((acc, p) => acc + Number(p.amount), 0),
            totalPromotions: 0, // Promotions feature not yet implemented
            activeRentals: payments.filter(p => p.status === 'SUCCESS').length,
            pendingPayouts: Number(pendingWithdrawals._sum.amount || 0)
        };

        return NextResponse.json({ payments, stats });
    } catch (error) {
        console.error('Admin payments error:', error);
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }
}
