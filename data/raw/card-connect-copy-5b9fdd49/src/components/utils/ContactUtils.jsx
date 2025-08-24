export function generateVCard(contact) {
  const vCardData = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.full_name || ''}`,
    `N:${contact.full_name.split(' ').reverse().join(';')}`,
    contact.company ? `ORG:${contact.company}` : '',
    contact.job_title ? `TITLE:${contact.job_title}` : '',
    contact.email ? `EMAIL;type=INTERNET;type=pref:${contact.email}` : '',
    contact.phone ? `TEL;type=CELL:${contact.phone}` : '',
    contact.website ? `URL:${contact.website}` : '',
    contact.address ? `ADR;type=WORK:;;${contact.address}` : '',
    'END:VCARD'
  ].filter(Boolean).join('\n');

  return vCardData;
}

export function downloadVCard(contact) {
  const vCardData = generateVCard(contact);
  const blob = new Blob([vCardData], { type: 'text/vcard' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${contact.full_name}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function downloadMultipleVCards(contacts) {
  // Create a single vCard file with multiple contacts
  const vCardData = contacts.map(contact => generateVCard(contact)).join('\n');
  const blob = new Blob([vCardData], { type: 'text/vcard' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'contacts.vcf');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}