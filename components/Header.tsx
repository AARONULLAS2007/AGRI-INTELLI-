
import React, { useState } from 'react';
import type { Language } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../constants';
import { LeafIcon } from './Icons';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const t = TRANSLATIONS[language];

  return (
    <header className="bg-card-light dark:bg-card-dark p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <LeafIcon />
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">{t.appTitle}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => alert('Exporting CSV...')} className="hidden sm:inline-block bg-gray-200 dark:bg-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">
          {t.exportCSV}
        </button>
        <button onClick={() => alert('Exporting PDF...')} className="hidden sm:inline-block bg-gray-200 dark:bg-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">
          {t.exportPDF}
        </button>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            {LANGUAGES.find(l => l.key === language)?.name}
            <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-card-light dark:bg-card-dark rounded-lg shadow-xl py-1 z-20">
              {LANGUAGES.map(lang => (
                <a
                  key={lang.key}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setLanguage(lang.key);
                    setDropdownOpen(false);
                  }}
                  className="block px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark"
                >
                  {lang.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
