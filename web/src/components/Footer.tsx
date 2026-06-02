import { Icon } from '@iconify/react';

export function Footer() {
  return (
    <footer className="mt-16 border-t-4 border-black bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-300">
          <Icon icon="majesticons:skull" className="h-4 w-4 text-red" />
          <span>
            Built with <span className="text-red">💀</span> & <span className="text-yellow">teh tarik</span> by{' '}
            <a
              href="https://nusabyte.my"
              target="_blank"
              rel="noreferrer noopener"
              className="font-heading text-yellow hover:text-green underline decoration-wavy decoration-2 underline-offset-4"
            >
              nusabyte.my
            </a>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-gray-400">
          <span className="hidden sm:inline">We collect so you don't have to chase</span>
          <span className="font-heading text-red">💀 KutipCrew</span>
        </div>
      </div>
    </footer>
  );
}
