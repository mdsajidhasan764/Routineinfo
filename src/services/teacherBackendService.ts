import https from 'https';
import fs from 'fs';
import path from 'path';

export interface OfficerRecord {
  id: string;
  sl: number;
  name: string;
  nameEn: string;
  nameBn: string;
  designation: string;
  designationEn: string;
  designationBn: string;
  department: string;
  departmentEn: string;
  departmentBn: string;
  deptCategory: string;
  phone: string;
  email: string;
  photoUrl: string;
  sourceUrl: string;
}

const NAME_DICTIONARY: Record<string, string> = {
  'শেখ মুস্তাফিজুর রহমান': 'Sheikh Mustafizur Rahman',
  'মোঃ রবিউল আলম': 'Md. Rabiul Alam',
  'প্রকৌশলী মোঃ আব্দুল আলীম': 'Engr. Md. Abdul Alim',
  'প্রকৌশলী মোঃ ওয়ালিয়ার রহমান': 'Engr. Md. Waliar Rahman',
  'রোখসানা খাতুন': 'Roksana Khatun',
  'মোঃ মাহবুবুর রহমান': 'Md. Mahbubur Rahman',
  'প্রকৌশলী শেখ আহ্সান কবীর': 'Engr. Sheikh Ahsan Kabir',
  'মোঃ ফারুক হোসেন': 'Md. Faruk Hossain',
  'মোঃ জাহিদুল ইসলাম': 'Md. Jahidul Islam',
  'গৌতম কুমার চক্রবর্তী': 'Goutam Kumar Chakraborty',
  'জেবুন নাহার খাঁন': 'Zebun Nahar Khan',
  'আব্দুল্লাহ-আল-মামুন': 'Abdullah-Al-Mamun',
  'কাজী দেলওয়ার হোসেন': 'Kazi Delwar Hossain',
  'কানিজ ফাতিমা': 'Kaniz Fatima',
  'ড. সুধাংশু কুমার ঘোষ': 'Dr. Sudhangshu Kumar Ghosh',
  'সাধন কুমার বিশ্বাস': 'Sadhan Kumar Biswas',
  'মোঃ মুশফেকুল বারী': 'Md. Mushfiqul Bari',
  'মোঃ হাদী-উজ-জামান': 'Md. Hadi-Uz-Zaman',
  'মোঃ শরীফ হোসেন': 'Md. Sharif Hossain',
  'মাহমুদা খাতুন': 'Mahmuda Khatun',
  'রোকসানা জাহান': 'Roksana Jahan',
  'কাজী মাহদী মাহমুদ': 'Kazi Mahdi Mahmud',
  'শাহিদা খানম': 'Shahida Khanam',
  'মোঃ আব্দুর রউফ': 'Md. Abdur Rouf',
  'আব্দুল্লাহ-আল-ফারুক': 'Abdullah-Al-Faruk',
  'প্রকৌশলী আবু হোরায়রা খান': 'Engr. Abu Huraira Khan',
  'মোঃ আশেক রহমান অনীক': 'Md. Ashek Rahman Anik',
  'সুবীর কুমার দাস': 'Subir Kumar Das',
  'মোঃ আল- ইমরান সরকার রেজওয়ান': 'Md. Al-Imran Sarkar Rezwan',
  'সাইফুল ইসলাম': 'Saiful Islam',
  'মোঃ ফাইয়াজ আহমেদ': 'Md. Faiyaj Ahmed',
  'কাজী মামনুন নাহার': 'Kazi Mamnun Nahar',
  'বিপ্লব মধু': 'Biplob Madhu',
  'মোঃ রাশিদুল ইসলাম': 'Md. Rashidul Islam',
  'মোঃ আব্দুল্লাহ বিন আজিজ': 'Md. Abdullah Bin Aziz',
  'শেখ আবু হাসান': 'Sheikh Abu Hasan',
  'মাহবুব এ-সোবহান': 'Mahbub E-Sobhan',
  'মো: রাসেল হাওলাদার': 'Md. Rasel Hawlader',
  'ইসমত আরা ইয়াসমিন': 'Ismat Ara Yasmin',
  'মোঃ হাবিবুর রহমান': 'Md. Habibur Rahman',
  'মোঃ পারভেজ আক্তার': 'Md. Parvez Akter',
  'মোঃনুরুজ্জামান': 'Md. Nuruzzaman',
  'মোঃ সাইফুল ইসলাম': 'Md. Saiful Islam',
  'শরীফ হোসেন': 'Sharif Hossain',
  'মোঃ আফিক হাসান': 'Md. Afiq Hasan',
  'মোঃ আবুল কালাম আজাদ': 'Md. Abul Kalam Azad',
  'অপু কুমার বিশ্বাস': 'Apu Kumar Biswas',
  'ইমরান হোসেন': 'Imran Hossain',
  'মোঃ সাগর হোসেন': 'Md. Sagar Hossain',
  'মোঃ মাহাফুজুর রহমান': 'Md. Mahafuzur Rahman',
  'সাগর বিশ্বাস': 'Sagar Biswas',
  'মোঃ মাজহারুল ইসলাম': 'Md. Mazharul Islam',
  'কামরুজ্জামান সরকার': 'Kamruzzaman Sarkar',
  'মোঃ শফিকুল ইসলাম': 'Md. Shafiqul Islam',
  'মমিনুর রহমান': 'Mominur Rahman',
  'সুফল বর্মন': 'Sufal Barman',
  'মোঃমাফিজুল হক': 'Md. Mafizul Haque',
  'মোঃ মঈন তালুকদার': 'Md. Moin Talukder',
  'চন্দন বসু': 'Chandan Basu',
  'সবুজ হোসেন': 'Sabuj Hossain',
  'মোঃ মারুফ হাসান': 'Md. Maruf Hasan',
  'মোঃ বিল্লাল হোসেন': 'Md. Billal Hossain',
  'মোঃ সাদিকুর রহমান': 'Md. Sadikur Rahman',
  'আব্দুল্লাহ আল-মামুন': 'Abdullah Al-Mamun',
  'মোঃ পাভেল আলী': 'Md. Pavel Ali',
  'মোঃসিদ্দিকুর রহমান': 'Md. Siddiqur Rahman',
  'আবুল বাসার': 'Abul Bashar',
  'সোহাগ বিন রাসেল': 'Sohag Bin Rasel',
  'মোঃ ইনামুল হোসাইন': 'Md. Enamul Hossain',
  'রুম্পা দত্ত': 'Rumpa Dutta',
  'তামান্না হালিম শান্তা': 'Tamanna Halim Shanta',
  'আল-আমিন': 'Al-Amin',
  'ইয়াকুব আলী': 'Yakub Ali',
  'শ্যামানন্দ পাল': 'Shyamananda Paul',
  'সজীব কুমার': 'Sojib Kumar',
  'মোঃ আক্তার হোসেন': 'Md. Akter Hossain',
  'বি এম রাহিদ হাসান': 'B. M. Rahid Hasan',
  'মোঃ তরিকুল ইসলাম': 'Md. Tarikul Islam',
  'মোঃ সোহাগ': 'Md. Sohag',
  'মো: মাসুদুজ্জামান': 'Md. Masuduzzaman',
  'অমিত কুমার বিশ্বাস': 'Amit Kumar Biswas',
  'মোঃমাসুদ রানা': 'Md. Masud Rana',
  'মোঃ আবু কালাম': 'Md. Abu Kalam',
  'তাবাচ্ছুম আজিজ': 'Tabassum Aziz',
  'বিথী বিশ্বাস': 'Bithi Biswas',
  'মোঃ মেহেদী হাসান': 'Md. Mehedi Hasan',
  'মোঃ কামাল সওদাগর': 'Md. Kamal Saodagar',
  'আব্দুল আজিজ': 'Abdul Aziz',
  'প্রকৌশলী কাজী তৌহিদুল ইসলাম': 'Engr. Kazi Towhidul Islam',
  'প্রকৌশলী মোঃ মহিউদ্দিন': 'Engr. Md. Mohiuddin',
  'প্রকৌশলী সঞ্জয় ঘোষ': 'Engr. Sanjoy Ghosh',
  'প্রকৌশলী এস, এম, সাইদুজ্জামান': 'Engr. S. M. Saiduzzaman',
  'প্রকৌশলী মোঃ নাজমুল হুদা': 'Engr. Md. Nazmul Huda',
  'প্রকৌশলী রাজীব কুমার ঘোষ': 'Engr. Rajib Kumar Ghosh',
  'প্রকৌশলী রাজীব চন্দ্র দাশ': 'Engr. Rajib Chandra Das',
  'প্রকৌশলী এস, এম, ইমরান হোসেন': 'Engr. S. M. Imran Hossain',
  'প্রকৌশলী আল ফারুক হোসাইন': 'Engr. Al Faruk Hossain',
  'প্রকৌশলী এস. এম. মিজানুর রহমান': 'Engr. S. M. Mizanur Rahman',
  'প্রকৌশলী দেব প্রসাদ বাছাড়': 'Engr. Deb Prasad Bachhar',
  'প্রকৌশলী মোঃ আলমগীর কবীর': 'Engr. Md. Alamgir Kabir',
  'প্রকৌশলী দেবাশীষ ব্যানার্জী': 'Engr. Debasish Banerjee',
  'প্রকৌশলী মোঃ মেহেদী জামান খাঁন': 'Engr. Md. Mehedi Zaman Khan',
  'প্রকৌশলী মোঃ হাফিজুর রহমান': 'Engr. Md. Hafizur Rahman',
  'প্রকৌশলী মোঃ কামরুল ইসলাম': 'Engr. Md. Kamrul Islam',
  'প্রকৌশলী মোঃ আব্দুল বারী': 'Engr. Md. Abdul Bari',
};

