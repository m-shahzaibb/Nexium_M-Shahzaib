const dictionary: Record<string, string> = {
  blog: "بلاگ",
  post: "تحریر",
  welcome: "خوش آمدید",
  summary: "خلاصہ",
  hello: "ہیلو",
  world: "دنیا",
  this: "یہ",
  is: "ہے",
  a: "ایک",
  sample: "نمونہ",
  from: "سے",
  important: "اہم",
  information: "معلومات",
  about: "کے بارے میں",
  and: "اور",
  it: "یہ",
  contains: "پر مشتمل",
  topics: "موضوعات",
};

export function translateToUrdu(text: string): string {
  return text
    .split(" ")
    .map((word) => {
      // Remove punctuation for lookup but preserve it
      const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, "");
      const punctuation = word.match(/[.,!?;:]/g)?.join("") || "";
      
      const translation = dictionary[cleanWord] || word;
      return translation + punctuation;
    })
    .join(" ");
}
