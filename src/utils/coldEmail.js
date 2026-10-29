// Cold Email generator tailored for Kerala IT jobs

export const EMAIL_TEMPLATES = [
  {
    id: 'pro',
    name: '💼 Crisp & Professional',
    desc: 'Direct, polite, and executive-ready.',
    subject: (job, name) => `Application for ${job.cleanTitle} — ${name || 'Job Application'}`,
    body: (job, name) => `Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.cleanTitle} opening at ${job.company}${job.tech_park ? ` (${job.tech_park})` : ''}.

With a background in modern software development and hands-on familiarity with key technologies such as ${job.skills.slice(0, 3).join(', ') || 'software engineering'}, I am excited about the prospect of contributing to your team's mission.

I have attached my updated CV for your kind consideration. I would welcome the opportunity to discuss how my skillset aligns with your current technical goals.

Thank you for your time and consideration.

Warm regards,
${name || '[Your Full Name]'}
${job.email ? `Sent to: ${job.email}` : ''}`
  },
  {
    id: 'fresher',
    name: '🌱 Trainee / Fresher Supercharge',
    desc: 'High energy, quick-learner emphasis for entry-level and trainee roles.',
    subject: (job, name) => `Eager to Learn: Application for ${job.cleanTitle} — ${name || 'Graduate Applicant'}`,
    body: (job, name) => `Dear HR Team,

I came across the ${job.cleanTitle} opportunity at ${job.company} and felt compelled to reach out immediately!

As an energetic graduate passionate about building scalable solutions, I have actively worked on projects using ${job.skills.slice(0, 3).join(', ') || 'core computer science fundamentals'}. I am a disciplined problem solver, quick on the uptake, and eager to bring maximum value to ${job.company}.

I have attached my resume and portfolio links. Looking forward to hearing from you regarding potential next steps!

Best regards,
${name || '[Your Full Name]'}`
  },
  {
    id: 'mallu',
    name: '🌴 Warm Kerala Techie Vibe',
    desc: 'Authentic local enthusiasm — rooted in God’s Own IT Parks.',
    subject: (job, name) => `Namaskaram! Application for ${job.cleanTitle} at ${job.company}`,
    body: (job, name) => `Hello ${job.company} Team,

Namaskaram! I noticed your opening for ${job.cleanTitle} at ${job.tech_park || 'Kerala IT'} and wanted to submit my profile.

I've been admiring the work ${job.company} is doing here in the Kerala tech ecosystem. With my experience in ${job.skills.slice(0, 3).join(', ') || 'software development'}, I am keen to join your team and build awesome things right here at home.

Please find my resume attached. Looking forward to catching up over a conversation (and maybe a cup of Infopark/Technopark chai)!

Nanni & Regards,
${name || '[Your Name]'}`
  }
];

export function generateMailtoUrl(email, subject, body) {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
