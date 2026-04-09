"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Eğer dışarıdan items gönderilmişse onları kullan, yoksa URL'den otomatik üret
  const breadcrumbItems = items || (pathname === '/' ? [] : pathname.split('/').filter(Boolean).map((path, index, paths) => {
    const href = `/${paths.slice(0, index + 1).join('/')}`;
    const name = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
    return { name, href };
  }));

  return (
    <nav className="flex items-center space-x-2 text-sm text-[#6c757d] mb-6">
      <Link 
        href="/" 
        className="flex items-center hover:text-[#eb5e28] transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <React.Fragment key={item.href}>
            <ChevronRight className="w-4 h-4 text-[#adb5bd]" />
            {isLast ? (
              <span className="font-medium text-[#343a40] dark:text-[#f8f9fa]">
                {item.name}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-[#eb5e28] transition-colors"
              >
                {item.name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
