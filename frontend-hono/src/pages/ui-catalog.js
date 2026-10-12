import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert.js';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar.js';
import { Badge } from '../components/ui/badge.js';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '../components/ui/breadcrumb.js';
import { Button } from '../components/ui/button.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.js';
import { Input } from '../components/ui/input.js';
import { Label } from '../components/ui/label.js';
import { Separator } from '../components/ui/separator.js';
import { Skeleton } from '../components/ui/skeleton.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.js';
import { Textarea } from '../components/ui/textarea.js';

// Interactive Components
import { createAlertDialog } from '../components/ui/alert-dialog.js';
import { Checkbox } from '../components/ui/checkbox.js';
import { Collapsible } from '../components/ui/collapsible.js';
import { createDialog } from '../components/ui/dialog.js';
import { DropdownMenu } from '../components/ui/dropdown-menu.js';
import { NavigationMenu } from '../components/ui/navigation-menu.js';
import { Popover } from '../components/ui/popover.js';
import { RadioGroup } from '../components/ui/radio-group.js';
import { ScrollArea } from '../components/ui/scroll-area.js';
import { Select } from '../components/ui/select.js';
import { createSheet } from '../components/ui/sheet.js';
import { Tabs } from '../components/ui/tabs.js';
import { ToggleGroup } from '../components/ui/toggle-group.js';
import { Toggle } from '../components/ui/toggle.js';
import { Tooltip } from '../components/ui/tooltip.js';

// Layout Component
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../components/ui/sidebar.js';

