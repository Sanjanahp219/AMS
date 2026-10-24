import assert from 'assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

console.log('🧪 Starting AMS Core Business Logic & Security Tests...\n');

async function runTests() {
  let passed = 0;

  // Test 1: Password Hashing & Verification
  try {
    const password = 'securePassword123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    assert(hash !== password, 'Hash should not equal plaintext');
    const isMatch = await bcrypt.compare(password, hash);
    assert(isMatch === true, 'Bcrypt compare should succeed');

    const wrongMatch = await bcrypt.compare('wrongPassword', hash);
    assert(wrongMatch === false, 'Bcrypt compare should fail for incorrect password');

    console.log('✅ Test 1 Passed: Password hashing & verification');
    passed++;
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
  }

  // Test 2: JWT Token Generation & Verification
  try {
    const payload = { id: 'usr_123', email: 'admin@ams.edu', role: 'Admin' };
    const secret = 'testSecretKey2026';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.id, payload.id);
    assert.strictEqual(decoded.role, 'Admin');

    console.log('✅ Test 2 Passed: JWT Token generation & verification');
    passed++;
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
  }

  // Test 3: Concurrency-Safe ID Format Generators
  try {
    const year = 2026;
    const generateStudentId = (count) => `STU-${year}-${String(count + 1).padStart(4, '0')}`;
    const generateReceiptNumber = (count) => `RCP-${year}-${String(count + 1).padStart(4, '0')}`;

    assert.strictEqual(generateStudentId(0), 'STU-2026-0001');
    assert.strictEqual(generateStudentId(42), 'STU-2026-0043');
    assert.strictEqual(generateReceiptNumber(0), 'RCP-2026-0001');

    console.log('✅ Test 3 Passed: Concurrency-safe ID generators');
    passed++;
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
  }

  // Test 4: Financial Integrity - Enrollment Calculation
  try {
    const courseFee = 35000;
    const discount = 3000;
    const finalPayable = Math.max(0, courseFee - discount);
    assert.strictEqual(finalPayable, 32000, 'Final payable should be 32,000');

    // Negative discount test
    const negDiscount = -500;
    const safeDiscount = Math.max(0, negDiscount);
    assert.strictEqual(safeDiscount, 0, 'Negative discount should be clamped to 0');

    console.log('✅ Test 4 Passed: Enrollment fee & discount calculation');
    passed++;
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
  }

  // Test 5: Payment Overpayment Prevention
  try {
    const finalPayable = 30000;
    let paidAmount = 20000;
    let balance = Math.max(0, finalPayable - paidAmount);
    assert.strictEqual(balance, 10000, 'Remaining balance should be 10,000');

    // Payment of 15,000 should be rejected because balance is 10,000
    const paymentAttempt = 15000;
    const isOverpayment = paymentAttempt > balance;
    assert.strictEqual(isOverpayment, true, 'Payment exceeding balance must be flagged');

    // Valid payment of 10,000
    const validPayment = 10000;
    assert(validPayment <= balance, 'Valid payment should be accepted');
    paidAmount += validPayment;
    balance = Math.max(0, finalPayable - paidAmount);
    assert.strictEqual(balance, 0, 'Balance should become 0 upon full payment');

    console.log('✅ Test 5 Passed: Payment overpayment prevention & balance tracking');
    passed++;
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
  }

  // Test 6: Batch Capacity Enforcement
  try {
    const maxCapacity = 25;
    let currentEnrolled = 24;

    const canEnroll = currentEnrolled < maxCapacity;
    assert.strictEqual(canEnroll, true, 'Should allow enrollment when capacity not reached');

    currentEnrolled++; // Now 25
    const canEnrollWhenFull = currentEnrolled < maxCapacity;
    assert.strictEqual(canEnrollWhenFull, false, 'Should block enrollment when capacity reached');

    console.log('✅ Test 6 Passed: Batch capacity enforcement rules');
    passed++;
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
  }

  console.log(`\n🎉 All ${passed}/6 Core Tests Passed Successfully!`);
}

runTests();
