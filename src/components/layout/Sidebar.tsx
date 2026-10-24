import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { IdentityBlock } from './IdentityBlock';
import { NavList } from './NavList';
import { ShellLinks } from './ShellLinks';

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[280px] flex-col gap-6 overflow-y-auto border-r border-line bg-surface px-5 py-6 lg:flex">
      <IdentityBlock />
      <nav aria-label="Site">
        <NavList />
      </nav>
      <div className="mt-auto flex flex-col gap-2 border-t border-line pt-4">
        <ThemeToggle className="w-full" />
        <ShellLinks />
      </div>
    </aside>
  );
}
