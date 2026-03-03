import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where = {};
        if (type) where.type = type;

        const [commissions, total] = await Promise.all([
            prisma.commission.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            role: true
                        }
                    },
                    escrow: {
                        include: {
                            rental: {
                                include: {
                                    property: {
                                        select: {
                                            title: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.commission.count({ where }),
        ]);

        return NextResponse.json({
            commissions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Admin commissions list error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