export function renderUiCatalogPage() {
  const sidebarHtml = SidebarProvider({
    id: 'catalog-sidebar-provider',
    defaultOpen: true,
    children: `
      ${Sidebar({
      children: `
          ${SidebarHeader({
        children: '<h2 class="px-2 font-bold text-lg tracking-tight">UI Showcase</h2>',
      })}
          ${SidebarContent({
        children: `
              ${SidebarGroup({
          children: `
                  ${SidebarGroupLabel({ children: 'Navigasi Component' })}
                  ${SidebarMenu({
            children: `
                      ${SidebarMenuItem({
              children: SidebarMenuButton({ href: '#statis', isActive: true, children: '1. Statis UI' }),
            })}
                      ${SidebarMenuItem({
              children: SidebarMenuButton({ href: '#interaktif', children: '2. Interaktif UI' }),
            })}
                    `,
          })}
                `,
        })}
            `,
      })}
          ${SidebarFooter({
        children: '<p class="text-xs text-muted-foreground p-2">Clean JS Architecture</p>',
      })}
        `,
    })}

      ${SidebarInset({
      children: `
          <div class="flex items-center justify-between pb-6 border-b mb-8">
            <div class="flex items-center gap-3">
              ${SidebarTrigger({})}
              <div>
                <h1 class="text-3xl font-extrabold tracking-tight">Katalog UI Komponen (/__ui)</h1>
                <p class="text-muted-foreground text-sm">Prinjau seluruh komponen UI statis, interaktif, dan layout (JavaScript ES Modules).</p>
              </div>
            </div>
            ${Badge({ variant: 'default', children: 'Versi Pure JS' })}
          </div>

          <div class="space-y-12">
            <!-- ================= BAGIAN 1: KOMPONEN STATIS ================= -->
            <section id="statis" class="space-y-6">
              <h2 class="text-2xl font-bold border-b pb-2">I. Komponen UI Statis</h2>

              <!-- Button & Badge -->
              <div class="grid md:grid-cols-2 gap-6">
                <div class="border p-4 rounded-xl space-y-3">
                  <h3 class="font-bold">Button Variants & Sizes</h3>
                  <div class="flex flex-wrap gap-2">
                    ${Button({ variant: 'default', children: 'Default' })}
                    ${Button({ variant: 'secondary', children: 'Secondary' })}
                    ${Button({ variant: 'destructive', children: 'Destructive' })}
                    ${Button({ variant: 'outline', children: 'Outline' })}
                    ${Button({ variant: 'ghost', children: 'Ghost' })}
                    ${Button({ variant: 'link', children: 'Link' })}
                  </div>
                </div>

                <div class="border p-4 rounded-xl space-y-3">
                  <h3 class="font-bold">Badge Variants</h3>
                  <div class="flex flex-wrap gap-2">
                    ${Badge({ variant: 'default', children: 'Default' })}
                    ${Badge({ variant: 'secondary', children: 'Secondary' })}
                    ${Badge({ variant: 'destructive', children: 'Destructive' })}
                    ${Badge({ variant: 'outline', children: 'Outline' })}
                  </div>
                </div>
              </div>

              <!-- Card & Form Inputs -->
              <div class="border p-4 rounded-xl space-y-3">
                <h3 class="font-bold">Card, Input, Label, Textarea</h3>
                ${Card({
        children: `
                    ${CardHeader({
          children: `
                        ${CardTitle({ children: 'Form Profil' })}
                        ${CardDescription({ children: 'Contoh komposisi komponen form.' })}
                      `,
        })}
                    ${CardContent({
          children: `
                        <div class="space-y-4">
                          <div class="space-y-1.5">
                            ${Label({ htmlFor: 'email', children: 'Alamat Email' })}
                            ${Input({ id: 'email', type: 'email', placeholder: 'user@domain.com' })}
                          </div>
                          <div class="space-y-1.5">
                            ${Label({ htmlFor: 'bio', children: 'Biografi' })}
                            ${Textarea({ id: 'bio', placeholder: 'Tuliskan deskripsi singkat...' })}
                          </div>
                        </div>
                      `,
        })}
                    ${CardFooter({
          children: Button({ children: 'Simpan Changes' }),
        })}
                  `,
      })}
              </div>

              <!-- Alert & Avatar -->
              <div class="grid md:grid-cols-2 gap-6">
                <div class="border p-4 rounded-xl space-y-3">
                  <h3 class="font-bold">Alert</h3>
                  ${Alert({
        variant: 'default',
        children: `
                      ${AlertTitle({ children: 'Notifikasi' })}
                      ${AlertDescription({ children: 'Semua komponen UI kini menggunakan modul JS standar.' })}
                    `,
      })}
                </div>

                <div class="border p-4 rounded-xl space-y-3">
                  <h3 class="font-bold">Avatar & Skeleton</h3>
                  <div class="flex items-center gap-4">
                    ${Avatar({ children: AvatarImage({ src: 'https://github.com/shadcn.png' }) })}
                    ${Avatar({ children: AvatarFallback({ children: 'CN' }) })}
                    ${Skeleton({ className: 'h-10 w-10 rounded-full' })}
                    ${Skeleton({ className: 'h-4 w-[150px]' })}
                  </div>
                </div>
              </div>

              <!-- Breadcrumb, Separator & Table -->
              <div class="border p-4 rounded-xl space-y-3">
                <h3 class="font-bold">Breadcrumb & Table</h3>
                ${Breadcrumb({
        children: `
                    ${BreadcrumbItem({ children: BreadcrumbLink({ href: '#', children: 'Beranda' }) })}
                    ${BreadcrumbSeparator({})}
                    ${BreadcrumbItem({ children: 'Katalog UI' })}
                  `,
      })}
                ${Separator({ className: 'my-4' })}
                ${Table({
        children: `
                    ${TableHeader({
          children: TableRow({
            children: `
                          ${TableHead({ children: 'Tipe' })}
                          ${TableHead({ children: 'Jumlah Komponen' })}
                          ${TableHead({ children: 'Status' })}
                        `,
          }),
        })}
                    ${TableBody({
          children: `
                        ${TableRow({
            children: `
                            ${TableCell({ children: 'Statis' })}
                            ${TableCell({ children: '12 File' })}
                            ${TableCell({ children: Badge({ children: 'Selesai' }) })}
                          `,
          })}
                        ${TableRow({
            children: `
                            ${TableCell({ children: 'Interaktif' })}
                            ${TableCell({ children: '15 File + Sidebar' })}
                            ${TableCell({ children: Badge({ variant: 'secondary', children: 'Selesai' }) })}
                          `,
          })}
                      `,
        })}
                  `,
      })}
              </div>
            </section>

            <!-- ================= BAGIAN 2: KOMPONEN INTERAKTIF ================= -->
            <section id="interaktif" class="space-y-6">
              <h2 class="text-2xl font-bold border-b pb-2">II. Komponen UI Interaktif</h2>

              <!-- Dialog, Alert Dialog & Sheet -->
              <div class="border p-4 rounded-xl space-y-3">
                <h3 class="font-bold">Dialog, Alert Dialog & Sheet (Native &lt;dialog&gt;)</h3>
                <div class="flex flex-wrap gap-3">
                  <button onclick="document.getElementById('demo-dialog').showModal()" class="px-4 py-2 text-sm border rounded-md hover:bg-accent">
                    Buka Dialog
                  </button>
                  <button onclick="document.getElementById('demo-alert-dialog').showModal()" class="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md">
                    Buka Alert Dialog
                  </button>
                  <button onclick="document.getElementById('demo-sheet').showModal()" class="px-4 py-2 text-sm border rounded-md hover:bg-accent">
                    Buka Sheet (Drawer)
                  </button>
                </div>

                ${createDialog({
        id: 'demo-dialog',
        title: 'Judul Dialog Native',
        description: 'Menggunakan elemen <dialog> HTML native dengan backdrop otomatis.',
        content: '<p class="text-sm">Isi konten modal yang responsif terhadap tombol Escape.</p>',
        actions: '<button onclick="document.getElementById(\'demo-dialog\').close()" class="px-4 py-2 text-sm border rounded-md">Tutup</button>',
      })}

                ${createAlertDialog({
        id: 'demo-alert-dialog',
        title: 'Konfirmasi Penghapusan',
        description: 'Apakah Anda yakin ingin melanjutkan tindakan destruktif ini?',
      })}

                ${createSheet({
        id: 'demo-sheet',
        side: 'right',
        title: 'Panel Samping (Sheet)',
        content: '<p class="text-sm">Konten Sheet yang meluncur dari bagian samping layar.</p>',
      })}
              </div>

              <!-- Popover, Tooltip, Dropdown Menu & Select -->
              <div class="grid md:grid-cols-2 gap-6">
                <div class="border p-4 rounded-xl space-y-3">
                  <h3 class="font-bold">Popover & Tooltip</h3>
                  <div class="flex items-center gap-4">
                    ${Popover({
        triggerId: 'pop-trig',
        popoverId: 'pop-content',
        triggerLabel: 'Toggle Popover',
        content: '<p class="text-sm">Ini adalah Popover native HTML API.</p>',
      })}
                    ${Tooltip({
        text: 'Tooltip informasi!',
        children: '<button class="px-3 py-1.5 border rounded-md text-sm">Hover Saya</button>',
      })}
                  </div>
                </div>

                <div class="border p-4 rounded-xl space-y-3">
                  <h3 class="font-bold">Dropdown Menu & Native Select</h3>
                  <div class="flex items-center gap-4">
                    ${DropdownMenu({
        triggerId: 'dd-trig',
        menuId: 'dd-menu',
        label: 'Opsi Opsi',
        items: [{ label: 'Profil' }, { label: 'Pengaturan' }, { label: 'Keluar' }],
      })}
                    <div class="w-48">
                      ${Select({
        id: 'demo-select',
        options: [
          { value: '1', label: 'Pilihan Pertama' },
          { value: '2', label: 'Pilihan Kedua' },
        ],
      })}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tabs, Toggle, Toggle Group, Radio Group, Checkbox -->
              <div class="grid md:grid-cols-2 gap-6">
                <div class="border p-4 rounded-xl space-y-3">
                  <h3 class="font-bold">Tabs & Collapsible</h3>
                  ${Tabs({
        containerId: 'demo-tabs',
        tabs: [
          { id: 't1', label: 'Tab 1', content: 'Konten untuk Tab 1.' },
          { id: 't2', label: 'Tab 2', content: 'Konten untuk Tab 2.' },
        ],
      })}
                  ${Collapsible({
        title: 'Klik untuk toggle konten (Accordion)',
        content: 'Detail tersembunyi menggunakan tag native <details>.',
      })}
                </div>

                <div class="border p-4 rounded-xl space-y-3">
                  <h3 class="font-bold">Toggle, Checkbox, Radio Group</h3>
                  <div class="space-y-3">
                    <div class="flex items-center gap-3">
                      ${Toggle({ id: 'tg-1', label: 'Bold' })}
                      ${ToggleGroup({
        items: [
          { id: 'tg-2', label: 'Kiri' },
          { id: 'tg-3', label: 'Tengah' },
        ],
      })}
                    </div>
                    ${Checkbox({ id: 'chk-1', label: 'Setujui Syarat dan Ketentuan', checked: true })}
                    ${RadioGroup({
        name: 'pilihan-radio',
        options: [
          { value: 'opt1', label: 'Opsi A', checked: true },
          { value: 'opt2', label: 'Opsi B' },
        ],
      })}
                  </div>
                </div>
              </div>

              <!-- Scroll Area & Navigation Menu -->
              <div class="border p-4 rounded-xl space-y-3">
                <h3 class="font-bold">Scroll Area & Navigation Menu</h3>
                ${NavigationMenu({
        items: [
          { href: '#', label: 'Dokumentasi' },
          { href: '#', label: 'Fitur' },
          { href: '#', label: 'Kontak' },
        ],
      })}
                ${ScrollArea({
        className: 'h-24 bg-muted/20',
        children: `
                    <p class="p-2 text-sm">Baris 1 dari Scroll Area...</p>
                    <p class="p-2 text-sm">Baris 2 dari Scroll Area...</p>
                    <p class="p-2 text-sm">Baris 3 dari Scroll Area...</p>
                    <p class="p-2 text-sm">Baris 4 dari Scroll Area...</p>
                    <p class="p-2 text-sm">Baris 5 dari Scroll Area...</p>
                  `,
      })}
              </div>
            </section>
          </div>
        `,
    })}
    `,
  });

  return sidebarHtml;
}