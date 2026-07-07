import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gateway | Daniel Soleimani',
  description:
    'Explore the portfolio of Daniel Soleimani — choose between Motion Design and Creative Code projects.',
};

export default function GatewayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
