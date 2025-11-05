export function checkPasswordStrength(pass: string): string {
  let msg = '';
  if (!pass || pass.length < 8) msg += 'Minimum password length should be 8\n';
  if (!( /[a-z]/.test(pass) && /[A-Z]/.test(pass) && /[0-9]/.test(pass) ))
    msg += 'Password should be AlphaNumeric\n';
  if (!/[<>\@\!\#\$\%\^\&\*\(\)_\+\[\]\{\}\?:;|'\\.,\/~`\-=\"]/ .test(pass))
    msg += 'Password should contain special character\n';
  return msg;
}
