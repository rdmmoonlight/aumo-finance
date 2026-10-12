import { Button } from '../components/ui/button.js';
import { Badge } from '../components/ui/badge.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card.js';
import { Input } from '../components/ui/input.js';
import { Label } from '../components/ui/label.js';
import { Textarea } from '../components/ui/textarea.js';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert.js';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar.js';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '../components/ui/breadcrumb.js';
import { Separator } from '../components/ui/separator.js';
import { Skeleton } from '../components/ui/skeleton.js';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table.js';

export function renderUiCatalogPage() {
  return `
    <div class="p-8 max-w-5xl mx-auto space-y-10 font-sans">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Katalog Komponen UI Statis (/__ui)</h1>
        <p class="text-muted-foreground text-sm mt-1">Menampilkan seluruh varian dari 12 komponen UI statis.</p>
      </div>

      <!-- 1. Button -->
      <section class="space-y-3 border p-4 rounded-xl">
        <h2 class="text-lg font-bold">1. Button</h2>
        <div class="flex flex-wrap items-center gap-3">
          ${Button({ variant: 'default', children: 'Default' })}
          ${Button({ variant: 'secondary', children: 'Secondary' })}
          ${Button({ variant: 'destructive', children: 'Destructive' })}
          ${Button({ variant: 'outline', children: 'Outline' })}
          ${Button({ variant: 'ghost', children: 'Ghost' })}
          ${Button({ variant: 'link', children: 'Link' })}
        </div>
        <div class="flex flex-wrap items-center gap-3 pt-2">
          ${Button({ size: 'sm', children: 'Small' })}
          ${Button({ size: 'default', children: 'Default Size' })}
          ${Button({ size: 'lg', children: 'Large' })}
          ${Button({ size: 'icon', children: '🚀' })}
          ${Button({ disabled: 'true', children: 'Disabled' })}
        </div>
      </section>

      <!-- 2. Badge -->
      <section class="space-y-3 border p-4 rounded-xl">
        <h2 class="text-lg font-bold">2. Badge</h2>
        <div class="flex flex-wrap gap-2">
          ${Badge({ variant: 'default', children: 'Default' })}
          ${Badge({ variant: 'secondary', children: 'Secondary' })}
          ${Badge({ variant: 'destructive', children: 'Destructive' })}
          ${Badge({ variant: 'outline', children: 'Outline' })}
        </div>
      </section>

      <!-- 3. Alert -->
      <section class="space-y-3 border p-4 rounded-xl">
        <h2 class="text-lg font-bold">3. Alert</h2>
        <div class="space-y-3">
          ${Alert({
            variant: 'default',
            children: `
              ${AlertTitle({ children: 'Informasi Penting' })}${AlertDescription({ children: 'Ini adalah tampilan Alert varian default.' })}
            `
          })}
          ${Alert({
            variant: 'destructive',
            children: `
              ${AlertTitle({ children: 'Peringatan Sistem' })}${AlertDescription({ children: 'Terjadi kesalahan sistem, silakan coba lagi.' })}
            `
          })}
        </div>
      </section>

      <!-- 4. Avatar -->
      <section class="space-y-3 border p-4 rounded-xl">
        <h2 class="text-lg font-bold">4. Avatar</h2>
        <div class="flex items-center gap-4">
          ${Avatar({
            children: AvatarImage({ src: 'https://github.com/shadcn.png', alt: '@shadcn' })
          })}
          ${Avatar({
            children: AvatarFallback({ children: 'CN' })
          })}
        </div>
      </section>

      <!-- 5. Breadcrumb -->
      <section class="space-y-3 border p-4 rounded-xl">
        <h2 class="text-lg font-bold">5. Breadcrumb</h2>
        ${Breadcrumb({
          children: `
            ${BreadcrumbItem({ children: BreadcrumbLink({ href: '#', children: 'Beranda' }) })}
            ${BreadcrumbSeparator({})}${BreadcrumbItem({ children: BreadcrumbLink({ href: '#', children: 'Komponen' }) })}
            ${BreadcrumbSeparator({})}${BreadcrumbItem({ children: 'Katalog UI' })}
          `
        })}
      </section>

      <!-- 6. Card & Form Inputs -->
      <section class="space-y-3 border p-4 rounded-xl">
        <h2 class="text-lg font-bold">6, 7, 8, 9. Card, Label, Input, Textarea</h2>
        ${Card({
          children: `
            ${CardHeader({
              children: `
                ${CardTitle({ children: 'Formulir Pengguna' })}
                ${CardDescription({ children: 'Lengkapi formulir di bawah ini.' })}
              `
            })}
            ${CardContent({
              children: `
                <div class="space-y-4">
                  <div class="space-y-1.5">
                    ${Label({ htmlFor: 'email-input', children: 'Email' })}
                    ${Input({ id: 'email-input', type: 'email', placeholder: 'nama@domain.com' })}
                  </div>
                  <div class="space-y-1.5">
                    ${Label({ htmlFor: 'catatan', children: 'Catatan' })}
                    ${Textarea({ id: 'catatan', placeholder: 'Tuliskan catatan tambahan di sini...' })}
                  </div>
                </div>
              `
            })}
            ${CardFooter({
              children: Button({ children: 'Kirim Data' })
            })}
          `
        })}
      </section>

      <!-- 10. Separator -->
      <section class="space-y-3 border p-4 rounded-xl">
        <h2 class="text-lg font-bold">10. Separator</h2>
        <div class="space-y-2">
          <p class="text-sm">Bagian Atas</p>
          ${Separator({ orientation: 'horizontal' })}
          <p class="text-sm">Bagian Bawah</p>
        </div>
        <div class="flex items-center gap-4 h-5 pt-2">
          <span class="text-sm">Kiri</span>
          ${Separator({ orientation: 'vertical' })}
          <span class="text-sm">Kanan</span>
        </div>
      </section>

      <!-- 11. Skeleton -->
      <section class="space-y-3 border p-4 rounded-xl">
        <h2 class="text-lg font-bold">11. Skeleton</h2>
        <div class="flex items-center space-x-4">
          ${Skeleton({ className: 'h-12 w-12 rounded-full' })}
          <div class="space-y-2">
            ${Skeleton({ className: 'h-4 w-[250px]' })}
            ${Skeleton({ className: 'h-4 w-[200px]' })}
          </div>
        </div>
      </section>

      <!-- 12. Table -->
      <section class="space-y-3 border p-4 rounded-xl">
        <h2 class="text-lg font-bold">12. Table</h2>
        ${Table({
          children: `
            ${TableHeader({
              children: TableRow({
                children: `
                  ${TableHead({ children: 'Status' })}
                  ${TableHead({ children: 'Komponen' })}
                  ${TableHead({ children: 'Format' })}
                `
              })
            })}
            ${TableBody({
              children: `
                ${TableRow({
                  children: `
                    ${TableCell({ children: Badge({ variant: 'default', children: 'Selesai' }) })}
                    ${TableCell({ children: 'Button, Input, Card, dll.' })}${TableCell({ children: 'JS + CVA' })}
                  `
                })}
                ${TableRow({
                  children: `
                    ${TableCell({ children: Badge({ variant: 'secondary', children: 'Aktif' }) })}
                    ${TableCell({ children: 'Catalog Page' })}${TableCell({ children: 'src/pages/ui-catalog.js' })}
                  `
                })}
              `
            })}
          `
        })}
      </section>
    </div>
  `;
}
