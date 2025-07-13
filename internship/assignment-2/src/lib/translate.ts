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
    .map((word) => dictionary[word.toLowerCase()] || word)
    .join(" ");
}
