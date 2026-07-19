/** Fast, dependable answers when the live public model is unavailable. */
const CONTACT_EMAIL = 'daniel@danielsoleimani.ir'

export function getCannedAnswer(message: string): string {
  const text = message.toLowerCase()
  if (/(contact|reach|email|hire|get in touch|talk|available)/.test(text)) {
    return `The quickest route is the Let’s Talk form on this site. You can also email Daniel at ${CONTACT_EMAIL}. Include your project, timeline, and the kind of collaboration you have in mind.`
  }
  if (/(which|what).*(first|start|look|best|recommend)|start with/.test(text)) {
    return 'Start with the Arcade for hands-on interactive engineering, then explore ALPHA-MATH for AI/ML work and the Motion section for design work.'
  }
  if (/(project|build|work|do|skill|experience)/.test(text)) {
    return 'Daniel combines AI/ML experiments, motion design, and interactive front-end work. The portfolio includes reasoning agents, reinforcement learning, audio recognition, motion systems, and playable browser games.'
  }
  return 'The live assistant is taking a short break, but the portfolio is available to explore now: visit Works for projects, Arcade for playable experiments, or use the contact form to start a conversation.'
}
