import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'AFFILIATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const affiliateId = parseInt(session.user.id);

    const [totalClicks, conversions, wallet] = await Promise.all([
      prisma.affiliateReferral.count({ where: { affiliateId } }),
      prisma.affiliateReferral.count({
        where: {
          affiliateId,
          status: 'CONVERTED',
        },
      }).catch(async () => {
        const referrals = await prisma.affiliateReferral.findMany({
          where: { affiliateId },
          include: {
            referredUser: {
              select: {
                rentals: { where: { status: 'ACTIVE' }, select: { id: true } },
              },
            },
          },
        });
        return referrals.filter((ref) => ref.referredUser?.rentals?.length > 0).length;
      }),
      prisma.wallet.findUnique({
        where: { userId: affiliateId },
        select: { balance: true },
      }),
    ]);

    return NextResponse.json({
      totalClicks,
      conversions,
      totalEarnings: wallet?.balance || 0,
    });
  } catch (error) {
    console.error('Affiliate stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
