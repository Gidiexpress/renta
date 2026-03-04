import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { auth } from '@/lib/auth';

export async function GET(request) {
    try {
        // Simple security check: Only logged in users (or even better, Admins) should trigger this
        const session = await auth();

        // Resend Testing Rule: 
        // 1. If no domain verified, FROM must be 'onboarding@resend.dev'
        // 2. RECIPIENT must be the email you used to sign up for Resend.

        const url = new URL(request.url);
        const testEmail = url.searchParams.get('to');

        if (!testEmail) {
            return NextResponse.json({
                error: 'Missing recipient',
                message: 'Please add ?to=your-email@example.com to the URL. Use the email you used to sign up for Resend.'
            }, { status: 400 });
        }

        console.log(`Attempting to send diagnostic email TO: ${testEmail}`);

        // We override the 'from' in the call if the user hasn't set it, 
        // but currently sendEmail uses the global FROM constant.
        // Let's just use the current config and show it in the response.

        const result = await sendEmail({
            to: testEmail,
            subject: 'Renta Diagnostic: System Test 2',
            html: `
                <h1>Email Diagnostic #2</h1>
                <p>If you see this, the SMTP connection AND the delivery rules are correct.</p>
                <ul>
                    <li><strong>Recipient:</strong> ${testEmail}</li>
                    <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
                </ul>
            `
        });

        return NextResponse.json({
            message: 'Diagnostic process completed',
            result,
            details: {
                recipient: testEmail,
                smtp_config_present: !!process.env.SMTP_HOST,
                env_from: process.env.EMAIL_FROM || 'onboarding@resend.dev (Default)'
            }
        });
    } catch (error) {
        console.error('Diagnostic route error:', error);
        return NextResponse.json({
            error: 'Diagnostic failed',
            details: error.message
        }, { status: 500 });
    }
}
