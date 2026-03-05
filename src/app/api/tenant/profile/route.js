import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'TENANT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(session.user.id);

        const profile = await prisma.tenantProfile.findUnique({
            where: { userId }
        });

        return NextResponse.json(profile || {});
    } catch (error) {
        console.error('Error fetching tenant profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'TENANT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const userId = parseInt(session.user.id);

        // Basic validation
        if (!data.employmentStatus || !data.monthlyIncome) {
            return NextResponse.json({ error: 'Employment status and monthly income are required' }, { status: 400 });
        }

        const profile = await prisma.tenantProfile.upsert({
            where: { userId },
            update: {
                employmentStatus: data.employmentStatus,
                monthlyIncome: Number(data.monthlyIncome),
                employerName: data.employerName || null,
                previousLandlordReference: data.previousLandlordReference || null,
            },
            create: {
                userId,
                employmentStatus: data.employmentStatus,
                monthlyIncome: Number(data.monthlyIncome),
                employerName: data.employerName || null,
                previousLandlordReference: data.previousLandlordReference || null,
            }
        });

        return NextResponse.json(profile, { status: 200 });
    } catch (error) {
        console.error('Error updating tenant profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
