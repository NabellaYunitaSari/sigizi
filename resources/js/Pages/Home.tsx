import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Sprout } from 'lucide-react';
import Navbar from '../Components/Navbar';
import type { UserSession } from '../Components/Navbar';

export default function Home() {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;
  const destination = user ? (user.role === 'kader' ? '/dashboard' : '/dashboard-desa') : '/login';

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f0]">
      <Navbar user={user} />
      <main className="flex flex-1 items-center">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-12">
          <div>
            <h1 className="editorial-title max-w-xl text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.08] text-brand-900">
              Langkah kecil,<br />tumbuh kembang<br /><span className="italic text-brand-600">yang berarti.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-[1.8] text-slate-600">
              Teman kerja kader Posyandu Desa Sukomalo. Catat pelayanan, ikuti pertumbuhan balita, dan dampingi kesehatan ibu.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={destination} className="primary-action">{user ? 'Buka dashboard' : 'Masuk akun'}<ArrowRight className="h-4 w-4" /></Link>
            </div>

          </div>
          <div className="relative rounded-[2rem] bg-[#e6ecda] px-6 pb-7 pt-8 sm:px-9 sm:pt-10">
            <div className="mb-5 flex items-center justify-between"><span className="eyebrow">Tumbuh bersama SIGIZI</span><Sprout className="h-5 w-5 text-brand-600" strokeWidth={1.5} /></div>
            <svg viewBox="0 0 440 285" role="img" aria-label="Ilustrasi ibu, anak, dan kader yang saling mendampingi" className="mx-auto w-full max-w-[440px]">
              <path d="M43 249C13 197 36 103 105 65C162 33 210 54 260 36C335 9 410 70 411 147C414 227 370 259 286 261Z" fill="#d4dfc3" />
              <path d="M30 259H415" stroke="#9caf8c" strokeWidth="2" strokeLinecap="round" />
              <path d="M72 258V195M73 221C42 217 47 191 47 191C68 189 76 206 73 221ZM74 207C102 203 100 180 100 180C79 181 70 193 74 207Z" fill="#769465" stroke="#769465" strokeWidth="2" />
              <path d="M110 251L119 168Q136 136 170 158L183 251Z" fill="#bf805d" />
              <path d="M126 163Q95 147 114 105Q117 72 146 74Q181 76 180 115L190 157Q165 171 151 148Z" fill="#496a43" />
              <ellipse cx="148" cy="116" rx="22" ry="28" fill="#e8b993" />
              <path d="M125 109Q127 76 151 84Q172 88 173 107Q154 108 142 95Z" fill="#395636" />
              <path d="M130 172Q130 193 173 212" fill="none" stroke="#e8b993" strokeWidth="16" strokeLinecap="round" />
              <path d="M288 254L278 166Q300 138 333 162L353 254Z" fill="#f9f7e9" />
              <path d="M279 163Q258 133 274 101Q276 76 301 75Q333 75 337 104L347 161L313 173Z" fill="#d8ad6b" />
              <ellipse cx="304" cy="116" rx="22" ry="28" fill="#ddb18b" />
              <path d="M279 110Q285 80 305 83Q324 87 329 106Q301 109 294 97Z" fill="#c09151" />
              <path d="M286 177L260 210" stroke="#ddb18b" strokeWidth="15" strokeLinecap="round" />
              <rect x="276" y="178" width="27" height="36" rx="4" fill="#496a43" transform="rotate(12 276 178)" />
              <path d="M225 216L218 254M247 216L254 254" stroke="#bf805d" strokeWidth="14" strokeLinecap="round" />
              <path d="M210 183Q234 169 256 184L261 222H205Z" fill="#e4bd76" />
              <circle cx="232" cy="158" r="23" fill="#e8b993" />
              <path d="M210 154Q205 129 228 132Q252 127 255 151Q242 145 234 142Q225 153 210 154Z" fill="#3d4b32" />
              <path d="M214 188L182 207M253 188L272 201" stroke="#e8b993" strokeWidth="12" strokeLinecap="round" />
              <path d="M224 162Q231 169 238 162M141 121Q147 127 154 121M298 121Q305 127 311 121" fill="none" stroke="#9c6b50" strokeWidth="2" strokeLinecap="round" />
              <path d="M355 93C348 80 332 90 341 101L355 113L369 101C378 90 362 80 355 93Z" fill="#b87959" />
              <path d="M365 254V200M365 222Q389 216 390 198Q370 199 365 222M365 236Q342 230 343 215Q360 216 365 236" fill="#769465" stroke="#769465" strokeWidth="2" />
            </svg>
          </div>
        </section>
      </main>

    </div>
  );
}
