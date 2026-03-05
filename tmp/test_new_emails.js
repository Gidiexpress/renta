const {
    sendNinStatusEmail,
    sendPropertyRejectedEmail,
    sendInspectionBookedEmail,
    sendMaintenanceUpdateEmail,
    sendCommissionEarnedEmail,
    sendNewMessageEmail
} = require('../src/lib/email');

// Mock Data
const user = { email: 'techbridgehq@gmail.com', firstName: 'Tester' };
const property = { title: 'Test Self-Con', address: '123 Test St, Tanke' };

async function runTests() {
    console.log('--- STARTING EMAIL TEMPLATE TESTS ---');

    // Test 1: NIN Approved
    console.log('\n1. Testing NIN Approved...');
    await sendNinStatusEmail(user, 'VERIFIED');

    // Test 2: NIN Rejected
    console.log('\n2. Testing NIN Rejected...');
    await sendNinStatusEmail(user, 'FAILED', 'NIN document was blurry.');

    // Test 3: Property Rejected
    console.log('\n3. Testing Property Rejected...');
    await sendPropertyRejectedEmail(user, property, 'Please upload better exterior photos.');

    // Test 4: Inspection Booked
    console.log('\n4. Testing Inspection Booked...');
    await sendInspectionBookedEmail({
        tenant: user,
        landlord: { email: 'techbridgehq@gmail.com' },
        property,
        date: '2026-03-10',
        time: '10:00 AM'
    });

    // Test 5: Maintenance Update
    console.log('\n5. Testing Maintenance Update...');
    await sendMaintenanceUpdateEmail({
        tenant: user,
        request: { title: 'Broken Tap' },
        newStatus: 'IN_PROGRESS'
    });

    // Test 6: Commission Earned
    console.log('\n6. Testing Commission Earned...');
    await sendCommissionEarnedEmail(user, 5000, 'SCOUT');

    // Test 7: New Message
    console.log('\n7. Testing New Message Alert...');
    await sendNewMessageEmail(user, 'Landlord John');

    console.log('\n--- TESTS COMPLETED ---');
}

runTests().catch(console.error);
