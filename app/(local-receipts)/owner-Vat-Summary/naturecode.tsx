
interface NatureCodeMapping {
  [key: string]: {
    label: string;
    amharicLabel: string;
    section: 'output' | 'capital' | 'nonCapital';
    lineNumber: number;
    vatType: 'output' | 'input';
  };
}

  // Nature code mappings based on the VAT form structure
  const natureCodeMappings: NatureCodeMapping = {
    '5': {
      label: 'Taxable sales/Supplies',
      amharicLabel: 'ታክስ የሚከፈልበት አገልግሎት አቅርቦት /ሽያጭ ዋጋ',
      section: 'output',
      lineNumber: 5,
      vatType: 'output'
    },
    '15': {
      label: 'Zero-rated sales/supplies',
      amharicLabel: 'ዜሮ ምጣኔ ያላቸው ሽያጭና /አቅርቦት',
      section: 'output',
      lineNumber: 15,
      vatType: 'output'
    },
    '20': {
      label: 'Tax-exempt sales/supplies',
      amharicLabel: 'ከታክስ ነፃ የሆነ ሽያጭ /አቅርቦቶች',
      section: 'output',
      lineNumber: 20,
      vatType: 'output'
    },
    '25': {
      label: 'Supplies subject to reverse taxation',
      amharicLabel: 'በገዢው ተይዞ የተሰበሰበ የአቅርቦት /ሽያጭ ዋጋ',
      section: 'output',
      lineNumber: 25,
      vatType: 'output'
    },
    '35': {
      label: 'Tax adjustment with debit note for suppliers',
      amharicLabel: 'ታክስ የተስተካከለበት ዴቢት ሰነድ ግብይት ዋጋ ለአቅራቢ',
      section: 'output',
      lineNumber: 35,
      vatType: 'output'
    },
    '45': {
      label: 'Tax adjustment with credit note for suppliers',
      amharicLabel: 'ታክስ የተስተካከለበት ከሬዲት ሰነድግብይት ዋጋ ለአቅራቢ',
      section: 'output',
      lineNumber: 45,
      vatType: 'output'
    },
    '65': {
      label: 'Local purchase capital assets',
      amharicLabel: 'የአገር ውስጥ ካፒታል እቃዎች ግዢ',
      section: 'capital',
      lineNumber: 65,
      vatType: 'input'
    },
    '75': {
      label: 'Imported capital assets purchase',
      amharicLabel: 'የውጪ አገር የካፒታል እቃዎች ጣገዢ',
      section: 'capital',
      lineNumber: 75,
      vatType: 'input'
    },
    '85': {
      label: 'Purchase with no VAT or unclaimed inputs',
      amharicLabel: 'ታክስ ያልተከፈለበት ግዢ ወይም ተመላሽ የማይጠየቅባቸው ግብአት',
      section: 'capital',
      lineNumber: 85,
      vatType: 'input'
    },
    '100': {
      label: 'Local purchase Inputs',
      amharicLabel: 'የአገር ውስጥ ማገርዎች ግብዓት',
      section: 'nonCapital',
      lineNumber: 100,
      vatType: 'input'
    },
    '110': {
      label: 'Imported inputs purchase',
      amharicLabel: 'የውጭ አገር ግብዓት ሓር',
      section: 'nonCapital',
      lineNumber: 110,
      vatType: 'input'
    },
    '120': {
      label: 'General Expense Inputs purchase',
      amharicLabel: 'ልዩ ልዩ ወጪዎች ግብዓት ግዢ',
      section: 'nonCapital',
      lineNumber: 120,
      vatType: 'input'
    },
    '130': {
      label: 'Purchase with no VAT or unclaimed inputs',
      amharicLabel: 'ታክስ ያልተከፈለበት ወይም ተመላሽ የማይጠየቅባቸው ግብዓት ግዢ',
      section: 'nonCapital',
      lineNumber: 130,
      vatType: 'input'
    },
    '135': {
      label: 'Deductible on VAT reverse taxation',
      amharicLabel: 'በገዢው ተይዞ የተቀነሰ የተ.እ.ታ',
      section: 'nonCapital',
      lineNumber: 135,
      vatType: 'input'
    },
    '145': {
      label: 'Tax adjustment with debit note for buyers',
      amharicLabel: 'ታክስ የተስተካከለበት ዴቢት ሰነድ ግብይት ዋጋ ለገዢ',
      section: 'nonCapital',
      lineNumber: 145,
      vatType: 'input'
    },
    '155': {
      label: 'Tax adjustment with credit note for buyers',
      amharicLabel: 'ታከስ የተስተካከለበት ከሬዲት ሰነድ ግብይት ዋጋ ለገዢ',
      section: 'nonCapital',
      lineNumber: 155,
      vatType: 'input'
    }
  };