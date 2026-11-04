/**
 * Native Phone Contact Helper
 * Provides 1-tap Phone Number Copy and Direct vCard (.vcf) Export
 * to automatically save teacher name and phone number into the device's Contacts app.
 */

/**
 * Copy phone number or text to device clipboard
 */
export async function copyPhoneNumber(phone: string): Promise<boolean> {
  if (!phone) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(phone);
      return true;
    }
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = phone;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy phone number:', err);
    return false;
  }
}

/**
 * Automatically save contact with Name and Phone number into phone's Contacts app
 * Generates and triggers a standard .vcf (vCard 3.0) file.
 * When opened on Android or iOS, it instantly opens the native Contacts app
 * with the teacher's name and number pre-filled for 1-tap save.
 */
export function saveContactToPhone(name: string, phone: string, subject?: string): boolean {
  if (!phone) return false;
  const cleanName = (name || 'Teacher').trim();
  const cleanPhone = phone.trim();
  const cleanSubject = subject ? ` (${subject})` : '';

  const vCardContent = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${cleanName}${cleanSubject}`,
    `TEL;TYPE=CELL,VOICE:${cleanPhone}`,
    'TITLE:Polytechnic Teacher',
    'NOTE:Saved from BTEB Routine Manager',
    'END:VCARD',
  ].join('\r\n');

  try {
    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanName.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    // Haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([80, 40, 80]);
    }
    return true;
  } catch (err) {
    console.error('Failed to export vCard contact:', err);
    return false;
  }
}
