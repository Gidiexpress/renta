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
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where = {};
        if (status) where.status = status;

        const [escrows, total] = await Promise.all([
            prisma.escrow.findMany({
                where,
                include: {
                    rental: {
                        include: {
                            property: {
                                select: {
                                    title: true,
                                    landlord: {
                                        select: {
                                            id: true,
                                            firstName: true,
                                            lastName: true
                                        }
                                    }
                                }
                            },
                            tenant: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    },
                    releasedBy: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.escrow.count({ where }),
        ]);

        return NextResponse.json({
            escrows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Admin escrow list error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
