/**
 * Test script to add subscription days via admin API
 */

const API_URL = 'http://localhost:3007';

async function testAddSubscription() {
    try {
        // 1. Login as admin
        console.log('1. Logging in as admin...');
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '+998901234567',
                password: 'admin123'
            })
        });
        
        const loginData = await loginRes.json();
        if (!loginData.success) {
            console.error('Login failed:', loginData.error);
            return;
        }
        
        const token = loginData.token;
        console.log('✓ Logged in successfully');

        // 2. Get all teachers
        console.log('\n2. Fetching teachers...');
        const teachersRes = await fetch(`${API_URL}/api/teachers`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const teachersData = await teachersRes.json();
        if (!teachersData.success) {
            console.error('Failed to fetch teachers:', teachersData.error);
            return;
        }

        // Find Aziza Karimova
        const aziza = teachersData.teachers.find(t => t.name === 'Aziza Karimova');
        if (!aziza) {
            console.error('Aziza Karimova not found');
            return;
        }

        console.log(`✓ Found Aziza Karimova (ID: ${aziza._id})`);
        console.log(`  Current days remaining: ${aziza.daysRemaining || 0}`);
        console.log(`  Subscription status: ${aziza.subscriptionStatus}`);

        // 3. Add 7 days subscription
        console.log('\n3. Adding 7 days subscription...');
        const addSubRes = await fetch(`${API_URL}/api/admin/subscription`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: aziza._id,
                days: 7
            })
        });

        const addSubData = await addSubRes.json();
        if (!addSubData.success) {
            console.error('Failed to add subscription:', addSubData.error);
            return;
        }

        console.log('✓ Subscription added successfully!');
        console.log(`  Message: ${addSubData.message}`);
        console.log(`  New end date: ${addSubData.subscriptionEndDate}`);
        console.log(`  Days remaining: ${addSubData.daysRemaining}`);

        // 4. Verify by fetching teachers again
        console.log('\n4. Verifying...');
        const verifyRes = await fetch(`${API_URL}/api/teachers`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const verifyData = await verifyRes.json();
        const updatedAziza = verifyData.teachers.find(t => t._id === aziza._id);
        
        console.log('✓ Verification complete:');
        console.log(`  Days remaining: ${updatedAziza.daysRemaining}`);
        console.log(`  Subscription status: ${updatedAziza.subscriptionStatus}`);
        console.log(`  End date: ${updatedAziza.subscriptionEndDate}`);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAddSubscription();
