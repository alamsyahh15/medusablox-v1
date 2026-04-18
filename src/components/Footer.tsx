import logoUrl from '../../assets/ic_logo.png';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-transparent mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start mb-6 md:mb-0">
            <a href="#" className="flex items-center gap-2">
              <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
              <span className="font-sans font-bold text-lg tracking-tight text-text-main">
                MedusaBlox
              </span>
            </a>
          </div>
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="https://discord.com/invite/Afs5b76ejR" target="_blank" rel="noreferrer" className="text-text-dim hover:text-primary transition-colors">
              <span className="sr-only">Discord</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19.7 4.1a15.8 15.8 0 00-3.9-1.2.1.1 0 00-.1.1c-.2.4-.4.8-.5 1.2a15 15 0 00-4.6 0 7.7 7.7 0 00-.5-1.2.1.1 0 00-.1-.1 15.8 15.8 0 00-3.9 1.2.1.1 0 00-.1.1 19.3 19.3 0 00-3.3 13.3.1.1 0 00.1.1 15.7 15.7 0 004.8 2.5.1.1 0 00.1 0c.3-.4.6-.9.9-1.4a.1.1 0 000-.1 10.3 10.3 0 01-1.7-.8.1.1 0 010-.2c.1-.1.2-.2.3-.3a.1.1 0 00.1-.1 11.2 11.2 0 0010.5 0 .1.1 0 00.1.1c.1.1.2.2.3.3a.1.1 0 010 .2 10.3 10.3 0 01-1.7.8.1.1 0 000 .1c.3.5.6 1 .9 1.4a.1.1 0 00.1 0 15.7 15.7 0 004.8-2.5.1.1 0 00.1-.1 19.4 19.4 0 00-3.2-13.3.1.1 0 00-.1-.1zM8 15.3c-1 0-1.8-.9-1.8-1.9s.8-1.9 1.8-1.9 1.8.9 1.8 1.9-.8 1.9-1.8 1.9zm8 0c-1 0-1.8-.9-1.8-1.9s.8-1.9 1.8-1.9 1.8.9 1.8 1.9-.8 1.9-1.8 1.9z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1 text-center md:text-left">
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} MedusaBlox. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
