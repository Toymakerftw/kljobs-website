// Quirky Malayalam & Kerala Tech cultural quotes & wisdom

export const QUIRKY_TIPS = [
  {
    quote: "Apply cheyyedo! If you don't send the resume, how will they hire you?",
    author: "Typical Senior Chettan at Technopark Chai Stall ☕"
  },
  {
    quote: "Infopark Phase 1 to Phase 2 is an emotional journey. So is junior to senior dev.",
    author: "Kakkanad Commuter Legend 🌴"
  },
  {
    quote: "Sadya for lunch + 2 PM sprint review = Maximum survival mode.",
    author: "Onam Release Survivor 🍛"
  },
  {
    quote: "Kazhakoottam bypass breeze heals all Git merge conflicts.",
    author: "TVM Technopark Midnight Coder 🥥"
  },
  {
    quote: "Calicut Cyberpark rule: Coding speed increases 200% after Dum Biriyani.",
    author: "Kozhikode Techie Guild 🍗"
  },
  {
    quote: "Cold emails to HR work best between 9:30 AM and 11:00 AM right after their morning sulaimani.",
    author: "Hiring Pro-Tip ☕"
  },
  {
    quote: "Walk-in interview tip: Reach 30 minutes early, polish shoes, carry 3 copies of resume & 1 pen that actually works.",
    author: "Kerala Career Ammavan 📝"
  }
];

export function getRandomQuirk() {
  const idx = Math.floor(Math.random() * QUIRKY_TIPS.length);
  return QUIRKY_TIPS[idx];
}
