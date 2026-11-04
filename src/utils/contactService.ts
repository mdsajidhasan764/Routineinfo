/**
 * Native Phone Contact Helper
 * Provides 1-tap Phone Number Copy and Direct Phone Contact Saving (No .vcf download file)
 * Uses Android Intent & Native Contact actions to automatically open the phone's native
 * Contacts app with the teacher's name and phone number pre-filled.
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
 * Automatically save contact with Name and Phone number into phone's Contacts app.
 * On Android, executes native Android Intent to directly launch the Phone's Contacts
 * app pre-filled with the teacher's name and phone number (NO .vcf file download).
 */
export function saveContactToPhone(name: string, phone: string, subject?: string): boolean {
  if (!phone) return false;
  const cleanName = (name || 'Teacher').trim();
  const cleanPhone = phone.trim();
  const displayName = subject ? `${cleanName} (${subject})` : cleanName;

  // Haptic feedback for native phone touch
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([80, 40, 80]);
    } catch {
      // ignore
    }
  }

  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  // 1. Android Direct Intent: Launches Phone's Contact Manager directly (No file download)
  if (isAndroid) {
    try {
      const intentUrl = `intent:#Intent;action=android.intent.action.INSERT;type=vnd.android.cursor.dir/contact;S.name=${encodeURIComponent(displayName)};S.phone=${encodeURIComponent(cleanPhone)};end;`;
      window.location.href = intentUrl;
      return true;
    } catch (e) {
      console.warn('Android intent launch failed, using fallback:', e);
    }
  }

  // 2. iOS Direct Contact Card Sheet
  const vCardContent = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${displayName}`,
    `TEL;TYPE=CELL,VOICE:${cleanPhone}`,
    'TITLE:Polytechnic Teacher',
    'NOTE:Saved from BTEB Routine Manager',
    'END:VCARD',
  ].join('\r\n');

  try {
    if (isIOS) {
      window.location.href = `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardContent)}`;
      return true;
    }

    // 3. Fallback for desktop / standard browser
    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanName.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error('Failed to save contact:', err);
    return false;
  }
}