function toEnglishDigits(str: string): string {
  if (!str) return '';
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  return str.replace(/[০-৯]/g, (d) => bnToEn[d] || d).trim();
}

function translateDesignation(bn: string): string {
  return bn
    .replace(/উপাধ্যক্ষ ও অধ্যক্ষ \( অতিরিক্ত দায়িত্ব\)/g, 'Vice Principal & Principal (Addl. Duty)')
    .replace(/উপাধ্যক্ষ ও অধ্যক্ষ/g, 'Vice Principal & Principal')
    .replace(/অধ্যক্ষ/g, 'Principal')
    .replace(/উপাধ্যক্ষ/g, 'Vice Principal')
    .replace(/রেজিস্ট্রার/g, 'Registrar')
    .replace(/চিফ ইনস্ট্রাক্টর ও বিভাগীয় প্রধান \(১ম শিফট\)/g, 'Chief Instructor & HOD (1st Shift)')
    .replace(/চিফ ইনস্ট্রাক্টর ও বিভাগীয় প্রধান \(২য় শিফট\)/g, 'Chief Instructor & HOD (2nd Shift)')
    .replace(/চিফ ইনস্ট্রাক্টর ও বিভাগীয় প্রধান \( ১ম শিফট\)/g, 'Chief Instructor & HOD (1st Shift)')
    .replace(/চিফ ইন্সট্রাক্টর ও বিভাগীয় প্রধান \(২য় শিফট\)/g, 'Chief Instructor & HOD (2nd Shift)')
    .replace(/চিফ ইনস্ট্রাক্টর ও বিভাগীয় প্রধান/g, 'Chief Instructor & HOD')
    .replace(/চিফ ইনস্ট্রাক্টর/g, 'Chief Instructor')
    .replace(/চিফ ইন্সট্রাক্টর/g, 'Chief Instructor')
    .replace(/ইনস্ট্রাক্টর/g, 'Instructor')
    .replace(/ইন্সট্রাক্টর/g, 'Instructor')
    .replace(/ইন্সটেক্টর/g, 'Instructor')
    .replace(/জুনিয়র ইনস্ট্রাক্টর/g, 'Junior Instructor')
    .replace(/জুনিয়র ইনস্ট্রাক্টর/g, 'Junior Instructor')
    .replace(/জুনিয়র ইন্সট্রাক্টর/g, 'Junior Instructor')
    .replace(/জুনিয়র ইন্সট্রাক্টর/g, 'Junior Instructor')
    .replace(/জুনিয়র প্রশিক্ষক/g, 'Junior Instructor')
    .replace(/ফিজিক্যাল এডুকেশন ইন্সট্রাক্টর/g, 'Physical Education Instructor')
    .replace(/কম্পিউটার সায়েন্স এন্ড টেকনোলজি/g, 'Computer Science & Technology')
    .replace(/কম্পিউটার সায়েন্স অ্যান্ড টেকনোলজি/g, 'Computer Science & Technology')
    .replace(/কম্পিউটার/g, 'Computer')
    .replace(/ইলেকট্রিক্যাল/g, 'Electrical')
    .replace(/ইলেক্ট্রিক্যাল/g, 'Electrical')
    .replace(/মেকানিক্যাল টেকনোলজি/g, 'Mechanical Technology')
    .replace(/মেকানিক্যাল/g, 'Mechanical')
    .replace(/মেক্যানিক্যাল/g, 'Mechanical')
    .replace(/সিভিল/g, 'Civil')
    .replace(/ইলেকট্রনিক্স টেকনোলজি/g, 'Electronics Technology')
    .replace(/ইলেকট্রনিক্স/g, 'Electronics')
    .replace(/ইলেকট্রনিকস/g, 'Electronics')
    .replace(/ইলেক্ট্রনিক্স/g, 'Electronics')
    .replace(/টেলিকমিউনিকেশন/g, 'Telecommunication')
    .replace(/পাওয়ার/g, 'Power')
    .replace(/পাওয়ার/g, 'Power')
    .replace(/রসায়ন/g, 'Chemistry')
    .replace(/রসায়ন/g, 'Chemistry')
    .replace(/পদার্থবিজ্ঞান/g, 'Physics')
    .replace(/পদার্থ/g, 'Physics')
    .replace(/গণিত/g, 'Mathematics')
    .replace(/ইংরেজি/g, 'English')
    .replace(/বাংলা/g, 'Bangla')
    .replace(/ম্যানেজমেন্ট/g, 'Management')
    .replace(/হিসাববিজ্ঞান/g, 'Accounting')
    .replace(/টেক/g, 'Tech')
    .replace(/নন-টেক/g, 'Non-Tech')
    .replace(/নন্- টেক/g, 'Non-Tech')
    .replace(/নন টেক/g, 'Non-Tech')
    .replace(/বিসিএস \(কারিগরি শিক্ষা\)/g, 'BCS (Tech Ed)')
    .replace(/একাডেমিক ইন-চার্জ/g, 'Academic In-Charge')
    .replace(/বিসিএস ব্যাচ-৪৪ তম/g, 'BCS 44th Batch')
    .replace(/ব্যাচঃ ৪৪তম/g, '44th Batch')
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanText(txt: string | undefined): string {
  if (!txt) return '';
  return txt
    .replace(/&lt;br\s*\/?&gt;/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<wbr>/gi, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseOfficersHtml(html: string): OfficerRecord[] {
  const cardMatches = html.split(/<div class="widget employee-content-widget">/);
  const officers: OfficerRecord[] = [];

  for (let i = 1; i < cardMatches.length; i++) {
    const card = cardMatches[i];
    const vcardMatch = card.match(/window\.downloadVCard\(`([^`]*)`,\s*`([^`]*)`,\s*`([^`]*)`,\s*`([^`]*)`,\s*`([^`]*)`\)/);
    const imgMatch = card.match(/<img[^>]+src="([^">]+)"[^>]*class="list-card-image"/i) || card.match(/<img[^>]*class="list-card-image"[^>]+src="([^">]+)"/i);

    let nameBn = vcardMatch ? cleanText(vcardMatch[1]) : '';
    if (!nameBn) {
      const nm = card.match(/<td>নাম<\/td>\s*<td>\s*([^<]+)\s*<\/td>/);
      if (nm) nameBn = cleanText(nm[1]);
    }

    let designationBn = vcardMatch ? cleanText(vcardMatch[3]) : '';
    if (!designationBn) {
      const ds = card.match(/<td>পদবি<\/td>\s*<td>\s*(?:<rt-renderer[^>]*>)?([^<]+)/);
      if (ds) designationBn = cleanText(ds[1]);
    }

    let phoneRaw = vcardMatch ? cleanText(vcardMatch[4]) : '';
    if (!phoneRaw) {
      const ph = card.match(/<td>মোবাইল<\/td>\s*<td>\s*([^<]+)\s*<\/td>/);
      if (ph) phoneRaw = cleanText(ph[1]);
    }
    const phone = toEnglishDigits(phoneRaw);

    let email = vcardMatch ? cleanText(vcardMatch[5]) : '';
    if (!email) {
      const em = card.match(/<td>ইমেইল<\/td>\s*<td>\s*([^<]+(?:<wbr>[^<]+)*)\s*<\/td>/);
      if (em) email = cleanText(em[1]);
    }

    const photoUrl = imgMatch ? imgMatch[1].trim() : '';

    const des = (designationBn + ' ' + nameBn).toLowerCase();
    let deptBn = 'সাধারণ / প্রশাসন';
    let deptEn = 'General / Administration';
    let deptCategory = 'other';

    if (des.includes('কম্পিউটার') || des.includes('computer')) {
      deptBn = 'Computer Technology (কম্পিউটার)';
      deptEn = 'Computer Technology';
      deptCategory = 'computer';
    } else if (des.includes('ইলেকট্রিক্যাল') || des.includes('electrical')) {
      deptBn = 'Electrical Technology (ইলেকট্রিক্যাল)';
      deptEn = 'Electrical Technology';
      deptCategory = 'electrical';
    } else if (des.includes('মেকানিক্যাল') || des.includes('mechanical')) {
      deptBn = 'Mechanical Technology (মেকানিক্যাল)';
      deptEn = 'Mechanical Technology';
      deptCategory = 'mechanical';
    } else if (des.includes('সিভিল') || des.includes('civil')) {
      deptBn = 'Civil Technology (সিভিল)';
      deptEn = 'Civil Technology';
      deptCategory = 'civil';
    } else if (des.includes('ইলেকট্রনিক্স') || des.includes('electronics')) {
      deptBn = 'Electronics Technology (ইলেকট্রনিক্স)';
      deptEn = 'Electronics Technology';
      deptCategory = 'electronics';
    } else if (des.includes('পাওয়ার') || des.includes('পাওয়ার') || des.includes('power')) {
      deptBn = 'Power Technology (পাওয়ার)';
      deptEn = 'Power Technology';
      deptCategory = 'power';
    } else if (des.includes('আরএসি') || des.includes('রেফ্রিজারেশন') || des.includes('rac')) {
      deptBn = 'RAC Technology (আরএসি)';
      deptEn = 'RAC Technology';
      deptCategory = 'rac';
    } else if (des.includes('টেলিকমিউনিকেশন') || des.includes('telecommunication')) {
      deptBn = 'Telecommunication Technology (টেলিকমিউনিকেশন)';
      deptEn = 'Telecommunication Technology';
      deptCategory = 'telecom';
    } else if (des.includes('গণিত') || des.includes('math')) {
      deptBn = 'Non-Tech Mathematics (গণিত)';
      deptEn = 'Non-Tech Mathematics';
      deptCategory = 'nontech';
    } else if (des.includes('পদার্থ') || des.includes('physics')) {
      deptBn = 'Non-Tech Physics (পদার্থবিজ্ঞান)';
      deptEn = 'Non-Tech Physics';
      deptCategory = 'nontech';
    } else if (des.includes('রসায়ন') || des.includes('রসায়ন') || des.includes('chemistry')) {
      deptBn = 'Non-Tech Chemistry (রসায়ন)';
      deptEn = 'Non-Tech Chemistry';
      deptCategory = 'nontech';
    } else if (des.includes('ইংরেজি') || des.includes('english')) {
      deptBn = 'Non-Tech English (ইংরেজি)';
      deptEn = 'Non-Tech English';
      deptCategory = 'nontech';
    } else if (des.includes('বাংলা') || des.includes('bangla')) {
      deptBn = 'Non-Tech Bangla (বাংলা)';
      deptEn = 'Non-Tech Bangla';
      deptCategory = 'nontech';
    } else if (des.includes('হিসাব') || des.includes('ম্যানেজমেন্ট') || des.includes('management')) {
      deptBn = 'Non-Tech Management / Accounting';
      deptEn = 'Non-Tech Management / Accounting';
      deptCategory = 'nontech';
    } else if (des.includes('অধ্যক্ষ') || des.includes('উপাধ্যক্ষ') || des.includes('রেজিস্ট্রার')) {
      deptBn = 'Administration & Principal Office (প্রশাসন)';
      deptEn = 'Administration & Principal Office';
      deptCategory = 'admin';
    }

    const nameEn = NAME_DICTIONARY[nameBn] || nameBn;
    const designationEn = translateDesignation(designationBn);

    officers.push({
      id: `jpi_${i}`,
      sl: i,
      name: nameEn,
      nameEn,
      nameBn,
      designation: designationEn,
      designationEn,
      designationBn,
      department: deptEn,
      departmentEn: deptEn,
      departmentBn: deptBn,
      deptCategory,
      phone,
      email,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      sourceUrl: 'https://jashore.polytech.gov.bd/pages/officers',
    });
  }

  return officers;
}

export async function fetchLiveOfficersFromHost(): Promise<OfficerRecord[]> {
  return new Promise((resolve, reject) => {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const req = https.get(
      'https://jashore.polytech.gov.bd/pages/officers',
      {
        agent,
        timeout: 12000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RoutineInfoApp/2.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Server responded with HTTP status ${res.statusCode}`));
          return;
        }

        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = parseOfficersHtml(body);
            if (parsed.length > 0) {
              resolve(parsed);
            } else {
              reject(new Error('No officer records found in parsed HTML'));
            }
          } catch (e: any) {
            reject(e);
          }
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timed out'));
    });
  });
}
