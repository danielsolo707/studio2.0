import crypto from 'crypto';

const CAPTCHA_COOKIE = 'login_captcha';
const CAPTCHA_TTL = 5 * 60; // 5 minutes

export type CaptchaData = {
  question: string;
  answer: number;
  expires: number;
};

function generateQuestion(): { question: string; answer: number } {
  const num1 = crypto.randomInt(1, 10);
  const num2 = crypto.randomInt(1, 10);
  const operations = ['+', '-', '*'] as const;
  const op = operations[crypto.randomInt(0, operations.length)];
  
  switch (op) {
    case '+':
      return { question: `${num1} + ${num2}`, answer: num1 + num2 };
    case '-':
      return { question: `${num1} - ${num2}`, answer: num1 - num2 };
    case '*':
      return { question: `${num1} × ${num2}`, answer: num1 * num2 };
  }
}

function sign(data: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET || 'dev-secret-change-me';
  return crypto.createHmac('sha256', secret).update(data).digest('hex').slice(0, 16);
}

export async function generateCaptcha(): Promise<CaptchaData> {
  const { question, answer } = generateQuestion();
  const expires = Math.floor(Date.now() / 1000) + CAPTCHA_TTL;
  
  return { question, answer, expires };
}

export function serializeCaptcha(captcha: CaptchaData): string {
  const payload = `${captcha.question}|${captcha.answer}|${captcha.expires}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

export function validateCaptcha(serialized: string | undefined, userAnswer: number): boolean {
  if (!serialized) return false;
  
  try {
    const decoded = Buffer.from(serialized, 'base64url').toString('utf-8');
    const [payload, sig] = decoded.split('.');
    if (!payload || !sig) return false;
    
    if (sign(payload) !== sig) return false;
    
    const [question, answerStr, expiresStr] = payload.split('|');
    if (!question || !answerStr || !expiresStr) return false;
    
    const expires = parseInt(expiresStr, 10);
    if (Math.floor(Date.now() / 1000) > expires) return false;
    
    const answer = parseInt(answerStr, 10);
    return answer === userAnswer;
  } catch {
    return false;
  }
}
