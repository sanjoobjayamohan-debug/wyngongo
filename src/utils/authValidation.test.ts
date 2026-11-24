import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  canAccessPartnerDashboard,
  evaluatePasswordStrength,
  isValidMobileNumber,
  isValidPhoneOrEmail,
  PARTNER_CATEGORY_OPTIONS,
} from './authValidation.ts';

describe('Auth Validation Utilities', () => {
  it('evaluates empty password with 0% track and guidance label', () => {
    const res = evaluatePasswordStrength('');
    assert.equal(res.score, 0);
    assert.equal(res.percent, 0);
    assert.equal(res.tone, 'neutral');
    assert.equal(res.label, 'Use 8+ characters, a number and mixed case');
  });

  it('scores password strength in 25% steps with correct color tones and labels', () => {
    const tooShort = evaluatePasswordStrength('Ab1');
    assert.equal(tooShort.tone, 'red');
    assert.equal(tooShort.percent, 25);

    const weak = evaluatePasswordStrength('alllowercase');
    assert.equal(weak.score, 1);
    assert.equal(weak.percent, 25);
    assert.equal(weak.tone, 'red');
    assert.equal(weak.label, 'Weak');

    const fair = evaluatePasswordStrength('MixedCase');
    assert.equal(fair.score, 2);
    assert.equal(fair.percent, 50);
    assert.equal(fair.tone, 'amber');
    assert.equal(fair.label, 'Fair');

    const good = evaluatePasswordStrength('Wayanad9');
    assert.equal(good.score, 3);
    assert.equal(good.percent, 75);
    assert.equal(good.tone, 'emerald');
    assert.equal(good.label, 'Good');

    const strong = evaluatePasswordStrength('Wayanad9!');
    assert.equal(strong.score, 4);
    assert.equal(strong.percent, 100);
    assert.equal(strong.tone, 'emerald');
    assert.equal(strong.label, 'Strong');
  });

  it('validates 10 to 14 digit mobile numbers cleanly', () => {
    assert.equal(isValidMobileNumber('+91 98470 00000'), true);
    assert.equal(isValidMobileNumber('9847000000'), true);
    assert.equal(isValidMobileNumber('123456789'), false);
    assert.equal(isValidMobileNumber('123456789012345'), false);
    assert.equal(isValidMobileNumber('abc9847000000'), false);
  });

  it('validates combined phone or email inputs and partner dashboard access guard', () => {
    assert.equal(isValidPhoneOrEmail('partner@wayngongo.com'), true);
    assert.equal(isValidPhoneOrEmail('+91 98470 11223'), true);
    assert.equal(isValidPhoneOrEmail('invalid-email@'), false);
    assert.equal(isValidPhoneOrEmail(''), false);

    assert.equal(PARTNER_CATEGORY_OPTIONS.length, 5);
    assert.equal(canAccessPartnerDashboard(null), false);
    assert.equal(
      canAccessPartnerDashboard({
        name: 'Anoop',
        businessName: '',
        email: 'anoop@wayanad.in',
        phone: '',
        defaultCategory: 'events',
      }),
      false
    );
    assert.equal(
      canAccessPartnerDashboard({
        name: 'Anoop',
        businessName: 'Poopoli Fest Organizers',
        email: '',
        phone: '9847011223',
        defaultCategory: 'events',
      }),
      true
    );
  });
});
